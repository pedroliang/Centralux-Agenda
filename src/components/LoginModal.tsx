import { useState } from 'react';
import { Lock, LogIn, X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onLogin: (user: string, pass: string) => boolean;
}

export function LoginModal({ open, onClose, onLogin }: Props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onLogin(user, pass);
    if (ok) {
      setUser('');
      setPass('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm cl-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-base font-semibold">
            <Lock size={18} className="text-brand-500" />
            Login Administrador
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Usuário</label>
            <input
              value={user}
              onChange={e => { setUser(e.target.value); setError(false); }}
              placeholder="Digite seu usuário"
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Senha</label>
            <input
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError(false); }}
              placeholder="Digite sua senha"
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              Usuário ou senha incorretos.
            </div>
          )}
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow"
          >
            <LogIn size={16} /> Entrar
          </button>
        </form>
      </div>
    </div>
  );
}
