export const mockUser = {
  id: 'usr_01hw8k2z3n4p5q6r7s8t9u0v',
  name: 'Usuário Demo',
  firstName: 'Demo',
  email: 'demo@contacomigo.com',
  avatarInitials: 'RL',
  avatarColor: '#0a6d42',
  openFinanceStatus: 'synced' as 'synced' | 'syncing' | 'error',
  lastSyncAt: new Date(Date.now() - 1000 * 60 * 4),
};
