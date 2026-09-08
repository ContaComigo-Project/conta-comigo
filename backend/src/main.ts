import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configurarOpenApi } from './openapi';

const PORTA = Number(process.env.PORT ?? 3000);

async function iniciar() {
  const app = await NestFactory.create(AppModule);
  // A web roda em outra origem (Vite dev em :5173); sem CORS o navegador
  // bloqueia o login e as chamadas do painel (HN-003 integration).
  app.enableCors({ origin: ['http://localhost:5173', 'http://localhost:4173'] });
  configurarOpenApi(app);
  await app.listen(PORTA);
  console.log(`api: ouvindo em http://localhost:${PORTA}`);
  console.log(`api: documentacao em http://localhost:${PORTA}/api/docs`);
}

iniciar();