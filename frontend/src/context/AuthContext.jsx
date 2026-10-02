import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Auth } from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext) || {};

const STORAGE_KEY = 'shagalny_auth';

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.token && parsed.user) return parsed;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const stored = readStored();
    if (stored) {
      setToken(stored.token);
      setUser(stored.user);
    }
    setLoading(false);
  }, []);

  // Listen for global auth:logout events (axios fires this on 401)
  useEffect(() => {
    const onForcedLogout = () => {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setToken(null);
    };
    window.addEventListener('auth:logout', onForcedLogout);
    return () => window.removeEventListener('auth:logout', onForcedLogout);
  }, []);

  function persist(nextToken, nextUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
    setUser(nextUser);
    setToken(nextToken);
  }

  // Login — returns the user object on success
  async function login(email, password) {
    const data = await Auth.login({ email, password });
    if (!data?.token || !data?.user) throw new Error('Malformed login response.');
    persist(data.token, data.user);
    return data.user;
  }

  // Register — returns the user object on success
  async function register(payload) {
    const data = await Auth.register(payload);
    if (!data?.token || !data?.user) throw new Error('Malformed register response.');
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }

  // Refresh current user from server (e.g. after profile edits)
  const refreshMe = useCallback(async () => {
    if (!token) return;
    try {
      const me = await Auth.me();
      if (me && me._id) persist(token, me);
    } catch {
      // token likely expired
      logout();
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshMe, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
