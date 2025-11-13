import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FieldEntity } from 'src/database/entities/fields.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { OrgEntity } from 'src/database/entities/org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity, ZoneEntity, OrgEntity])],
  controllers: [FieldsController],
  providers: [FieldsService],
})
export class FieldsModule {}
