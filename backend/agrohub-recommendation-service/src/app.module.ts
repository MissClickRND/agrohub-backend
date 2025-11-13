import { Module } from '@nestjs/common';
import { GptModule } from './app/gpt/gpt.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    GptModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
