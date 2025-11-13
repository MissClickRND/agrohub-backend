import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Put,
} from '@nestjs/common';
import { FieldsService } from './fields.service';
import { CreateFieldReqDto } from './dto/CreateFieldReq.dto';
import { CreateZoneReqDto } from './dto/CreateZoneReq.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('fields')
export class FieldsController {
  constructor(private readonly fieldService: FieldsService) {}

  @ApiOperation({ summary: 'Список полей' })
  @Get('list')
  async getAllFields(@Headers('x-user-id') userId: string) {
    return await this.fieldService.getAllFields(userId);
  }

  @ApiOperation({ summary: 'Создать поле' })
  @Put('create')
  async createField(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateFieldReqDto,
  ) {
    return this.fieldService.createField(dto, userId);
  }

  @ApiOperation({ summary: 'Получить поле по ID' })
  @Get('detail/:fieldId')
  async getFieldByID(
    @Headers('x-user-id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return await this.fieldService.getFieldById(fieldId, userId);
  }

  @ApiOperation({ summary: 'Удалить поле' })
  @Delete('delete/:fieldId')
  async deleteField(
    @Headers('x-user-id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return await this.fieldService.deleteField(fieldId, userId);
  }

  @ApiOperation({ summary: 'Создать участок' })
  @Put(':fieldId/create')
  async createZone(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateZoneReqDto,
    @Param('fieldId') fieldId: string,
  ) {
    return await this.fieldService.createZone(fieldId, dto, userId);
  }

  @ApiOperation({ summary: 'Список участков по полю' })
  @Get(':fieldId/zones/list')
  async getZonesByField(
    @Headers('x-user-id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    return await this.fieldService.getZonesByField(fieldId, userId);
  }

  @ApiOperation({ summary: 'Получить зону по ID' })
  @Get('zone/detail/:zoneId')
  async getZone(
    @Headers('x-user-id') userId: string,
    @Param('zoneId') zoneId: string,
  ) {
    return await this.fieldService.getZone(zoneId, userId);
  }

  @ApiOperation({ summary: 'Удалить зону' })
  @Delete('zone/delete/:zoneId')
  async deleteZone(
    @Headers('x-user-id') userId: string,
    @Param('zoneId') zoneId: string,
  ) {
    return await this.fieldService.deleteZone(zoneId, userId);
  }
}
