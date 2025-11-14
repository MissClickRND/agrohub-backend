import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CultureEntity } from './culture.entity';
import { ZoneEntity } from './zones.entity';

@Entity({ name: 'fieldsLogs',  synchronize: false  })
export class FieldsLogsEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @ManyToOne(() => ZoneEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'zone_id' })
  zone: ZoneEntity;

  @ManyToOne(() => CultureEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'culture_id' })
  culture: CultureEntity;

  @Column({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', name: 'ended_at', nullable: true })
  endAt: Date;
}
