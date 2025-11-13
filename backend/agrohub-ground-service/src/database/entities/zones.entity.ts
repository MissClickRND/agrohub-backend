import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'zones', synchronize: false })
export class ZoneEntity {
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
}
