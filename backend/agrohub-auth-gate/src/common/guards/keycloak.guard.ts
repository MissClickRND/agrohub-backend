import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { KeycloakService } from '../../infrastructure/keycloak/keycloak.service';
import { Request } from 'express';

@Injectable()
export class KeycloakAuthGuard implements CanActivate {
  constructor(private readonly keycloakService: KeycloakService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (
      request.path.indexOf('/auth/login') !== -1 ||
      request.path.indexOf('/auth/refresh') !== -1
    ) {
      return true;
    }
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Missing or invalid Authorization header',
      );
    }
    
    const token = authHeader.split(' ')[1];
    
    const userInfo = await this.keycloakService.introspectToken(token);

    request.headers['x-user-id'] = userInfo.sub;
    request.headers['x-username'] = userInfo.preferred_username;
    request.headers['x-email'] = userInfo.email;

    (request as any).user = userInfo;

    return true;
  }
}
