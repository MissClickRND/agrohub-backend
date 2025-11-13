import { ApiProperty } from '@nestjs/swagger';
import {IsNumber, IsString} from 'class-validator';

export class ChatMessage {
  @ApiProperty()
  @IsNumber()
  fieldId: number;

  @ApiProperty()
  @IsString()
  prompt: string;

  @ApiProperty()
  @IsString()
  model?: string;
}