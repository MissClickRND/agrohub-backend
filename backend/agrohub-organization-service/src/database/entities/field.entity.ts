import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrgEntity } from './org.entity';


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

  @ManyToOne(() => OrgEntity, (org) => org.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orgId' })
  org: OrgEntity;
}
