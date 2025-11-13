import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { FieldEntity } from 'src/database/entities/field.entity';
import { OrgEntity } from 'src/database/entities/org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FieldEntity, OrgEntity])],
  controllers: [OrgController],
  providers: [OrgService],
})
export class OrgModule {}
