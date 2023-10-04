/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { env } from './env';
import { IoAdapter } from '@nestjs/platform-socket.io';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  app.use(
    cors({
      origin: env.frontUrl, // Adjust the origin to match your Angular app's URL
      credentials: false, // Include credentials if necessary
    }),
  );
  await app.listen(3000);
}
bootstrap();
