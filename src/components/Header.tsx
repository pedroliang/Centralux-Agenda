import { ChevronLeft, ChevronRight, LogIn, LogOut, Menu, Moon, Plus, Search, Sun, User, Calendar as CalendarIcon } from 'lucide-react';
import { formatHeader } from '../lib/dates';
import { ThemeMode, ViewMode } from '../types';

interface Props {
  refDate: Date;
  view: ViewMode;
  theme: ThemeMode;
  query: string;
  online: boolean;
  isAdmin: boolean;
  username: string | null;
  onToggleSidebar: () => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onChangeView: (v: ViewMode) => void;
  onQuery: (q: string) => void;
  onNew: () => void;
  onToggleTheme: () => void;
  onLogin: () => void;
  onLogout: () => void;
}

const VIEW_LABEL: Record<ViewMode, string> = {
  day: 'Dia',
  week: 'Semana',
  month: 'Mês',
  list: 'Lista'
};

export function Header({
  refDate, view, theme, query, online, isAdmin, username,
  onToggleSidebar, onPrev, onNext, onToday, onChangeView, onQuery, onNew, onToggleTheme,
  onLogin, onLogout
}: Props) {
  return (
    <header className="h-14 flex items-center gap-2 px-3 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-sm shrink-0">
      <button
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={onToggleSidebar}
        aria-label="Alternar menu lateral"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-2 pl-1 pr-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white shadow">
          <CalendarIcon size={18} />
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="font-semibold text-[15px]">Celtralux</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 -mt-0.5">Agenda</div>
        </div>
      </div>

      <button
        onClick={onToday}
        className="ml-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        Hoje
      </button>

      <div className="flex items-center ml-1">
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onPrev} aria-label="Anterior">
          <ChevronLeft size={18} />
        </button>
        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onNext} aria-label="Próximo">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="ml-1 text-sm sm:text-base font-medium truncate">
        {formatHeader(refDate, view)}
      </div>

      <div className="flex-1" />

      <div className="hidden md:flex items-center relative w-[280px] lg:w-[360px]">
        <Search size={16} className="absolute left-3 text-slate-400" />
        <input
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Pesquisar tarefas... (Ctrl+K)"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900"
        />
      </div>

      <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 ml-2">
        {(['day', 'week', 'month', 'list'] as ViewMode[]).map(v => (
          <button
            key={v}
            onClick={() => onChangeView(v)}
            className={
              'px-2.5 py-1 text-xs sm:text-sm rounded-md transition ' +
              (view === v
                ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white')
            }
          >
            {VIEW_LABEL[v]}
          </button>
        ))}
      </div>

      <button
        onClick={onToggleTheme}
        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
        title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        aria-label="Alternar tema"
      >
        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <button
        onClick={onNew}
        className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow"
      >
        <Plus size={16} /> <span className="hidden sm:inline">Nova tarefa</span>
      </button>

      <div className="hidden lg:flex items-center ml-2">
        <span
          className={
            'inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full ' +
            (online
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-300')
          }
          title={online ? 'Sincronizando com Supabase' : 'Modo offline (sem Supabase configurado)'}
        >
          <span className={'h-1.5 w-1.5 rounded-full ' + (online ? 'bg-emerald-500' : 'bg-amber-500')} />
          {online ? 'Online' : 'Offline'}
        </span>
      </div>

      {isAdmin ? (
        <button
          onClick={onLogout}
          className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
          title="Sair da conta admin"
        >
          <User size={14} />
          <span className="hidden sm:inline">{username}</span>
          <LogOut size={12} />
        </button>
      ) : (
        <button
          onClick={onLogin}
          className="ml-2 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
          title="Login administrador"
        >
          <LogIn size={14} />
          <span className="hidden sm:inline">Entrar</span>
        </button>
      )}
    </header>
  );
}
