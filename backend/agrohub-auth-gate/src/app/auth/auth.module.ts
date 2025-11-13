import { Module } from '@nestjs/common';
import { KeycloakService } from '../../infrastructure/keycloak/keycloak.service';
import { KeycloakAuthGuard } from '../../common/guards/keycloak.guard';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [KeycloakService, KeycloakAuthGuard],
  exports: [KeycloakService, KeycloakAuthGuard],
})
export class AuthModule {}
