import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin: any, callback: any) => {
      const allowedOrigins = [process.env.CLIENT_URL, process.env.ADMIN_URL];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,POST,PATCH,DELETE',
    credentials: true,
  });

  app.use(cookieParser());

  await app.listen(process.env.PORT ?? 8000);
}
bootstrap();
