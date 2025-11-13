import { Module } from '@nestjs/common';
import { KeycloakService } from '../../infrastructure/keycloak/keycloak.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [KeycloakService],
})
export class AuthModule {}
