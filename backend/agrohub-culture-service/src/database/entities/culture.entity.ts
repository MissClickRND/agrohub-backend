import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity({ name: 'Culture' })
export class CultureEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  @Index({ unique: true })
  name: string;

  @Column({ name: 'color', type: 'varchar', length: 7, default: '#3388FF' })
  color: string;
}