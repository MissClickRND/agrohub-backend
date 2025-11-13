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
import { GroundService } from './ground.service';
import { ApiOperation, ApiHeader } from '@nestjs/swagger';
import { CreateGroundReqDto } from './dto/createGroundReq.dto';

@Controller('ground')
export class GroundController {
  constructor(private readonly groundService: GroundService) {}

  @ApiOperation({ summary: 'Создать новый отчет' })
  @Put('create')
  async createGround(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateGroundReqDto,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.groundService.createGround(dto, userId);
  }

  @ApiOperation({ summary: 'Получить данные по зоне' })
  @Get(':zoneId/getzone')
  async getByZoneId(
    @Headers('x-user-id') userId: string,
    @Param('zoneId') zoneId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.groundService.getByZone(zoneId, userId);
  }

  @ApiOperation({ summary: 'Удалить отчет по ID' })
  @Delete(':groundId/delete')
  async deleteById(
    @Headers('x-user-id') userId: string,
    @Param('groundId') groundId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.groundService.deleteGround(groundId, userId);
  }

  @ApiOperation({ summary: 'Получить все замеры по полю' })
  @Get(':fieldId/list')
  async getByFieldId(
    @Headers('x-user-id') userId: string,
    @Param('fieldId') fieldId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('x-user-id header is required');
    }
    return await this.groundService.getByFieldId(fieldId, userId);
  }
}