export interface ConnectedBank {
  id: string;
  name: string;
  color: string;
  initials: string;
  balance: number;
  formattedBalance: string;
  status: 'active' | 'syncing' | 'error';
  lastSync: string;
}

export const mockConnectedBanks: ConnectedBank[] = [
  { id: 'bank_nubank',   name: 'Nubank',   color: '#8B5CF6', initials: 'NU', balance: 2_418.32,  formattedBalance: 'R$ 2.418,32',  status: 'active',  lastSync: 'Agora mesmo' },
  { id: 'bank_itau',     name: 'Itaú',     color: '#F97316', initials: 'IT', balance: 10_842.13, formattedBalance: 'R$ 10.842,13', status: 'active',  lastSync: '3 min atrás' },
  { id: 'bank_bradesco', name: 'Bradesco', color: '#EF4444', initials: 'BB', balance: 5_482.10,  formattedBalance: 'R$ 5.482,10',  status: 'syncing', lastSync: 'Sincronizando...' },
];
