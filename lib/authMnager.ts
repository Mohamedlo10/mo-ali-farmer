
export function getSupabaseUser() {
    const sessionData = localStorage.getItem('user_session');
    return sessionData ? JSON.parse(sessionData) : null;
  }