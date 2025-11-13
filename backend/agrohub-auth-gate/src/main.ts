import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Keycloak Auth Proxy')
    .setDescription('NestJS gateway that validates Keycloak tokens')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  app.enableCors();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Auth gate server running on port ${port}`);
}
bootstrap();
