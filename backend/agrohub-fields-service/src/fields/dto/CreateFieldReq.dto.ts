import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class GeoJsonPolygon {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: 'Polygon';

  @ApiProperty()
  @IsNotEmpty()
  coordinates: number[][][];
}

export class CreateFieldReqDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => GeoJsonPolygon)
  geometry: GeoJsonPolygon;

  @ApiProperty()
  @IsString()
  @IsOptional()
  color?: string;
}
