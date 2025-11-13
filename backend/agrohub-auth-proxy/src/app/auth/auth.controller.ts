import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { KeycloakService } from '../../infrastructure/keycloak/keycloak.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly keycloakService: KeycloakService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login via Keycloak and get access token' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Access and refresh token returned',
  })
  async login(@Body() loginDto: LoginDto) {
    return await this.keycloakService.login(
      loginDto.username,
      loginDto.password,
    );
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Refresh Keycloak access token using refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'New access token returned' })
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return await this.keycloakService.refreshToken(refreshDto.refreshToken);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user via Keycloak' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 409,
    description: 'User already exists',
  })
  async register(@Body() registerDto: RegisterDto) {
    return await this.keycloakService.register(
      registerDto.username,
      registerDto.email,
      registerDto.password,
      registerDto.firstName,
      registerDto.lastName,
    );
  }
}