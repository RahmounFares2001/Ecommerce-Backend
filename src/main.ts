import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // project description
  app.setGlobalPrefix('api/v1');

  // cookies parser
  app.use(cookieParser());

  // set global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,  
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      }
    }),
  )

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
