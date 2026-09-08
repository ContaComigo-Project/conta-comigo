import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configurarOpenApi } from './openapi';

const PORTA = Number(process.env.PORT ?? 3000);

async function iniciar() {
  const app = await NestFactory.create(AppModule);
  configurarOpenApi(app);
  await app.listen(PORTA);
  console.log(`api: ouvindo em http://localhost:${PORTA}`);
  console.log(`api: documentacao em http://localhost:${PORTA}/api/docs`);
}

iniciar();