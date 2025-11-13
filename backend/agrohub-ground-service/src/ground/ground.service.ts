import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroundEntity } from 'src/database/entities/ground.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';

import { Repository, DataSource } from 'typeorm';
import { CreateGroundReqDto } from './dto/createGroundReq.dto';
import { OrgEntity } from 'src/database/entities/org.entity';

@Injectable()
export class GroundService {
  constructor(
    @InjectRepository(ZoneEntity)
    private readonly zoneRepository: Repository<ZoneEntity>,
    @InjectRepository(GroundEntity)
    private readonly groundRepository: Repository<GroundEntity>,
    @InjectRepository(OrgEntity)
    private readonly orgRepository: Repository<OrgEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async getByZone(zoneId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      SELECT g.*
      FROM ground g
      INNER JOIN zones z ON z.id = g.zone_id
      WHERE g.zone_id = $1 AND z.org_id = $2
      ORDER BY g.created_at ASC;
    `;
    const result = await this.dataSource.query(query, [zoneId, org.id]);
    return result;
  }

  async createGround(dto: CreateGroundReqDto, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const findZoneQuery = `
      SELECT z.id
      FROM zones z
      WHERE z.org_id = $1
        AND ST_Intersects(z.geometry, ST_GeomFromGeoJSON($2))
      LIMIT 1;
    `;

    const zoneResult = await this.dataSource.query(findZoneQuery, [
      org.id,
      JSON.stringify(dto.location),
    ]);

    if (zoneResult.length === 0) {
      throw new BadRequestException('Точка не находится ни в одной зоне вашей организации');
    }

    const zoneId = zoneResult[0].id;

    const insertQuery = `
      INSERT INTO ground (
        "N", "P", "K", "Temperature", "Humidity", "pH", "Rainfall",
        "location", "created_at", "zone_id"
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        ST_GeomFromGeoJSON($8), $9, $10
      )
      RETURNING
        id,
        "N", "P", "K", "Temperature", "Humidity", "pH", "Rainfall",
        "created_at",
        "zone_id",
        ST_AsGeoJSON("location")::json AS "location";
    `;

    const result = await this.dataSource.query(insertQuery, [
      dto.N,
      dto.P,
      dto.K,
      dto.Temperature,
      dto.Humidity,
      dto.pH,
      dto.RainFall,
      JSON.stringify(dto.location),
      dto.createdAt,
      zoneId,
    ]);

    return result[0];
  }

  async deleteGround(groundId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const result = await this.dataSource.query(
      `DELETE FROM ground g
       USING zones z
       WHERE g.id = $1
         AND g.zone_id = z.id
         AND z.org_id = $2
       RETURNING g.id`,
      [groundId, org.id],
    );

    if (!result.length) {
      throw new NotFoundException('Ground record not found or not owned by your organization');
    }

    return { message: 'Замер удален' };
  }

  async getByFieldId(fieldId: string, userId: string) {
    const org = await this.orgRepository.findOne({ where: { userId } });
    if (!org) {
      throw new BadRequestException('Organization not found for user');
    }

    const query = `
      SELECT
        f.id AS field_id,
        f.name AS field_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', z.id,
              'name', z.name,
              'grounds', COALESCE(g.grounds, '[]'::json)
            )
          ) FILTER (WHERE z.id IS NOT NULL),
          '[]'
        ) AS zones
      FROM fields f
      LEFT JOIN zones z ON z.field_id = f.id AND z.org_id = $2
      LEFT JOIN (
        SELECT
          g.zone_id,
          json_agg(
            json_build_object(
              'id', g.id,
              'N', g."N",
              'P', g."P",
              'K', g."K",
              'Temperature', g."Temperature",
              'Humidity', g."Humidity",
              'pH', g."pH",
              'Rainfall', g."Rainfall",
              'location', ST_AsGeoJSON(g.location)::json,
              'createdAt', g.created_at
            )
            ORDER BY g.created_at
          ) AS grounds
        FROM ground g
        INNER JOIN zones z2 ON z2.id = g.zone_id
        WHERE z2.org_id = $2
        GROUP BY g.zone_id
      ) g ON g.zone_id = z.id
      WHERE f.id = $1 AND f.org_id = $2
      GROUP BY f.id, f.name;
    `;

    const result = await this.dataSource.query(query, [fieldId, org.id]);
    if (!result.length) {
      throw new NotFoundException('Field not found or not owned by your organization');
    }

    return result[0];
  }
}