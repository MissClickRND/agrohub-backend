import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GptController } from './gpt.controller';
import { OllamaService } from '../../instrastucture/ollama/ollama.service';
import { FieldsService } from '../../instrastucture/fields-service/fields.service';

@Module({
  imports: [HttpModule],
  controllers: [GptController],
  providers: [OllamaService, FieldsService],
})
export class GptModule {}
