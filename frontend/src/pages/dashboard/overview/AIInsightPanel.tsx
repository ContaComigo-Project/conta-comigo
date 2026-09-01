import { useCallback, useEffect, useRef, useState } from 'react';
import { Bot, Rocket, AlertTriangle, Target, ArrowRight } from 'lucide-react';
import { mockAIInsights, type AIInsight } from '../../../mocks';
import { AnimatedButton } from '../../../components/ui/AnimatedButton';

const TYPE_CONFIG = {
  opportunity: {
    Icon: Rocket,
    label: 'Oportunidade',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    borderClass: 'border-cc-green/30',
  },
  alert: {
    Icon: AlertTriangle,
    label: 'Atenção',
    badgeClass: 'bg-amber-100 text-amber-700',
    borderClass: 'border-amber-300/50',
  },
  goal: {
    Icon: Target,
    label: 'Meta',
    badgeClass: 'bg-blue-100 text-blue-700',
    borderClass: 'border-blue-300/50',
  },
};

const AUTO_ROTATE_MS = 6000;

function ConfidenceBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-linear-to-r from-cc-green to-cc-dark-green transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[0.68rem] font-semibold text-slate-400 shrink-0">
        {value}% confiança
      </span>
    </div>
  );
}

function InsightCard({ insight, isActive }: { insight: AIInsight; isActive: boolean }) {
  const config = TYPE_CONFIG[insight.type];
  if (!isActive) return null;

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all duration-300 animate-fade-in ${config.borderClass} bg-white shadow-[0_4px_24px_rgba(54,179,126,0.08)]`}>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center text-white shadow-sm shadow-cc-green/30 shrink-0">
            <Bot size={20} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-widest text-slate-400">
              Consultor de IA
            </p>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              {insight.title}
            </h3>
          </div>
        </div>

        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[0.65rem] font-bold uppercase tracking-wide shrink-0 ${config.badgeClass}`}>
          <config.Icon size={11} strokeWidth={2} />
          {config.label}
        </span>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mb-4">
        {insight.body}
      </p>

      <div className="mb-4">
        <ConfidenceBar value={insight.confidence} />
      </div>

      {insight.ctaLabel && (
        <AnimatedButton
          size="sm"
          id={`ai-insight-cta-${insight.id}`}
          to={insight.ctaRoute}
          icon={<ArrowRight size={15} strokeWidth={2.2} />}
        >
          {insight.ctaLabel}
        </AnimatedButton>
      )}
    </div>
  );
}

export default function AIInsightPanel() {
  const insights = mockAIInsights;
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % insights.length);
    }, AUTO_ROTATE_MS);
  }, [insights.length]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const handleDotClick = (i: number) => {
    setActiveIndex(i);
    resetTimer();
  };

  return (
    <section aria-label="Insights de IA">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-linear-to-br from-cc-green to-cc-dark-green flex items-center justify-center text-white">
            <Bot size={13} strokeWidth={1.8} />
          </span>
          Diagnóstico de IA
        </h2>

        <div className="flex items-center gap-1.5">
          {insights.map((_, i) => (
            <button
              key={i}
              id={`ai-insight-tab-${i}`}
              onClick={() => handleDotClick(i)}
              aria-label={`Insight ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'w-5 h-1.5 bg-[#36b37e]'
                  : 'w-1.5 h-1.5 bg-slate-200 hover:bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {insights.map((insight, i) => (
        <InsightCard key={insight.id} insight={insight} isActive={i === activeIndex} />
      ))}
    </section>
  );
}
