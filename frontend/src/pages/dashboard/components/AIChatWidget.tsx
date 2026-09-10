import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, MessageCircle, Sparkles, Maximize, Minimize, Info } from 'lucide-react';
import { ApiSource } from '../../../data/api-source';

// Chips de sugestão — apresentação local; a resposta sempre vem do backend
// (HT-018): POST /intelligence/chat devolve a resposta + o aviso RN-018.
const CHAT_SUGGESTION_CHIPS = [
  'Onde estou gastando mais?',
  'Resumo do meu orçamento',
  'Como reduzir gastos fixos?',
];

// RN-018: aviso de não aconselhamento permanente em toda superfície de IA.
// Vem do backend junto da resposta; aqui é o fallback de apresentação.
const AVISO_DE_NAO_ACONSELHAMENTO =
  'O Consultor IA é educativo e usa seus números, mas não é aconselhamento financeiro. ' +
  'Não recomenda produtos, investimentos, crédito ou instituições. Consulte um profissional qualificado.';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export default function AIChatWidget({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const idCounterRef = useRef(1000);

  const nextId = (prefix: 'u' | 'a') => `${prefix}_${++idCounterRef.current}`;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    const userMsg: ChatMessage = {
      id: nextId('u'),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    try {
      // Contexto: as últimas trocas acompanham a pergunta, para o assistente
      // dar continuidade à conversa e questionar de volta quando precisar.
      const historico = messages
        .slice(-8)
        .map((m) => ({ role: m.role === 'user' ? ('usuario' as const) : ('assistente' as const), texto: m.content }));
      const resposta = await new ApiSource().perguntarNoChat(trimmed, historico);
      const conteudo =
        resposta.estado === 'ok'
          ? (resposta.resposta ?? 'Sem resposta no momento.')
          : resposta.estado === 'teto-atingido'
            ? 'Você atingiu o limite diário de consultas da IA. Tente novamente amanhã.'
            : resposta.estado === 'ia-bloqueou'
              ? (resposta.motivo ?? 'A resposta foi bloqueada pelas diretrizes de segurança do assistente.')
              : 'A consulta não pôde ser respondida agora. Tente novamente em instantes.';
      const aiMsg: ChatMessage = {
        id: nextId('a'),
        role: 'assistant',
        content: conteudo,
        timestamp: new Date(),
      };
      setMessages((m) => [...m, aiMsg]);
    } catch {
      setMessages((m) => [
        ...m,
        { id: nextId('a'), role: 'assistant', content: 'Não foi possível conectar ao consultor agora. Tente novamente.', timestamp: new Date() },
      ]);
    } finally {
      setTyping(false);
    }
  };

  if (!open && !embedded) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-50 bottom-24 right-4 md:bottom-8 md:right-8 group flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-[0_12px_32px_rgba(54,179,126,0.45)] hover:shadow-[0_16px_40px_rgba(54,179,126,0.55)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      >
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          <MessageCircle size={20} strokeWidth={2.1} className="relative" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Consultor IA</span>
      </button>
    );
  }

  let wrapperClass;
  if (isFullscreen) {
    wrapperClass = 'fixed inset-0 z-50 w-screen h-screen flex flex-col bg-white border-0 m-0 rounded-none shadow-none overflow-hidden animate-fade-in';
  } else if (embedded) {
    wrapperClass = 'w-full h-full flex flex-col rounded-4xl border border-slate-100 bg-white overflow-hidden pointer-events-none select-none';
  } else {
    wrapperClass = 'fixed z-50 bottom-24 right-4 md:bottom-8 md:right-8 w-[calc(100vw-2rem)] sm:w-105 max-w-md h-[min(72vh,720px)] sm:h-160 flex flex-col rounded-2xl border border-slate-100 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)] animate-fade-in overflow-hidden';
  }

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between px-4 py-3 bg-linear-to-br from-cc-dark-green via-[#138a54] to-cc-green text-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Bot size={18} strokeWidth={2.1} />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#138a54]" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight truncate">Consultor Financeiro IA</p>
            <p className="text-[0.7rem] text-white/70 leading-tight flex items-center gap-1 truncate">
              <Sparkles size={10} strokeWidth={2.2} />
              Respostas educativas sobre seus números
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {!embedded && (
            <>
              <button
                type="button"
                onClick={() => setIsFullscreen((f) => !f)}
                aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                {isFullscreen ? (
                  <Minimize size={15} strokeWidth={2} />
                ) : (
                  <Maximize size={15} strokeWidth={2} />
                )}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-linear-to-b from-slate-50/70 to-white"
      >
        <div className="px-3 py-2 rounded-lg border border-emerald-100 bg-emerald-50/50 text-[0.65rem] text-emerald-700 leading-relaxed flex items-start gap-2">
          <Info size={12} strokeWidth={2.2} className="shrink-0 mt-0.5" />
          <span>
            {AVISO_DE_NAO_ACONSELHAMENTO}
          </span>
        </div>

        {messages.length === 0 && (
          <p className="text-center text-[0.75rem] text-slate-400 pt-6">
            Pergunte sobre seus números: gastos, categorias e orçamento.
          </p>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[92%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center shrink-0">
                  <Bot size={14} strokeWidth={2.1} className="text-white" />
                </div>
              )}
              <div className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`text-[0.78rem] leading-relaxed whitespace-pre-line px-3.5 py-2.5 rounded-2xl shadow-sm ${
                    m.role === 'user'
                      ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[0.6rem] text-slate-400 px-1">
                  {m.role === 'assistant' ? 'IA · ' : 'Você · '}
                  {formatTime(m.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center shrink-0">
              <Bot size={14} strokeWidth={2.1} className="text-white" />
            </div>
            <div className="flex items-center gap-1 px-3.5 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-100 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '160ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '320ms' }} />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-white/95 backdrop-blur shrink-0">
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {CHAT_SUGGESTION_CHIPS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => sendMessage(s)}
              className="text-[0.63rem] font-medium px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
          className="flex items-center gap-2 rounded-xl border border-slate-200 focus-within:border-[#36b37e] focus-within:ring-2 focus-within:ring-[#36b37e]/20 bg-slate-50 transition-all px-2 py-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte ao seu consultor financeiro..."
            className="flex-1 bg-transparent text-[0.8rem] text-slate-800 placeholder:text-slate-400 outline-none px-2 py-1"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            className="w-9 h-9 rounded-lg bg-linear-to-br from-cc-dark-green to-cc-green text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all cursor-pointer"
          >
            <Send size={15} strokeWidth={2.2} />
          </button>
        </form>
      </div>
    </div>
  );
}