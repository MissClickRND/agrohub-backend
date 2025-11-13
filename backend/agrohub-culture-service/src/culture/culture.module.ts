import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CultureEntity } from 'src/database/entities/culture.entity';
import { FieldsLogsEntity } from 'src/database/entities/fieldsLogs.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { CultureController } from './culture.controller';
import { CultureService } from './culture.service';
import { FieldEntity } from 'src/database/entities/fields.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CultureEntity,
      FieldsLogsEntity,
      ZoneEntity,
      FieldEntity,
    ]),
  ],
  controllers: [CultureController],
  providers: [CultureService],
})
export class CultureModule {}
