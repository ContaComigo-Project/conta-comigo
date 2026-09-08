// FIXTURE ILEGAL — deve ser reprovada pela regra "domain-no-framework-or-io".
// Nunca importar deste arquivo. Ele existe para provar que o gate bloqueia.
import { Injectable } from '@nestjs/common';

@Injectable()
export class BandComFramework {}
