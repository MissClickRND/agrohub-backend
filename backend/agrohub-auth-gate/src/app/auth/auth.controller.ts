import { Controller, Get, Headers, UseGuards, Req } from '@nestjs/common';
import { KeycloakAuthGuard } from '../../common/guards/keycloak.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('api/gate/me')
export class AuthController {
  @UseGuards(KeycloakAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  getProfile(@Req() req, @Headers() headers) {
    return {
      message: 'Access granted',
      user: req.user,
    };
  }
}
