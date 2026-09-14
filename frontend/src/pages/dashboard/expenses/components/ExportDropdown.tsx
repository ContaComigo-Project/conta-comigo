import { ChevronDown, Download, FileSpreadsheet, FileText, Loader } from 'lucide-react';
import { useState } from 'react';
import { ApiSource, mesCorrente } from '../../../../data/api-source';

interface ExportDropdownProps {
  viewMode: 'single' | 'history';
  labelSingle: string;
}

export function ExportDropdown({ viewMode, labelSingle }: ExportDropdownProps) {
  const [open, setOpen] = useState(false);
  const [ocupado, setOcupado] = useState<'pdf' | 'csv' | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const baixarPDF = async () => {
    setOcupado('pdf');
    setErro(null);
    try {
      await new ApiSource().baixarPDF(viewMode === 'single' ? mesCorrente() : undefined);
    } catch {
      setErro('Não foi possível gerar o PDF agora.');
    } finally {
      setOcupado(null);
      setOpen(false);
    }
  };

  const baixarCSV = async () => {
    setOcupado('csv');
    setErro(null);
    try {
      await new ApiSource().baixarCSV();
    } catch {
      setErro('Não foi possível gerar o CSV agora.');
    } finally {
      setOcupado(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
      >
        <Download size={14} strokeWidth={2} />
        <span className="text-[0.78rem] font-semibold text-slate-700">
          Exportar
        </span>
        <ChevronDown size={12} strokeWidth={2.2} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {erro && (
        <p className="absolute right-0 top-full mt-2 z-30 w-64 rounded-xl bg-red-50 border border-red-100 px-3 py-2 text-[0.72rem] text-red-700 shadow-xl">
          {erro}
        </p>
      )}

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 z-20 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-1.5 overflow-hidden animate-fade-in">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400">
                Formato do relatório
              </p>
              <p className="text-[0.72rem] text-slate-500 mt-0.5">
                {viewMode === 'history'
                  ? 'Inclui os meses fechados (até 6)'
                  : `${labelSingle} · Categorias + Transações`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void baixarPDF()}
              disabled={ocupado !== null}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                {ocupado === 'pdf' ? (
                  <Loader size={15} strokeWidth={2} className="text-red-600 animate-spin" />
                ) : (
                  <FileText size={15} strokeWidth={2} className="text-red-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.8rem] font-semibold text-slate-800 leading-tight">
                  Documento PDF
                </p>
                <p className="text-[0.65rem] text-slate-400 mt-0.5">
                  Layout formatado para impressão
                </p>
              </div>
              <span className="text-[0.65rem] font-bold text-slate-300 shrink-0">
                .pdf
              </span>
            </button>
            <button
              type="button"
              onClick={() => void baixarCSV()}
              disabled={ocupado !== null}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left disabled:opacity-50"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                {ocupado === 'csv' ? (
                  <Loader size={15} strokeWidth={2} className="text-emerald-700 animate-spin" />
                ) : (
                  <FileSpreadsheet size={15} strokeWidth={2} className="text-emerald-700" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[0.8rem] font-semibold text-slate-800 leading-tight">
                  Planilha CSV
                </p>
                <p className="text-[0.65rem] text-slate-400 mt-0.5">
                  Dados brutos para Excel / Sheets
                </p>
              </div>
              <span className="text-[0.65rem] font-bold text-slate-300 shrink-0">
                .csv
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}