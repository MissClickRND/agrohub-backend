import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Put,
  BadRequestException,
} from '@nestjs/common';

import { ApiOperation, ApiHeader } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('get')
  async getDashBoard(@Headers('x-user-id') userId: string) {
    const countFields = await this.dashboardService.countFields(userId);
    const countZones = await this.dashboardService.countZones(userId);
    const averageZone = countZones / countFields;
    const countCulture = await this.dashboardService.getCountCulture(userId);
    const areaByField = await this.dashboardService.getAreaByField(userId);

    const result = {
      countFields: countFields,
      countZones: countZones,
      averageZone: averageZone,
      culture: countCulture,
      area: areaByField,
    };
    return result;
  }

  @Get('NPK/:fieldId')
  async getNPK(
    @Headers('x-user-id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return await this.dashboardService.getNPKByField(userId, fieldId)
  }
}
