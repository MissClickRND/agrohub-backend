import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CalcReqDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  area: number;

  @ApiProperty()
  @IsString()
  cultureId: string;
}
