import { Module } from '@nestjs/common';
import { ProxyModule } from './app/proxy/proxy.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), ProxyModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
