/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cors from 'cors';
import { IoAdapter } from '@nestjs/platform-socket.io';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(
    cors({
      origin: process.env.frontUrl, // Adjust the origin to match your Angular app's URL
      credentials: false, // Include credentials if necessary
    }),
  );
  app.useWebSocketAdapter(new IoAdapter(app));

  await app.listen(process.env.PORT || 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
