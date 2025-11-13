import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  BadRequestException,
} from '@nestjs/common';
import { CultureService } from './culture.service';
import { CreateLogReqDto } from './dto/createLog.dto';
import { UpdateLogReqDto } from './dto/updateLog.dto';
import { ApiOperation, ApiHeader } from '@nestjs/swagger';

@Controller('culture')
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @ApiOperation({ summary: 'Получить логи по полю' })
  @Get(':fieldId/list')
  async getLogsByFieldId(
    @Headers('x-user-id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.cultureService.getLogsByFieldId(fieldId, userId);
  }

  @ApiOperation({ summary: 'Создать новый лог' })
  @Put('create')
  async createNewLog(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateLogReqDto,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.cultureService.createRotation(dto, userId);
  }

  @ApiOperation({ summary: 'Получить логи по зоне' })
  @Get(':zoneId/logs')
  async getByZoneID(
    @Headers('x-user-id') userId: string,
    @Param('zoneId') zoneId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.cultureService.getLogsByZoneId(zoneId, userId);
  }

  @ApiOperation({ summary: 'Получить список культур' })
  @Get('list')
  async getCultureList() {
    return await this.cultureService.getAllCultures();
  }

  @ApiOperation({ summary: 'Удалить лог' })
  @Delete('delete/:logId')
  async deleteLog(
    @Headers('x-user-id') userId: string,
    @Param('logId') logId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return this.cultureService.deleteLog(logId, userId);
  }

  @ApiOperation({ summary: 'Обновить лог' })
  @Post('update/:logId')
  async updateLog(
    @Headers('x-user-id') userId: string,
    @Param('logId') logId: string,
    @Body() dto: UpdateLogReqDto,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.cultureService.updateLogById(logId, dto, userId);
  }
}