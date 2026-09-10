import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { ApiSource } from '../../../data/api-source';
import { getAccessToken } from '../../../data/access';

// Integração real (ApiSource): os bancos conectados vêm do consentimento ativo
// no backend (HN-002). O botão "+" cria um consentimento; cada banco pode ser
// sincronizado (RF-007). Dados sintéticos — nunca conta bancária real.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

type BancoConectado = {
  id: string;
  name: string;
  status: 'ativo' | 'sincronizando' | 'error';
  lastSyncAt: string | null;
};

function StatusIndicator({ status }: { status: BancoConectado['status'] }) {
  if (status === 'ativo') {
    return <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.2)]" />;
  }
  if (status === 'sincronizando') {
    return <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_0_3px_rgba(251,191,36,0.2)]" />;
  }
  return <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_0_3px_rgba(248,113,113,0.2)]" />;
}

function formatarUltimaSync(iso: string | null): string {
  if (!iso) return 'nunca sincronizado';
  const data = new Date(iso);
  return `última sync ${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

// Uma instância só: o componente não guarda estado de rede, e recriá-la a cada
// render faria o efeito depender de um objeto novo toda vez.
const api = new ApiSource();

export default function ConnectedBanksWidget() {
  const [bancos, setBancos] = useState<BancoConectado[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [sincronizando, setSincronizando] = useState(false);

  const carregar = async (aindaNaTela: () => boolean = () => true) => {
    const r = await api.listarBancosConectados();
    if (!aindaNaTela()) return;
    if (r.estado === 'ok') {
      setBancos(r.dados.map((b) => ({
        id: b.id,
        name: b.name,
        status: b.status === 'ativo' ? 'ativo' : 'error',
        lastSyncAt: b.ultimaSincronizacao,
      })));
      setErro(null);
    } else {
      setErro('Não foi possível carregar as conexões. Faça login.');
    }
  };

  // A carga inicial é assíncrona de propósito: o efeito não muda estado no
  // próprio corpo (regra react-hooks), e o resultado é descartado se o
  // componente sair da tela antes da resposta chegar.
  useEffect(() => {
    let ativo = true;
    const carregarInicial = async () => {
      await carregar(() => ativo);
    };
    void carregarInicial();
    return () => {
      ativo = false;
    };
  }, []);

  const conectar = async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      setErro(null);
      const res = await fetch(`${BASE}/consents`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
        body: JSON.stringify({ institutionId: 'Banco Exemplo', scope: 'accounts-and-transactions' }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setErro(payload.message ?? 'Não foi possível conectar a instituição.');
        return;
      }
      await carregar();
    } catch {
      setErro('Erro de conexão ao conectar com a instituição.');
    }
  };

  const sincronizar = async (id: string) => {
    const token = getAccessToken();
    if (!token) return;
    setSincronizando(true);
    setErro(null);
    try {
      const res = await fetch(`${BASE}/consents/${id}/sync`, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setErro(payload.message ?? 'Falha ao sincronizar instituição.');
      } else {
        await carregar();
      }
    } catch {
      setErro('Erro de rede ao sincronizar instituição.');
    } finally {
      setSincronizando(false);
    }
  };

  return (
    <section aria-label="Bancos conectados" className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800">Bancos Conectados</h2>
          <p className="text-[0.72rem] text-slate-400 mt-0.5">{bancos.length} instituição(ões) · consentimento ativo</p>
        </div>
        <button
          id="banks-widget-add"
          onClick={conectar}
          className="w-8 h-8 flex items-center justify-center rounded-xl border border-dashed border-cc-green text-cc-green hover:bg-emerald-50 transition-colors cursor-pointer"
          aria-label="Conectar instituição"
        >
          <Plus size={16} strokeWidth={2} />
        </button>
      </div>

      {erro && <p className="text-xs text-red-500 mb-3">{erro}</p>}

      <ul className="flex flex-col gap-3 mb-4">
        {bancos.map((bank) => (
          <li key={bank.id} className="flex items-center gap-3 group hover:bg-slate-50 -mx-2 px-2 py-1.5 rounded-xl transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 text-white text-[0.6rem] font-bold uppercase shrink-0">
              {bank.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-slate-800 truncate">{bank.name}</p>
                <StatusIndicator status={bank.status} />
              </div>
              <p className="text-[0.68rem] text-slate-400 truncate">{formatarUltimaSync(bank.lastSyncAt)}</p>
            </div>
            <button
              onClick={() => sincronizar(bank.id)}
              disabled={sincronizando}
              aria-label={`Sincronizar ${bank.name}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-cc-green hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-40"
            >
              <RefreshCw size={14} strokeWidth={2} />
            </button>
          </li>
        ))}
        {bancos.length === 0 && !erro && (
          <li className="text-xs text-slate-400 text-center py-3">
            Nenhuma instituição conectada. Use o "+" para autorizar a conexão.
          </li>
        )}
      </ul>
    </section>
  );
}