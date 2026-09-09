import { Body, Controller, HttpCode, Inject, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ChatRespostaDTO, PerguntaChatDTO } from '@contacomigo/contract';
import { zodParaSchema } from '../../../openapi';
import type { Identity } from '../../../transactions/domain/port/driven/identity';
import type { PerguntarNoChat } from '../../domain/port/driving/chat';
import { TOKENS_INTELLIGENCE } from '../../domain/port/driven/tokens';
import { GuardaDeHolderDoChat, TOKEN_IDENTITY_INTELLIGENCE } from './chat-guard';

// Adapter de entrada do chat educativo (HN-010). O titular vem do access token,
// nunca de parametro da requisicao (RN-015). O aviso de nao aconselhamento
// (RN-018) e entregue junto da resposta em toda saida de IA.
@ApiTags('intelligence')
@ApiBearerAuth()
@UseGuards(GuardaDeHolderDoChat)
@Controller('intelligence/chat')
export class ChatController {
  constructor(
    @Inject(TOKEN_IDENTITY_INTELLIGENCE) private readonly identity: Identity,
    @Inject(TOKENS_INTELLIGENCE.PerguntarNoChat) private readonly perguntar: PerguntarNoChat,
  ) {}

  private titular(): string {
    const titular = this.identity.holderAtual();
    if (titular === null) throw new UnauthorizedException();
    return titular;
  }

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Responder dúvida em chat educativo', description: 'RF-020: resposta usa os dados da pessoa; o aviso de não aconselhamento (RN-018) acompanha toda saída de IA.' })
  @ApiBody({ schema: zodParaSchema(PerguntaChatDTO) })
  @ApiResponse({ status: 200, description: 'Resposta (ou estado de degradação)' })
  async perguntarNoChat(@Body() body: PerguntaChatDTO): Promise<ChatRespostaDTO> {
    const r = await this.perguntar.executar(this.titular(), body.pergunta);
    switch (r.tipo) {
      case 'ok':
        return { estado: 'ok', resposta: r.resposta, aviso: r.aviso };
      case 'ia-indisponivel':
        return { estado: 'ia-indisponivel', motivo: r.motivo };
      case 'teto-atingido':
        return { estado: 'teto-atingido' };
      case 'ia-bloqueou':
        return { estado: 'ia-bloqueou', motivo: r.motivo };
    }
  }
}