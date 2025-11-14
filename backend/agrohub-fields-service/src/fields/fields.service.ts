import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FieldEntity } from 'src/database/entities/fields.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { OrgEntity } from 'src/database/entities/org.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateFieldReqDto } from './dto/CreateFieldReq.dto';
import { CreateZoneReqDto } from './dto/CreateZoneReq.dto';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(FieldEntity)
    private readonly fieldRepository: Repository<FieldEntity>,
    @InjectRepository(ZoneEntity)
    private readonly zoneRepository: Repository<ZoneEntity>,
    @InjectRepository(OrgEntity)
    private readonly orgRepository: Repository<OrgEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async createField(dto: CreateFieldReqDto, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      INSERT INTO fields (name, geometry, area, color, org_id)
      VALUES (
        $1,
        ST_GeomFromGeoJSON($2),
        ST_Area(ST_GeomFromGeoJSON($2)::geography),
        $3,
        $4
      )
      RETURNING
        id, 
        name,
        color,
        area / 10000 as area,
        ST_AsGeoJSON(geometry)::json AS geometry;
    `;
    const result = await this.dataSource.query(query, [
      dto.name,
      dto.geometry,
      dto.color,
      org.id,
    ]);
    return result[0];
  }

  async createZone(fieldId: string, dto: CreateZoneReqDto, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const field = await this.fieldRepository.findOne({
      where: { id: fieldId, org: { id: org.id } },
    });
    if (!field)
      throw new NotFoundException(
        'Field not found or not owned by organization',
      );

    const query = `
      INSERT INTO zones (field_id, org_id, name, geometry, area, color)
      VALUES (
        $1,
        $2,
        $3,
        ST_GeomFromGeoJSON($4),
        ST_Area(ST_GeomFromGeoJSON($4)::geography),
        $5
      )
      RETURNING 
        id, 
        name,
        color,
        area / 10000 as area,
        ST_AsGeoJSON(geometry)::json AS geometry;
    `;
    const result = await this.dataSource.query(query, [
      fieldId,
      org.id,
      dto.name,
      dto.geometry,
      dto.color,
    ]);
    return result[0];
  }

  async getAllFields(userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      SELECT 
        f.id,
        f.name,
        f.area,
        f.color,
        ST_AsGeoJSON(f.geometry)::json AS geometry,
        COALESCE(
          json_agg(
            json_build_object(
              'id', z.id,
              'name', z.name,
              'area', z.area,
              'color', z.color,
              'geometry', ST_AsGeoJSON(z.geometry)::json
            )
          ) FILTER (WHERE z.id IS NOT NULL),
          '[]'
        ) AS zones
      FROM fields f
      LEFT JOIN zones z ON z.field_id = f.id
      WHERE f.org_id = $1
      GROUP BY f.id, f.name, f.area, f.geometry;
    `;
    const result = await this.dataSource.query(query, [org.id]);
    return result;
  }

  async getFieldById(fieldId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      SELECT 
        f.id,
        f.name,
        f.area,
        f.color,
        ST_AsGeoJSON(f.geometry)::json AS geometry,
        COALESCE(
          json_agg(
            json_build_object(
              'id', z.id,
              'name', z.name,
              'area', z.area,
              'color', z.color,
              'geometry', ST_AsGeoJSON(z.geometry)::json
            )
          ) FILTER (WHERE z.id IS NOT NULL),
          '[]'
        ) AS zones
      FROM fields f
      LEFT JOIN zones z ON z.field_id = f.id
      WHERE f.id = $1 AND f.org_id = $2
      GROUP BY f.id, f.name, f.area, f.geometry;
    `;
    const result = await this.dataSource.query(query, [fieldId, org.id]);
    if (!result.length) {
      throw new NotFoundException('Field not found');
    }
    return result[0];
  }

  async getZonesByField(fieldId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      SELECT z.id, z.name, z.area, z.color, ST_AsGeoJSON(z.geometry)::json AS geometry
      FROM zones z
      WHERE z.field_id = $1 AND z.org_id = $2
    `;
    const result = await this.dataSource.query(query, [fieldId, org.id]);

    return result;
  }

  async getZone(zoneId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      SELECT z.id, z.name, z.area, z.color, ST_AsGeoJSON(z.geometry)::json AS geometry
      FROM zones z
      WHERE z.id = $1 AND z.org_id = $2
    `;
    const result = await this.dataSource.query(query, [zoneId, org.id]);
    if (!result.length) {
      throw new NotFoundException('Zone not found');
    }
    return result[0];
  }

  async deleteField(fieldId: string, userId: string): Promise<void> {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const result = await this.dataSource.query(
      `DELETE FROM fields WHERE id = $1 AND org_id = $2 RETURNING id`,
      [fieldId, org.id],
    );

    if (!result.length) {
      throw new NotFoundException(`Field with id ${fieldId} not found`);
    }
  }

  async deleteZone(zoneId: string, userId: string): Promise<void> {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const result = await this.dataSource.query(
      `DELETE FROM zones WHERE id = $1 AND org_id = $2 RETURNING id`,
      [zoneId, org.id],
    );

    if (!result.length) {
      throw new NotFoundException(`Zone with id ${zoneId} not found`);
    }
  }
}
