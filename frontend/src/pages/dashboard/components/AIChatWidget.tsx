import { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  X,
  MessageCircle,
  Sparkles,
  Maximize,
  Minimize,
  Info,
} from 'lucide-react';
import {
  mockChatMessages,
  generateMockReply,
  CHAT_SUGGESTION_CHIPS,
  BUDGET_STATUS_META,
  resolveStatus,
  type ChatMessage,
  type BudgetStatus,
  type BudgetStatusData,
  type PurchasePlanData,
} from '../../../mocks';
import { formatBRL } from '../../../utils/formatters';

const CHAT_STATUS_LABELS: Record<BudgetStatus, string> = {
  verde: 'Baixo impacto',
  amarelo: 'Atenção',
  vermelho: 'Alto impacto',
};

function formatTime(d: Date) {
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function BudgetStatusCard({ data }: { data: BudgetStatusData }) {
  const pct = (data.totalSpent / data.totalLimit) * 100;
  const statusMeta: BudgetStatus = resolveStatus(pct);
  const meta = BUDGET_STATUS_META[statusMeta];
  return (
    <div className="rounded-xl border border-slate-100 bg-linear-to-br from-white to-slate-50 p-3.5 w-full">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center shrink-0">
            <Sparkles size={13} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Resumo orçamentário</p>
            <p className="text-xs font-semibold text-slate-800">Junho 2026</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase border ${meta.badgeClass}`}>
          <meta.Icon size={10} strokeWidth={2.4} />
          {CHAT_STATUS_LABELS[statusMeta]}
        </span>
      </div>

      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-xs font-semibold text-slate-400">R$</span>
        <span className="text-base font-bold text-slate-800 tabular-nums">{formatBRL(data.totalSpent)}</span>
        <span className="text-xs text-slate-400 tabular-nums">de R$ {formatBRL(data.totalLimit)}</span>
      </div>

      <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden mb-3">
        <div className={`h-full ${meta.barClass} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>

      <div className="flex items-center gap-2 mb-3">
        {(['verde', 'amarelo', 'vermelho'] as BudgetStatus[]).map((s) => {
          const m = BUDGET_STATUS_META[s];
          const count = data[s];
          return (
            <div key={s} className="flex-1 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white border border-slate-100">
              <span className={`w-2 h-2 rounded-full ${m.barClass}`} />
              <span className="text-[0.62rem] font-bold text-slate-600 tabular-nums">{count}</span>
              <span className="text-[0.6rem] text-slate-400">{CHAT_STATUS_LABELS[s].slice(0, 6)}</span>
            </div>
          );
        })}
      </div>

      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <p className="text-[0.62rem] font-semibold uppercase tracking-wider text-slate-400">Categorias de atenção</p>
        {data.topAlert.map((t) => {
          const p = (t.spent / t.limit) * 100;
          const s: BudgetStatus = resolveStatus(p);
          const m = BUDGET_STATUS_META[s];
          return (
            <div key={t.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${m.barClass}`} />
                <span className="text-[0.7rem] font-medium text-slate-700">{t.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-1 rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${m.barClass}`} style={{ width: `${Math.min(100, p)}%` }} />
                </div>
                <span className="text-[0.62rem] font-bold tabular-nums text-slate-600">{p.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PurchasePlanCard({ data }: { data: PurchasePlanData }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-linear-to-br from-white to-slate-50 p-3.5 w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-[#001b42] to-cc-dark-green flex items-center justify-center shrink-0">
            <Bot size={13} strokeWidth={2} className="text-white" />
          </div>
          <div>
            <p className="text-[0.7rem] font-bold uppercase tracking-wider text-slate-500">Plano de compra</p>
            <p className="text-xs font-semibold text-slate-800">{data.item} · R$ {formatBRL(data.targetValue)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100">
          <Info size={10} className="text-slate-500" />
          <span className="text-[0.6rem] font-semibold text-slate-500">Simulação</span>
        </div>
      </div>

      <div className="space-y-2">
        {data.options.map((opt, idx) => {
          const meta = BUDGET_STATUS_META[opt.status];
          return (
            <div
              key={opt.id}
              className="rounded-lg border border-slate-100 bg-white p-2.5 hover:border-slate-200 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[0.6rem] font-bold text-slate-600 shrink-0">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <p className="text-[0.75rem] font-semibold text-slate-800 truncate">{opt.title}</p>
                </div>
                <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border text-[0.55rem] font-bold uppercase ${meta.badgeClass} shrink-0`}>
                  <meta.Icon size={8} strokeWidth={2.6} />
                  {meta.label}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[0.65rem]">
                <div>
                  <p className="text-slate-400 font-medium">Mensal</p>
                  <p className="font-bold tabular-nums text-slate-800">R$ {formatBRL(opt.monthlyCost)}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Período</p>
                  <p className="font-bold tabular-nums text-slate-800">{opt.months}x</p>
                </div>
                <div>
                  <p className="text-slate-400 font-medium">Total</p>
                  <p className="font-bold tabular-nums text-slate-800">R$ {formatBRL(opt.totalCost)}</p>
                </div>
              </div>
              <p className="text-[0.6rem] text-slate-500 mt-1.5 italic">{opt.impact}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AttachmentRenderer({ type, data }: { type: string; data: unknown }) {
  if (type === 'budget_status') return <BudgetStatusCard data={data as BudgetStatusData} />;
  if (type === 'purchase_plan') return <PurchasePlanCard data={data as PurchasePlanData} />;
  return null;
}

export default function AIChatWidget({ embedded = false }: { embedded?: boolean }) {
  const [open, setOpen] = useState(embedded);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
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

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: ChatMessage = {
      id: nextId('u'),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const reply = generateMockReply(trimmed);
      const aiMsg: ChatMessage = {
        id: nextId('a'),
        timestamp: new Date(),
        ...reply,
      };
      setMessages((m) => [...m, aiMsg]);
      setTyping(false);
    }, 1100);
  };

  if (!open && !embedded) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 group flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-[0_12px_32px_rgba(54,179,126,0.45)] hover:shadow-[0_16px_40px_rgba(54,179,126,0.55)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
      >
        <span className="relative">
          <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
          <MessageCircle size={20} strokeWidth={2.1} className="relative" />
        </span>
        <span className="text-sm font-semibold tracking-tight">Consultor IA</span>
        <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[0.65rem] font-bold">
          {mockChatMessages.length}
        </span>
      </button>
    );
  }

  let wrapperClass;
  if (isFullscreen) {
    wrapperClass = 'fixed inset-0 z-50 w-screen h-screen flex flex-col bg-white border-0 m-0 rounded-none shadow-none overflow-hidden animate-fade-in';
  } else if (embedded) {
    wrapperClass = 'w-full h-full flex flex-col rounded-4xl border border-slate-100 bg-white overflow-hidden pointer-events-none select-none';
  } else {
    wrapperClass = 'fixed z-50 bottom-6 right-6 md:bottom-8 md:right-8 w-[calc(100vw-3rem)] sm:w-105 max-w-md h-[min(76vh,720px)] sm:h-160 flex flex-col rounded-2xl border border-slate-100 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.18)] animate-fade-in overflow-hidden';
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
              Simulações e diagnósticos de orçamento
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
            Esta ferramenta utiliza dados financeiros mockados para simular diagnósticos e planos de compra.
            <strong> Não é aconselhamento financeiro.</strong> Sempre consulte um profissional qualificado.
          </span>
        </div>

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
                  className={`text-[0.78rem] leading-relaxed px-3.5 py-2.5 rounded-2xl shadow-sm ${
                    m.role === 'user'
                      ? 'bg-linear-to-br from-cc-dark-green to-cc-green text-white rounded-br-md'
                      : 'bg-white text-slate-700 border border-slate-100 rounded-bl-md'
                  }`}
                >
                  {m.content}
                </div>

                {m.attachments?.map((a, i) => (
                  <AttachmentRenderer key={`${m.id}_a${i}`} type={a.type} data={a.data} />
                ))}

                {m.quickActions && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {m.quickActions.map((qa) => (
                          <button
                            key={qa.label}
                            onClick={() => sendMessage(qa.value)}
                            className="text-[0.65rem] font-semibold px-2.5 py-1.5 rounded-full border border-cc-green/30 bg-cc-green/5 text-cc-dark-green hover:bg-cc-green/15 transition-colors cursor-pointer"
                          >
                            {qa.label}
                          </button>
                        ))}
                      </div>
                    )}

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
            <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-2xl rounded-bl-md bg-white border border-slate-100 shadow-sm">
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
            sendMessage(input);
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
