import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity({ name: 'culture', synchronize: false })
export class CultureEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  @Index({ unique: true })
  name: string;

  @Column({ name: 'color', type: 'varchar', length: 7, default: '#3388FF' })
  color: string;

  @Column({ name: 'yield_t_per_ha', type: 'decimal', precision: 5, scale: 2 })
  yield_t_per_ha: number;

  @Column({ name: 'price_product_rub_per_t', type: 'integer' })
  price_product_rub_per_t: number;

  @Column({ name: 'seed_rate_kg_per_ha', type: 'integer' })
  seed_rate_kg_per_ha: number;

  @Column({ name: 'seed_price_rub_per_kg', type: 'integer' })
  seed_price_rub_per_kg: number;

  @Column({ name: 'nitrogen_kg_per_ha', type: 'integer' })
  nitrogen_kg_per_ha: number;

  @Column({ name: 'phosphorus_kg_per_ha', type: 'integer' })
  phosphorus_kg_per_ha: number;

  @Column({ type: 'integer', comment: 'K₂O, кг/га' })
  potassium_kg_per_ha: number;
}