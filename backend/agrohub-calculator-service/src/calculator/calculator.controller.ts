import {
  Body,
  Controller,
  BadRequestException,
  Post,
} from '@nestjs/common';

import { CalcReqDto } from './dto/calc.dto';
import { CalculatorService } from './calculator.service';

@Controller('calculator')
export class CalculatorController {
  constructor(private readonly calcService: CalculatorService) {}

  @Post('economics')
  async getEconomics(@Body() dto: CalcReqDto) {
    if (!dto.cultureId || !dto.area) {
      throw new BadRequestException('Параметры культура и площадь обязательны');
    }

    return this.calcService.calculateEconomics(dto);
  }
}
