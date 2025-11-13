import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CultureEntity } from 'src/database/entities/culture.entity';
import { FieldEntity } from 'src/database/entities/fields.entity';
import { FieldsLogsEntity } from 'src/database/entities/fieldsLogs.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { Repository, DataSource, In } from 'typeorm';
import { CreateLogReqDto } from './dto/createLog.dto';
import { UpdateLogReqDto } from './dto/updateLog.dto';

export interface GanttItem {
  id: string;
  text: string;
  type: 'summary' | 'task';
  start?: Date;
  end?: Date | null;
  parent?: string;
}

@Injectable()
export class CultureService {
  constructor(
    @InjectRepository(FieldsLogsEntity)
    private readonly fieldsLogsRepository: Repository<FieldsLogsEntity>,
    @InjectRepository(ZoneEntity)
    private readonly zoneRepository: Repository<ZoneEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(CultureEntity)
    private readonly CultureRepository: Repository<CultureEntity>,
    private readonly dataSourсe: DataSource,
  ) {}

  async createRotation(dto: CreateLogReqDto) {
    const culture = await this.CultureRepository.findOneBy({
      id: dto.cultureId,
    });

    if (!culture) {
      throw new NotFoundException(`Crop with ID "${dto.cultureId}" not found`);
    }

    const rotation = this.fieldsLogsRepository.create({
      zone: { id: dto.zoneId },
      culture: { id: dto.cultureId },
      createdAt: dto.createdAt,
      endAt: dto.endAt,
    });

    return this.fieldsLogsRepository.save(rotation);
  }

  async getAllCultures() {
    return await this.CultureRepository.find({
      select: { id: true, name: true, color: true },
    });
  }

  async getLogsByZoneId(zoneId: string) {
    const zone = await this.zoneRepository.findOneBy({ id: zoneId });
    if (!zone) {
      throw new NotFoundException(`Zone with ID "${zoneId}" not found`);
    }

    const logs = await this.fieldsLogsRepository.find({
      where: { zone: { id: zoneId } },
      relations: ['culture'],
      order: { createdAt: 'ASC' },
    });

    const result: GanttItem[] = [];

    result.push({
      id: zone.id,
      text: zone.name,
      type: 'summary',
    });

    for (const log of logs) {
      result.push({
        id: log.id,
        text: log.culture?.name || 'Без культуры',
        start: new Date(log.createdAt),
        end: log.endAt ? new Date(log.endAt) : null,
        parent: zone.id,
        type: 'task',
      });
    }

    return result;
  }

  async findLatestByZoneId(zoneId: string) {
    return this.fieldsLogsRepository.findOne({
      where: { zone: { id: zoneId } },
      relations: ['culture'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteLog(logId: string) {
    const result = await this.fieldsLogsRepository.delete({ id: logId });
    if (result) {
      return { message: 'Лог удален' };
    }
  }

  async updateLogById(logId: string, dto: UpdateLogReqDto) {
    const cultureExists = await this.CultureRepository.exist({
      where: { id: dto.cultureId },
    });
    if (!cultureExists) {
      throw new NotFoundException(
        `Culture with ID "${dto.cultureId}" not found`,
      );
    }

    const updateData = {
      culture: { id: dto.cultureId } as CultureEntity,
      createdAt: dto.createdAt,
      endAt: dto.endAt,
    };

    const result = await this.fieldsLogsRepository.update(
      { id: logId },
      updateData,
    );

    if (result.affected === 0) {
      throw new NotFoundException(`Log with ID "${logId}" not found`);
    }

    return this.fieldsLogsRepository.findOne({
      where: { id: logId },
      relations: ['culture'],
    });
  }

  async getLogsByFieldId(fieldId: string): Promise<GanttItem[]> {
    const zones = await this.zoneRepository.find({
      where: { field: { id: fieldId } },
      select: { id: true, name: true },
    });

    if (zones.length === 0) {
      return [];
    }

    const result: GanttItem[] = [];

    for (const zone of zones) {
      const logs = await this.fieldsLogsRepository.find({
        where: { zone: { id: zone.id } },
        relations: ['culture'],
        order: { createdAt: 'ASC' },
      });

      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      if (logs.length === 0) {
        result.push({
          id: zone.id,
          text: zone.name,
          type: 'summary',
          start: now,
          end: tomorrow,
        });
      } else {
        result.push({
          id: zone.id,
          text: zone.name,
          type: 'summary',
        });

        for (const log of logs) {
          result.push({
            id: log.id,
            text: log.culture?.name || 'Без культуры',
            start: new Date(log.createdAt),
            end: log.endAt ? new Date(log.endAt) : null,
            parent: zone.id,
            type: 'task',
          });
        }
      }
    }

    return result;
  }
}
