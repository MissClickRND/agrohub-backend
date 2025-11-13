import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CultureService } from './culture.service';
import { CreateLogReqDto } from './dto/createLog.dto';
import { ApiOperation } from '@nestjs/swagger';
import { UpdateLogReqDto } from './dto/updateLog.dto';

@Controller('culture')
export class CultureController {
  constructor(private readonly cultureService: CultureService) {}

  @ApiOperation({ summary: 'Получить логи по полю' })
  @Get(':fieldId/list')
  async getLogsByFieldId(@Param('fieldId') fieldId: string) {
    return await this.cultureService.getLogsByFieldId(fieldId);
  }

  @ApiOperation({ summary: 'Создать новый лог' })
  @Put('create')
  async createNewLog(@Body() dto: CreateLogReqDto) {
    return await this.cultureService.createRotation(dto);
  }

  @ApiOperation({ summary: 'Получить логи по зоне' })
  @Get(':zoneId/logs')
  async getByZoneID(@Param('zoneId') zoneId: string) {
    return this.cultureService.getLogsByZoneId(zoneId);
  }

  @ApiOperation({ summary: 'Получить список культуры' })
  @Get('list')
  async getCultureList() {
    return await this.cultureService.getAllCultures();
  }

  @ApiOperation({ summary: 'Удалить лог' })
  @Delete('delete/:logId')
  async deleteLog(@Param('logId') logId: string) {
    return this.cultureService.deleteLog(logId);
  }

  @ApiOperation({ summary: 'Обновить лог' })
  @Post('update/:logId')
  async UpdateLog(@Param('logId') logId: string, @Body() dto: UpdateLogReqDto) {
    return await this.cultureService.updateLogById(logId, dto)
  }
}
