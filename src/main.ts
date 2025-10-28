import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { swaggerConfigInit } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  swaggerConfigInit(app);

  await app.listen(process.env.PORT ?? 3000, () => {
    console.log('Server : http://localhost:3000/swagger');
  });
}
bootstrap();
