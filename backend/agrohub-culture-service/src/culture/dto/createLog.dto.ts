import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateLogReqDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  zoneId: string;

  @ApiProperty()
  @IsString()
  cultureId: string;

  @ApiProperty()
  @IsDate()
  createdAt: Date;

  @ApiProperty()
  @IsDate()
  endAt: Date;
}
