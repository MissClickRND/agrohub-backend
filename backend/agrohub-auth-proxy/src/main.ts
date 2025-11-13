import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Auth Proxy API')
    .setDescription('API for login and refresh tokens')
    .setVersion('1.0')
    .addTag('Auth')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  app.enableCors();
  app.setGlobalPrefix('/api')

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  console.log(`🚀 Auth proxy server running on port ${port}`);
}
bootstrap();
