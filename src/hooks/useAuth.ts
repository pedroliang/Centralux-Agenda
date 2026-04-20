import { useCallback, useState } from 'react';

const STORAGE_KEY = 'celtralux-auth';
const ADMIN_USER = 'Brshrek';
// Hash simples para não deixar a senha em texto puro no código
const ADMIN_HASH = '4541ceed'; // hash de "Jesus321*!"

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).slice(0, 8);
}

export interface AuthState {
  isAdmin: boolean;
  username: string | null;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [auth, setAuth] = useState<{ username: string } | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((user: string, pass: string): boolean => {
    if (user === ADMIN_USER && simpleHash(pass) === ADMIN_HASH) {
      const state = { username: user };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setAuth(state);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  }, []);

  return {
    isAdmin: auth !== null,
    username: auth?.username ?? null,
    login,
    logout
  };
}
