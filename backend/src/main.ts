import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORTA = Number(process.env.PORT ?? 3000);

async function iniciar() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORTA);
  console.log(`api: ouvindo em http://localhost:${PORTA}`);
}

iniciar();
