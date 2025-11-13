import { Injectable, UnauthorizedException } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KeycloakService {
  private readonly keycloakUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private configService: ConfigService) {
    this.keycloakUrl = `${this.configService.get<string>('KC_HOST')}/realms/${this.configService.get<string>('KC_REALM')}/protocol/openid-connect`;
    this.clientId = this.configService.get<string>('KC_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('KC_CLIENT_SECRET')!;
  }

  async introspectToken(token: string) {
    try {
      const params = new URLSearchParams();

      console.log(token)

      params.append('token', token);
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      
      const response = await axios.post(`${this.keycloakUrl}/token/introspect`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
      
      if (!response.data.active) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      return response.data;
    } catch (err) {
      console.error(err);

      throw new UnauthorizedException('Token introspection failed');
    }
  }
}