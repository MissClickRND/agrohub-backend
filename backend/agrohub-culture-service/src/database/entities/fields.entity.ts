import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZoneEntity } from './zones.entity';

@Entity({ name: 'fields', synchronize: false })
export class FieldEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'geometry' })
  geometry: string;

  @Column({ type: 'float' })
  area?: number;

  @Column({ default: '3388FF' })
  color?: string;

  @OneToMany(() => ZoneEntity, (zone) => zone.field, { cascade: true })
  zones: ZoneEntity[];
}
