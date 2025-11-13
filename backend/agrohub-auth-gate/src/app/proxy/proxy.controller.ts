import { Controller, All, Req, Res, UseGuards, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';
import { KeycloakAuthGuard } from '../../common/guards/keycloak.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @UseGuards(KeycloakAuthGuard)
  @ApiBearerAuth()
  @All(':service/*path')
  async handleProxy(
    @Param('service') service: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const data = await this.proxyService.forwardRequest(req, service);
    res.json(data);
  }
}
