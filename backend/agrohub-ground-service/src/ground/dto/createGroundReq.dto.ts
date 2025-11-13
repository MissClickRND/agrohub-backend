import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsArray,
} from 'class-validator';

class GeoJsonPoint {
  @ApiProperty({ example: 'Point' })
  @IsString()
  @IsNotEmpty()
  type: 'Point';

  @ApiProperty()
  @IsArray()
  @ArrayMinSize(2)
  @IsNumber({}, { each: true })
  @IsNotEmpty()
  coordinates: [number, number];
}

export class CreateGroundReqDto {
//   @ApiProperty()
//   @IsString()
//   @IsNotEmpty()
//   zoneId: string;

  @ApiProperty()
  @IsNumber()
  N: number;

  @ApiProperty()
  @IsNumber()
  P: number;

  @ApiProperty()
  @IsNumber()
  K: number;

  @ApiProperty()
  @IsNumber()
  Temperature: number;

  @ApiProperty()
  @IsNumber()
  Humidity: number;

  @ApiProperty()
  @IsNumber()
  pH: number;

  @ApiProperty()
  @IsNumber()
  RainFall: number;

  @ApiProperty()
  @IsNotEmpty()
  @Type(() => Date)
  createdAt: Date;

  @ApiProperty({ type: () => GeoJsonPoint })
  @ValidateNested()
  @Type(() => GeoJsonPoint)
  location: GeoJsonPoint;
}