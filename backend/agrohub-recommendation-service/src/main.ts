import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');


  const config = new DocumentBuilder()
    .setTitle('ArgoHub recommendation REST API')
    .setDescription('API description')
    .setVersion('0.1')
    //.addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  const configService = app.get(ConfigService);


  console.log(`🚀 Ollama proxy server running on port ${port}`);
  console.log(`📡 Ollama URL: ${configService.get('OLLAMA_BASE_URL')}`);
  console.log(`🤖 Default model: ${configService.get('OLLAMA_DEFAULT_MODEL')}`);
}

bootstrap();
