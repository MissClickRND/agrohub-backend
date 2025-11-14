import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CultureEntity } from 'src/database/entities/culture.entity';
import { Repository, DataSource } from 'typeorm';
import { CalcReqDto } from './dto/calc.dto';

@Injectable()
export class CalculatorService {
  private readonly FERTILIZER_PRICES = {
    nitrogen: 40,
    phosphorus: 50,
    potassium: 45,
  };
  constructor(
    @InjectRepository(CultureEntity)
    private readonly cultureRepository: Repository<CultureEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async calculateEconomics(dto: CalcReqDto) {

    const crop = await this.cultureRepository.findOne({
      where: { id: dto.cultureId },
    });

    if (!crop) {
      throw new NotFoundException(`Культура "${dto.cultureId}" не найдена`);
    }

    const yieldTotal = crop.yield_t_per_ha * dto.area;
    const revenue = yieldTotal * crop.price_product_rub_per_t;

    const seedCost =
      crop.seed_rate_kg_per_ha * dto.area * crop.seed_price_rub_per_kg;

    const nitrogenCost =
      crop.nitrogen_kg_per_ha * dto.area * this.FERTILIZER_PRICES.nitrogen;
    const phosphorusCost =
      crop.phosphorus_kg_per_ha * dto.area * this.FERTILIZER_PRICES.phosphorus;
    const potassiumCost =
      crop.potassium_kg_per_ha * dto.area * this.FERTILIZER_PRICES.potassium;
    const fertilizerCost = nitrogenCost + phosphorusCost + potassiumCost;

    const totalCost = seedCost + fertilizerCost;
    const profit = revenue - totalCost;

    return {
      crop: crop.name,
      area_ha: dto.area,
      yield_t: parseFloat(yieldTotal.toFixed(2)),
      revenue_rub: Math.round(revenue),
      costs: {
        seeds_rub: Math.round(seedCost),
        fertilizers_rub: Math.round(fertilizerCost),
        nitrogen_rub: Math.round(nitrogenCost),
        phosphorus_rub: Math.round(phosphorusCost),
        potassium_rub: Math.round(potassiumCost),
        total_rub: Math.round(totalCost),
      },
      profit_rub: Math.round(profit),
      profit_per_ha_rub: Math.round(profit / dto.area),
    };
  }
}
