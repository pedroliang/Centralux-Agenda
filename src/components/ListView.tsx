import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, Check, Pencil, Trash2 } from 'lucide-react';
import { COLORS } from '../lib/colors';
import { Task } from '../types';

interface Props {
  tasks: Task[];
  onSelect: (t: Task) => void;
  onToggleDone: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}

export function ListView({ tasks, onSelect, onToggleDone, onDelete }: Props) {
  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-10 text-center text-slate-500 dark:text-slate-400">
        <div>
          <div className="text-4xl mb-2">📅</div>
          <div className="font-medium">Nenhuma tarefa encontrada</div>
          <div className="text-sm mt-1">Crie sua primeira tarefa clicando em "Nova tarefa".</div>
        </div>
      </div>
    );
  }

  // Agrupa por dia
  const groups: Record<string, Task[]> = {};
  for (const t of tasks) {
    const key = format(parseISO(t.start_at), 'yyyy-MM-dd');
    (groups[key] ??= []).push(t);
  }
  const keys = Object.keys(groups).sort();

  return (
    <div className="flex-1 overflow-auto cl-scroll p-4 space-y-5">
      {keys.map(k => (
        <div key={k}>
          <div className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
            {format(parseISO(k + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: ptBR }).replace(/^./, c => c.toUpperCase())}
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {groups[k].map(t => {
              const c = COLORS[t.color] ?? COLORS.blue;
              return (
                <div key={t.id} className="group flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <button
                    onClick={() => onToggleDone(t.id, !t.completed)}
                    className={
                      'h-5 w-5 rounded-[5px] border flex items-center justify-center shrink-0 ' +
                      (t.completed
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-brand-500')
                    }
                    aria-label="Alternar concluída"
                  >
                    {t.completed && <Check size={12} strokeWidth={3} />}
                  </button>
                  <span className={'h-2.5 w-2.5 rounded-full shrink-0 ' + c.dot} />
                  <div className="flex-1 min-w-0" onClick={() => onSelect(t)}>
                    <div className={'text-sm font-medium truncate ' + (t.completed ? 'line-through text-slate-400' : '')}>
                      {t.title || '(sem título)'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      {t.all_day ? (
                        <span>Dia todo</span>
                      ) : (
                        <span>
                          {format(parseISO(t.start_at), 'HH:mm')}
                          {t.end_at ? ` – ${format(parseISO(t.end_at), 'HH:mm')}` : ''}
                        </span>
                      )}
                      {t.alarm_at && (
                        <span className="inline-flex items-center gap-0.5">
                          <Bell size={11} /> {format(parseISO(t.alarm_at), 'HH:mm')}
                        </span>
                      )}
                      {t.description && <span className="truncate">· {t.description}</span>}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    <button
                      onClick={() => onSelect(t)}
                      className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                      aria-label="Editar"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Excluir esta tarefa?')) onDelete(t.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-rose-500/10 text-rose-600"
                      aria-label="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
