import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZoneEntity } from './zones.entity';
import { FieldEntity } from './fields.entity';

@Entity({ name: 'organization'})
export class OrgEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  @Index({ unique: true })
  name: string;

  @Column({ name: 'userId' })
  userId: string;

  @OneToMany(() => ZoneEntity, (zone) => zone.org, { cascade: true })
  zones: ZoneEntity[];

  @OneToMany(() => FieldEntity, (field) => field.org, { cascade: true })
  fields: FieldEntity[];
}
