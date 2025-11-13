import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CultureEntity } from 'src/database/entities/culture.entity';
import { FieldsLogsEntity } from 'src/database/entities/fieldLogs.entity';
import { FieldEntity } from 'src/database/entities/fields.entity';
import { GroundEntity } from 'src/database/entities/ground.entity';
import { OrgEntity } from 'src/database/entities/org.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { Repository, DataSource } from 'typeorm';

type NPKData = {
  zone: string;
  N: number;
  P: number;
  K: number;
};

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(ZoneEntity)
    private readonly zoneRepository: Repository<ZoneEntity>,
    @InjectRepository(GroundEntity)
    private readonly groundRepository: Repository<GroundEntity>,
    @InjectRepository(OrgEntity)
    private readonly orgRepository: Repository<OrgEntity>,
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(FieldsLogsEntity)
    private readonly fieldLogsRepository: Repository<FieldsLogsEntity>,
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async countFields(userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const count = await this.fieldRepository.count({
      where: { org: { id: org.id } },
    });

    return count;
  }

  async countZones(userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const count = await this.zoneRepository.count({
      where: { org: { id: org.id } },
    });

    return count;
  }

  async getCountCulture(userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = this.fieldLogsRepository
      .createQueryBuilder('log')
      .innerJoin('log.zone', 'zone')
      .innerJoin('zone.org', 'org')
      .innerJoin('log.culture', 'culture')
      .select('culture.name', 'name')
      .addSelect('COUNT(*)', 'value')
      .addSelect('culture.color', 'color')
      .where('log.endAt IS NULL')
      .andWhere('org.id = :orgId', { orgId: org.id })
      .groupBy('culture.id, culture.name, culture.color');

    const result: Array<{ name: string; value: string; color: string }> =
      await query.getRawMany();

    return result.map((item) => ({
      name: item.name,
      value: parseInt(item.value, 10),
      color: item.color,
    }));
  }

  async getAreaByField(userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const fields = await this.fieldRepository.find({
      where: { org: { id: org.id } },
      relations: ['zones'],
    });

    const result = fields.map((field) => {
      const fieldData: any = { field: field.name };

      field.zones.forEach((zone) => {
        fieldData[zone.name] = zone.area;
      });

      return fieldData;
    });

    return result;
  }

  async getNPKByField(userId: string, fieldName: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const field = await this.fieldRepository.findOne({
      where: { name: fieldName, org: { id: org.id } },
      relations: ['zones'],
    });

    if (!field) {
      throw new NotFoundException(
        `Field "${fieldName}" not found in your organization`,
      );
    }

    const result: NPKData[] = [];

    for (const zone of field.zones) {
      const latestMeasurement = await this.groundRepository
        .createQueryBuilder('g')
        .where('g.zone.id = :zoneId', { zoneId: zone.id })
        .orderBy('g.createdAt', 'DESC')
        .take(1)
        .getOne();

      if (latestMeasurement) {
        result.push({
          zone: zone.name,
          N: latestMeasurement.N,
          P: latestMeasurement.P,
          K: latestMeasurement.K,
        });
      }
    }

    return result;
  }
}
