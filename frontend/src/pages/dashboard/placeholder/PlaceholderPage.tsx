import { Link } from 'react-router-dom';
import { ArrowLeft, Construction, type LucideIcon } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
  description: string;
  icon?: LucideIcon;
  plannedFeatures: string[];
}

export default function PlaceholderPage({
  title,
  subtitle,
  description,
  icon: Icon = Construction,
  plannedFeatures,
}: PlaceholderPageProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#36b37e]/10 text-[#36b37e] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#001b42]">{title}</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Em construção
              </span>
            </div>
            <p className="text-sm text-slate-500">{subtitle}</p>
          </div>
        </div>

        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Início
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-2xl space-y-6">
          <p className="text-base text-slate-600 leading-relaxed">
            {description}
          </p>

          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Recursos planejados para esta seção:
            </h2>
            <ul className="space-y-2.5">
              {plannedFeatures.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#36b37e] mt-2 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-400">
            Esta funcionalidade está mapeada no backlog da Prova de Conceito (PoC) do ContaComigo e será integrada nas próximas fases da aplicação.
          </p>
        </div>
      </div>
    </div>
  );
}
