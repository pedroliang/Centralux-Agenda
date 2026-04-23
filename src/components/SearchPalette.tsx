import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COLORS } from '../lib/colors';
import { Task } from '../types';

interface Props {
  open: boolean;
  tasks: Task[];
  initialQuery?: string;
  onClose: () => void;
  onSelect: (t: Task) => void;
}

function scoreTask(t: Task, q: string): number {
  const hay = (t.title + ' ' + (t.description || '')).toLowerCase();
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  if (t.title.toLowerCase() === needle) return 1000;
  if (t.title.toLowerCase().startsWith(needle)) return 500;
  if (t.title.toLowerCase().includes(needle)) return 200;
  if (hay.includes(needle)) return 50;
  // match por tokens
  const tokens = needle.split(/\s+/).filter(Boolean);
  let s = 0;
  for (const tok of tokens) if (hay.includes(tok)) s += 10;
  return s;
}

export function SearchPalette({ open, tasks, initialQuery = '', onClose, onSelect }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery(initialQuery);
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, initialQuery]);

  const results = useMemo(() => {
    if (!query.trim()) {
      // Sem query, mostra as próximas 20 tarefas futuras (e hoje)
      const now = Date.now();
      return [...tasks]
        .filter(t => +parseISO(t.start_at) >= now - 86400000)
        .sort((a, b) => a.start_at.localeCompare(b.start_at))
        .slice(0, 20);
    }
    return tasks
      .map(t => ({ t, s: scoreTask(t, query) }))
      .filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || a.t.start_at.localeCompare(b.t.start_at))
      .slice(0, 30)
      .map(x => x.t);
  }, [tasks, query]);

  useEffect(() => { setIndex(0); }, [query]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setIndex(i => Math.min(results.length - 1, i + 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setIndex(i => Math.max(0, i - 1));
      }
      if (e.key === 'Enter') {
        const t = results[index];
        if (t) { onSelect(t); onClose(); }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, results, index, onSelect, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/50 backdrop-blur-sm cl-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <Search size={16} className="text-slate-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Pesquisar tarefas por título, descrição..."
            className="flex-1 bg-transparent outline-none text-sm placeholder-slate-400"
          />
          <kbd className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-500">ESC</kbd>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Fechar">
            <X size={14} />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-auto cl-scroll">
          {results.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Nenhum resultado para <span className="font-medium">"{query}"</span>.
            </div>
          )}
          {results.map((t, i) => {
            const c = COLORS[t.color] ?? COLORS.blue;
            return (
              <button
                key={t.id}
                onClick={() => { onSelect(t); onClose(); }}
                onMouseEnter={() => setIndex(i)}
                className={
                  'w-full text-left px-4 py-2.5 flex items-center gap-3 ' +
                  (i === index ? 'bg-brand-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/70')
                }
              >
                <span className={'h-2.5 w-2.5 rounded-full shrink-0 ' + c.dot} />
                <div className="min-w-0 flex-1">
                  <div className={'text-sm font-medium truncate ' + (t.completed ? 'line-through text-slate-400' : '')}>
                    {t.title || '(sem título)'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {format(parseISO(t.start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    {t.description ? ' · ' + t.description : ''}
                  </div>
                </div>
                {t.completed && (
                  <span className="text-[10px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400">feita</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="px-4 py-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <span><kbd className="px-1 rounded border border-slate-300 dark:border-slate-700">↑↓</kbd> navegar</span>
          <span><kbd className="px-1 rounded border border-slate-300 dark:border-slate-700">Enter</kbd> abrir</span>
          <span className="ml-auto">{results.length} resultado{results.length !== 1 ? 's' : ''}</span>
        </div>
      </div>
    </div>
  );
}
