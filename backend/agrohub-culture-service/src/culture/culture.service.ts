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

import { Repository, DataSource } from 'typeorm';
import { CreateLogReqDto } from './dto/createLog.dto';
import { UpdateLogReqDto } from './dto/updateLog.dto';
import { OrgEntity } from 'src/database/entities/org.entity';

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
    private readonly cultureRepository: Repository<CultureEntity>,
    @InjectRepository(OrgEntity)
    private readonly orgRepository: Repository<OrgEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createRotation(dto: CreateLogReqDto, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const zone = await this.zoneRepository.findOne({
      where: { id: dto.zoneId, org: { id: org.id } },
    });
    if (!zone) {
      throw new NotFoundException('Zone not found or not owned by your organization');
    }

    const culture = await this.cultureRepository.findOneBy({
      id: dto.cultureId,
    });
    if (!culture) {
      throw new NotFoundException(`Culture with ID "${dto.cultureId}" not found`);
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
    return await this.cultureRepository.find({
      select: { id: true, name: true, color: true },
    });
  }

  async getLogsByZoneId(zoneId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId, org: { id: org.id } },
      relations: ['field'],
    });
    if (!zone) {
      throw new NotFoundException('Zone not found or not owned by your organization');
    }

    const logs = await this.fieldsLogsRepository.find({
      where: { zone: { id: zoneId } },
      relations: ['culture'],
      order: { createdAt: 'ASC' },
    });

    const result: GanttItem[] = [];
    result.push({ id: zone.id, text: zone.name, type: 'summary' });

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

  async findLatestByZoneId(zoneId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const zone = await this.zoneRepository.findOne({
      where: { id: zoneId, org: { id: org.id } },
    });
    if (!zone) return null;

    return this.fieldsLogsRepository.findOne({
      where: { zone: { id: zoneId } },
      relations: ['culture'],
      order: { createdAt: 'DESC' },
    });
  }

  async deleteLog(logId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const result = await this.dataSource.query(
      `DELETE FROM fields_logs fl
       USING zones z
       WHERE fl.id = $1
         AND fl.zone_id = z.id
         AND z.org_id = $2
       RETURNING fl.id`,
      [logId, org.id],
    );

    if (!result.length) {
      throw new NotFoundException('Log not found or not owned by your organization');
    }

    return { message: 'Лог удален' };
  }

  async updateLogById(logId: string, dto: UpdateLogReqDto, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const cultureExists = await this.cultureRepository.exist({
      where: { id: dto.cultureId },
    });
    if (!cultureExists) {
      throw new NotFoundException(`Culture with ID "${dto.cultureId}" not found`);
    }

    const logExists = await this.dataSource.query(
      `SELECT 1
       FROM fields_logs fl
       JOIN zones z ON z.id = fl.zone_id
       WHERE fl.id = $1 AND z.org_id = $2`,
      [logId, org.id],
    );

    if (!logExists.length) {
      throw new NotFoundException('Log not found or not owned by your organization');
    }

    const updateData = {
      culture: { id: dto.cultureId } as CultureEntity,
      createdAt: dto.createdAt,
      endAt: dto.endAt,
    };

    await this.fieldsLogsRepository.update({ id: logId }, updateData);

    return this.fieldsLogsRepository.findOne({
      where: { id: logId },
      relations: ['culture'],
    });
  }

  async getLogsByFieldId(fieldId: string, userId: string): Promise<GanttItem[]> {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const zones = await this.zoneRepository.find({
      where: { field: { id: fieldId }, org: { id: org.id } },
      select: { id: true, name: true },
    });

    if (zones.length === 0) {
      throw new NotFoundException('Field not found or not owned by your organization');
    }

    const result: GanttItem[] = [];

    for (const zone of zones) {
      const logs = await this.fieldsLogsRepository.find({
        where: { zone: { id: zone.id } },
        relations: ['culture'],
        order: { createdAt: 'ASC' },
      });

      if (logs.length === 0) {
        const now = new Date();
        result.push({
          id: zone.id,
          text: zone.name,
          type: 'summary',
          start: now,
          end: new Date(now.getTime() + 24 * 60 * 60),
        });
      } else {
        result.push({ id: zone.id, text: zone.name, type: 'summary' });
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