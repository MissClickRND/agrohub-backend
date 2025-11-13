import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroundEntity } from 'src/database/entities/ground.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { OrgEntity } from 'src/database/entities/org.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { CultureEntity } from 'src/database/entities/culture.entity';
import { FieldEntity } from 'src/database/entities/fields.entity';
import { FieldsLogsEntity } from 'src/database/entities/fieldLogs.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ZoneEntity,
      GroundEntity,
      OrgEntity,
      CultureEntity,
      FieldEntity,
      FieldsLogsEntity,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
