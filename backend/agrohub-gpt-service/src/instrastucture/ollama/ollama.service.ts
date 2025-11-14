import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Observable, map, catchError, lastValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { FieldsService } from '../fields-service/fields.service';

@Injectable()
export class OllamaService {
  private readonly ollamaBaseUrl: string;
  private readonly defaultModel: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly fiedlsService: FieldsService,
  ) {
    this.ollamaBaseUrl = this.configService.get<string>('OLLAMA_BASE_URL')!;
    this.defaultModel = this.configService.get<string>('OLLAMA_DEFAULT_MODEL')!;
  }

  async generateResponse(
    prompt: string,
    model: string = this.defaultModel,
    fieldId: number,
  ): Promise<any> {
    const fieldInfo = this.fiedlsService.getFieldData(fieldId);

    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.ollamaBaseUrl}/api/generate`, {
          model,
          systemPromt: this.getSystemPromt(fieldInfo),
          prompt,
          stream: false,
        }),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Ollama API error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  generateStream(
    prompt: string,
    model: string = this.defaultModel,
    fieldId: number,
  ): Observable<any> {
    const fieldInfo = this.fiedlsService.getFieldData(fieldId);

    return this.httpService
      .post(
        `${this.ollamaBaseUrl}/api/generate`,
        {
          model,
          systemPromt: this.getSystemPromt(fieldInfo),
          prompt,
          stream: true,
        },
        { responseType: 'stream' },
      )
      .pipe(
        map((response) => response.data),
        catchError((error) => {
          throw new HttpException(
            `Ollama stream error: ${error.message}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }),
      );
  }

  async listModels(): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`${this.ollamaBaseUrl}/api/tags`),
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch models: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSystemPromt(fieldData: any): Promise<string> {
    return `
  Ты — агроном высшего порядка с глубокими знаниями в почвоведении, севообороте, агрохимии и растениеводстве.  
Отвечай строго и только как профессиональный агроном.

Если тебе предоставлены данные о поле (влажность, температура, культура, азот, фосфор, pH и т.п.),  
ты обязан сделать детальный агрономический анализ состояния почвы, дать заключение и рекомендации по уходу, удобрению и оптимальному севообороту.

Если вопрос не относится к агрономии, растениеводству, почвоведению, сельскому хозяйству или анализу состояния полей,  
вежливо откажись, сказав:
> «Извините, я могу отвечать только на вопросы, касающиеся агрономии и состояния полей.»

Ориентируйся на культуры севоборота РФ

Всегда отвечай **только на русском языке**, в профессиональном тоне, с использованием терминов агрономической практики.

Данные по полю: ${fieldData}
`;
  }
}
