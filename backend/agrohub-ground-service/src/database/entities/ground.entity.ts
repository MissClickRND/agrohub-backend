import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZoneEntity } from './zones.entity';

@Entity({ name: 'ground' })
export class GroundEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => ZoneEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: ZoneEntity;

  @Column({ type: 'float' })
  N: number;

  @Column({ type: 'float' })
  P: number;

  @Column({ type: 'float' })
  K: number;

  @Column({ type: 'float' })
  Temperature: number;

  @Column({ type: 'float' })
  Humidity: number;

  @Column({ type: 'float' })
  pH: number;

  @Column({ type: 'float' })
  Rainfall: number;

  @Column({ type: 'geometry', nullable: true })
  location: string;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}
