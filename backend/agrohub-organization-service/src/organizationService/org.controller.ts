import { Body, Controller, Headers, Put } from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgReqDto } from './dto/createOrg.dto';

@Controller('organization')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Put('create')
  async createOrg(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateOrgReqDto,
  ) {
    return await this.orgService.createOrg(userId, dto)
  }
}
