import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldEntity } from './fields.entity';
import { OrgEntity } from './org.entity';

@Entity({ name: 'zones', synchronize: false })
export class ZoneEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => FieldEntity, (field) => field.zones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: FieldEntity;

  @ManyToOne(() => OrgEntity, (org) => org.zones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'org_id' })
  org: OrgEntity;

  @Column({ name: 'name' })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'geometry' })
  geometry: string;

  @Column({ type: 'float' })
  area?: number;

  @Column({ default: '3388FF' })
  color?: string;
}