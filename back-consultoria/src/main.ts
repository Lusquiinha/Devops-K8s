import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CreateAdmin } from './admin';
import { RedisIoAdapter } from './redis-io.adapter';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  app.enableCors();

  // Adapter Redis: propaga os eventos do Socket.IO entre todas as réplicas do
  // backend (broadcast/rooms via pub/sub do Redis), permitindo escalar o backend.
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  await CreateAdmin(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
