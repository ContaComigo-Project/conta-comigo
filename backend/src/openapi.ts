import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { INestApplication } from '@nestjs/common';

// Documentacao OpenAPI da API (HT-019). Configuracao global de infraestrutura,
// no mesmo nivel de app.module.ts: nao pertence a nenhum contexto e nao toca
// domain/ nem application/ (ADR-001). A spec e gerada a partir dos controllers
// registrados; os schemas de corpo vem dos schemas zod do @contacomigo/contrato
// (toJSONSchema), entao a documentacao nunca diverge do contrato.
//
// UI em /api/docs; a spec JSON em /api-json (customizado via jsonDocumentUrl,
// em vez do default /api/docs-json).

/**
 * Converte um schema zod do @contacomigo/contrato em schema OpenAPI.
 * O zod 4 gera JSON Schema 2020-12 (compatível com OpenAPI 3.1). O retorno é
 * `any` de propósito: o tipo `SchemaObject` do @nestjs/swagger não é exportado
 * publicamente (o package restringe exports ao `.` e `./plugin`), e o JSON
 * Schema do zod admite `false` como schema. A única fonte dos schemas continua
 * sendo o contrato — nada aqui duplica definição.
 */
export function zodParaSchema(dto: { toJSONSchema(): unknown }): any {
  return dto.toJSONSchema();
}

export function configurarOpenApi(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('ContaComigo API')
    .setDescription('API do ContaComigo — gestão financeira pessoal via Open Finance.')
    .setVersion('0.15.0')
    .addBearerAuth()
    .build();

  const documento = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documento, { jsonDocumentUrl: 'api-json' });
}