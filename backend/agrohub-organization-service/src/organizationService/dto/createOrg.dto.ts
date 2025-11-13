import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrgReqDto {
  @ApiProperty()
  @IsString()
  name: string;
}
