// FIXTURE ILEGAL — deve ser reprovada pela regra "dominio-sem-framework-nem-io".
// Nunca importar deste arquivo. Ele existe para provar que o gate bloqueia.
import { Injectable } from '@nestjs/common';

@Injectable()
export class FaixaComFramework {}
