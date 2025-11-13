import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GroundEntity } from 'src/database/entities/ground.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateGroundReqDto } from './dto/createGroundReq.dto';

@Injectable()
export class GroundService {
  constructor(
    @InjectRepository(ZoneEntity)
    private readonly zoneRepository: Repository<ZoneEntity>,
    @InjectRepository(GroundEntity)
    private readonly groundRepository: Repository<GroundEntity>,
    private readonly dataSourсe: DataSource,
  ) {}

  async getByZone(zoneId: string) {
    const result = await this.groundRepository.find({
      where: { zone: { id: zoneId } },
      order: { createdAt: 'ASC' },
    });
    return result;
  }

  async createGround(dto: CreateGroundReqDto) {
    const findZoneQuery = `
    SELECT id
    FROM zones
    WHERE ST_Intersects(geometry, ST_GeomFromGeoJSON($1))
    LIMIT 1;
  `;

    const zoneResult = await this.dataSourсe.query(findZoneQuery, [
      JSON.stringify(dto.location),
    ]);

    if (zoneResult.length === 0) {
      throw new BadRequestException('Точка не находится ни в одной зоне');
    }

    const zoneId = zoneResult[0].id;

    const insertQuery = `
    INSERT INTO ground (
      "N",
      "P",
      "K",
      "Temperature",
      "Humidity",
      "pH",
      "Rainfall",
      "location",
      "created_at",
      "zone_id"
    )
    VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      ST_GeomFromGeoJSON($8),
      $9,
      $10
    )
    RETURNING
      id,
      "N",
      "P",
      "K",
      "Temperature",
      "Humidity",
      "pH",
      "Rainfall",
      "created_at",
      "zone_id",
      ST_AsGeoJSON("location")::json AS "location";
  `;

    const result = await this.dataSourсe.query(insertQuery, [
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

  async deleteGround(groundId: string) {
    const result = await this.groundRepository.delete({ id: groundId });
    if (result) {
      return { message: 'Замер удален' };
    }
  }

  async getByFieldId(fieldId: string) {
    const query = `SELECT
    f.id AS field_id,
    f.name AS field_name,
    json_agg(
    json_build_object(
            'id', z.id,
            'name', z.name,
            'grounds', COALESCE(g.grounds, '[]'::json)
    )
            ) FILTER (WHERE z.id IS NOT NULL) AS zones
FROM fields f
         LEFT JOIN zones z ON z.field_id = f.id
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
    GROUP BY g.zone_id
) g ON g.zone_id = z.id
WHERE f.id = $1
GROUP BY f.id, f.name, f.geometry, f.color, f.area;`;
    const result = await this.dataSourсe.query(query, [fieldId])
    console.log(result)
    return result[0] || null;
  }
}
