import { Module } from '@nestjs/common';
import { GroundController } from './ground.controller';
import { GroundService } from './ground.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroundEntity } from 'src/database/entities/ground.entity';
import { ZoneEntity } from 'src/database/entities/zones.entity';
import { OrgEntity } from 'src/database/entities/org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ZoneEntity, GroundEntity, OrgEntity])],
  controllers: [GroundController],
  providers: [GroundService],
})
export class GroundModule {}
