import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { FieldEntity } from './field.entity';

@Entity({ name: 'organization', synchronize: false })
export class OrgEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: 'name' })
  @Index({ unique: true })
  name: string;

  @Column({ name: 'userId' })
  userId: string;

  @OneToMany(() => FieldEntity, (filed) => filed.org, { cascade: true })
  fields: FieldEntity[];
}
