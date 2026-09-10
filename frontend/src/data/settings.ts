import { getAccessToken, signOut, AccessFailure } from './access';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export interface UserPreferences {
  alertYellowBand: boolean;
  alertRedBand: boolean;
  syncNotifications: boolean;
  emailSummary: boolean;
}

const PREFERENCES_STORAGE_KEY = 'cc_user_preferences';

const DEFAULT_PREFERENCES: UserPreferences = {
  alertYellowBand: true,
  alertRedBand: true,
  syncNotifications: true,
  emailSummary: false,
};

export function loadUserPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveUserPreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Exclui permanentemente a conta e todos os dados do titular (RN-016, HN-012).
 * Remove contas, transações, consentimentos e sessões no PostgreSQL.
 */
export async function deleteAccountPermanently(): Promise<boolean> {
  const token = getAccessToken();
  if (!token) throw new AccessFailure('Sem sessão ativa.');

  const response = await fetch(`${BASE}/consents/account`, {
    method: 'DELETE',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 204 || response.ok) {
    await signOut();
    return true;
  }

  throw new Error('Não foi possível excluir a conta. Tente novamente mais tarde.');
}
