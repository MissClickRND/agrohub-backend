import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldEntity } from './fields.entity';
import { ZoneEntity } from './zones.entity';

@Entity({ name: 'organization', synchronize: false})
export class OrgEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  @Index({ unique: true })
  name: string;

  @Column({ name: 'userId' })
  userId: string;

  @OneToMany(() => FieldEntity, (field) => field.org, { cascade: true })
  fields: FieldEntity[];

  @OneToMany(() => ZoneEntity, (zone) => zone.org, { cascade: true })
  zones: ZoneEntity[];
}