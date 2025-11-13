import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FieldsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getFieldData(fieldId: number): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.configService.get<string>('AGROHUB_FIELDS_PROXY')}/api/fields/detail/${fieldId}`,
        ),
      );

      if (!response.data) {
        throw new HttpException(
          'Empty response from field microservice',
          HttpStatus.NO_CONTENT,
        );
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching field data:', error.message);

      throw new HttpException(
        error.response?.data?.message || 'Failed to fetch field data',
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
