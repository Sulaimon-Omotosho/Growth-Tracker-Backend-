import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin: any, callback: any) => {
      const allowedOrigins = [
        process.env.CLIENT_URL,
        process.env.ADMIN_URL,
        process.env.TEST_URL,
        'http://localhost:3002',
        'http://localhost:3003',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true,
  });

  // app.enableCors({
  //   origin: true,
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  //   allowedHeaders: 'Content-Type, Accept, Authorization, X-Requested-With',
  // });

  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // await app.listen(process.env.PORT ? 8000 : 8000);
  await app.listen(process.env.PORT || 8000, '0.0.0.0');
}
bootstrap();
