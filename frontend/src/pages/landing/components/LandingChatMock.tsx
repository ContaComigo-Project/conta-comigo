import { Bot, Info, Sparkles, Send } from 'lucide-react';

export default function LandingChatMock() {
  const formatTime = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const BASE_TS = 1756760400000;
  const t1 = new Date(BASE_TS - 1000 * 60 * 58);
  const t2 = new Date(BASE_TS - 1000 * 60 * 50);

  return (
    <div className="w-full h-full flex flex-col rounded-4xl border border-slate-100 bg-white overflow-hidden pointer-events-none select-none">
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
              Simulações e diagnósticos
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-4 py-3 space-y-3 bg-linear-to-b from-slate-50/70 to-white">
        <div className="px-3 py-2 rounded-lg border border-emerald-100 bg-emerald-50/50 text-[0.62rem] text-emerald-700 leading-relaxed flex items-start gap-2">
          <Info size={11} strokeWidth={2.2} className="shrink-0 mt-0.5" />
          <span>
            Simulação com dados mockados. <strong>Não é aconselhamento financeiro.</strong>
          </span>
        </div>

        <div className="flex justify-start">
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center shrink-0">
              <Bot size={12} strokeWidth={2.1} className="text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[0.72rem] leading-relaxed px-3 py-2 rounded-2xl rounded-bl-md bg-white text-slate-700 border border-slate-100 shadow-sm">
                Olá! Posso analisar seus gastos, planejar compras e acompanhar seu orçamento.
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button className="text-[0.58rem] font-semibold px-2 py-1 rounded-full border border-cc-green/30 bg-cc-green/5 text-cc-dark-green">
                  Orçamento?
                </button>
                <button className="text-[0.58rem] font-semibold px-2 py-1 rounded-full border border-cc-green/30 bg-cc-green/5 text-cc-dark-green">
                  Comprar TV
                </button>
              </div>
              <span className="text-[0.55rem] text-slate-400 px-1">
                IA · {formatTime(t1)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <div className="flex flex-row-reverse gap-2 max-w-[92%]">
            <div className="text-[0.72rem] leading-relaxed px-3 py-2 rounded-2xl rounded-br-md bg-linear-to-br from-cc-dark-green to-cc-green text-white shadow-sm">
              Planejar compra R$ 3.500
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="flex gap-2 max-w-[92%]">
            <div className="w-6 h-6 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center shrink-0">
              <Bot size={12} strokeWidth={2.1} className="text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-[0.72rem] leading-relaxed px-3 py-2 rounded-2xl rounded-bl-md bg-white text-slate-700 border border-slate-100 shadow-sm">
                Simulei 3 cenários. O parcelado <strong>12x sem juros</strong> custa apenas 3,4% da sua receita mensal.
              </div>
              <div className="rounded-lg border border-slate-100 bg-linear-to-br from-white to-slate-50 p-2.5 w-full space-y-1.5">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="w-4 h-4 rounded bg-slate-100 flex items-center justify-center text-[0.5rem] font-bold text-slate-600 shrink-0">
                      B
                    </span>
                    <p className="text-[0.63rem] font-semibold text-slate-800 truncate">12x sem juros</p>
                  </div>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-cc-green/30 bg-cc-green/10 text-[0.5rem] font-bold uppercase text-cc-dark-green shrink-0">
                    BAIXO
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[0.58rem]">
                  <div>
                    <p className="text-slate-400 font-medium">Mensal</p>
                    <p className="font-bold tabular-nums text-slate-800">R$ 291,67</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Prazo</p>
                    <p className="font-bold tabular-nums text-slate-800">12x</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Total</p>
                    <p className="font-bold tabular-nums text-slate-800">R$ 3.500</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <button className="text-[0.58rem] font-semibold px-2 py-1 rounded-full border border-cc-green/30 bg-cc-green/5 text-cc-dark-green">
                  Detalhar
                </button>
                <button className="text-[0.58rem] font-semibold px-2 py-1 rounded-full border border-cc-green/30 bg-cc-green/5 text-cc-dark-green">
                  Ver categorias
                </button>
              </div>
              <span className="text-[0.55rem] text-slate-400 px-1">
                IA · {formatTime(t2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-slate-100 bg-white/95 backdrop-blur shrink-0">
        <div className="flex flex-wrap gap-1 mb-2">
          <span className="text-[0.58rem] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-500">
            Como está meu orçamento?
          </span>
          <span className="text-[0.58rem] font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-slate-500">
            Mostrar categorias
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1">
          <input
            readOnly
            placeholder="Pergunte ao consultor..."
            className="flex-1 bg-transparent text-[0.72rem] text-slate-500 placeholder:text-slate-400 outline-none px-2 py-1"
          />
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cc-dark-green to-cc-green text-white flex items-center justify-center opacity-60">
            <Send size={13} strokeWidth={2.2} />
          </div>
        </div>
      </div>
    </div>
  );
}
