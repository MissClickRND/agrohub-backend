import {
  Injectable,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
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

  async login(username: string, password: string) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'password');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(`${this.keycloakUrl}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (err: any) {
      console.log(err);

      if (err.status === 401) {
        throw new HttpException(
          err.response?.data || 'Login error',
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        err.response?.data || 'Keycloak error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async refreshToken(refreshToken: string) {
    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('client_id', this.clientId);
      params.append('client_secret', this.clientSecret);
      params.append('refresh_token', refreshToken);

      const response = await axios.post(`${this.keycloakUrl}/token`, params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      return response.data;
    } catch (err: any) {
      throw new HttpException(
        err.response?.data || 'Keycloak refresh token error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async register(
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ): Promise<{ message: string; userId: string }> {
    try {
      const adminToken = await this.getAdminToken();

      const existingUser = await this.findUserByUsername(username, adminToken);
      if (existingUser) {
        throw new ConflictException('User with this username already exists');
      }

      const createUserUrl = `${this.configService.get<string>('KC_HOST')}/admin/realms/${this.configService.get<string>('KC_REALM')}/users`;

      const userData = {
        username,
        email,
        emailVerified: true,
        enabled: true,
        firstName,
        lastName,
        credentials: [
          {
            type: 'password',
            value: password,
            temporary: false,
          },
        ],
      };

      const response = await axios.post(createUserUrl, JSON.stringify(userData), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new BadRequestException(`Failed to create user: ${response.status}`);
      }

      const locationHeader = response.headers['location'];
      const userId = locationHeader?.split('/').pop();

      return {
        message: 'User successfully registered',
        userId: userId || 'unknown',
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(`Registration failed: ${error.message}`);
    }
  }

  private async getAdminToken(): Promise<string> {
    const tokenUrl = `${this.configService.get<string>('KC_HOST')}/realms/master/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', 'admin-cli');
    params.append(
      'client_secret',
      this.configService.get('KC_ADMIN_CLIENT_SECRET')!,
    );

    const response = await axios.post(tokenUrl, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.data.access_token) {
      throw new Error('Failed to get admin token');
    }

    return response.data.access_token;
  }

  private async findUserByUsername(
    username: string,
    adminToken: string,
  ): Promise<any> {
    const searchUrl = `${this.configService.get<string>('KC_HOST')}/admin/realms/${this.configService.get<string>('KC_REALM')}/users?username=${encodeURIComponent(username)}`;

    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const users = await response.json();
    return users.length > 0 ? users[0] : null;
  }
}
