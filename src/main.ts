import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
// import * as express from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.enableCors();

  app.setGlobalPrefix('api');
  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
  await app.listen(8000, "0.0.0.0");
  console.log(`Application is running on: http://localhost:8000`);
}
bootstrap();
