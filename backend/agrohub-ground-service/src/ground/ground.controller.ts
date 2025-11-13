import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { GroundService } from './ground.service';
import { ApiOperation } from '@nestjs/swagger';
import { CreateGroundReqDto } from './dto/createGroundReq.dto';

@Controller('ground')
export class GroundController {
  constructor(private readonly groundService: GroundService) {}

  @ApiOperation({ summary: 'Создать новый отчет' })
  @Put('create')
  async createGround(@Body() dto: CreateGroundReqDto) {
    return await this.groundService.createGround(dto);
  }

  @ApiOperation({ summary: 'Получить по Зоне' })
  @Get(':zoneId/getzone')
  async getByZoneId(@Param('zoneId') zoneId: string) {
    return await this.groundService.getByZone(zoneId);
  }

  @ApiOperation({ summary: 'Создать новый отчет' })
  @Delete(':groundId/delete')
  async deleteById(@Param('groundId') groundId: string) {
    return await this.groundService.deleteGround(groundId);
  }

  @ApiOperation({ summary: 'Получить по Зоне' })
  @Get(':fieldId/list')
  async getByFieldId(@Param('fieldId') fieldId: string) {
    return await this.groundService.getByFieldId(fieldId);
  }
}
