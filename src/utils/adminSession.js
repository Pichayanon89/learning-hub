const ADMIN_SESSION_KEY = 'learning_hub_admin_session_v1';
const ADMIN_SESSION_EVENT = 'learning-hub-admin-session-change';

function notifySessionChange() {
  window.dispatchEvent(new Event(ADMIN_SESSION_EVENT));
}

export function readAdminSession() {
  try {
    const rawSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!rawSession) return null;

    const session = JSON.parse(rawSession);
    const expiresAt = new Date(session.expiresAt).getTime();

    if (!session.token || Number.isNaN(expiresAt) || expiresAt <= Date.now()) {
      clearAdminSession();
      return null;
    }

    return session;
  } catch {
    clearAdminSession();
    return null;
  }
}

export function saveAdminSession(session) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  notifySessionChange();
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  notifySessionChange();
}

export function getAdminAuthToken() {
  return readAdminSession()?.token || '';
}

export { ADMIN_SESSION_EVENT };
