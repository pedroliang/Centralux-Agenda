import { format, parseISO } from 'date-fns';
import { AlarmClock, Check, X } from 'lucide-react';
import { Task } from '../types';

interface Props {
  tasks: Task[];
  onDismiss: (id: string) => void;
  onDismissAll: () => void;
  onMarkDone: (id: string) => void;
  onOpen: (t: Task) => void;
}

export function AlarmPopup({ tasks, onDismiss, onDismissAll, onMarkDone, onOpen }: Props) {
  if (tasks.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[360px] max-w-[calc(100vw-2rem)] space-y-2">
      {tasks.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={onDismissAll}
            className="text-[11px] text-slate-600 dark:text-slate-300 hover:underline"
          >
            Dispensar todos ({tasks.length})
          </button>
        </div>
      )}
      {tasks.slice(-5).map(t => (
        <div
          key={t.id}
          className="cl-fade-in rounded-xl border border-amber-400/50 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
        >
          <div className="flex items-start gap-3 p-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlarmClock size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{t.title}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t.all_day ? 'Dia todo' : format(parseISO(t.start_at), "dd/MM 'às' HH:mm")}
              </div>
              {t.description && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{t.description}</div>
              )}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              aria-label="Fechar"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex items-center border-t border-slate-200 dark:border-slate-800 text-sm">
            <button
              onClick={() => { onMarkDone(t.id); onDismiss(t.id); }}
              className="flex-1 py-2 inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-emerald-600"
            >
              <Check size={14} /> Concluir
            </button>
            <div className="w-px bg-slate-200 dark:bg-slate-800 h-6" />
            <button
              onClick={() => onOpen(t)}
              className="flex-1 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              Abrir
            </button>
            <div className="w-px bg-slate-200 dark:bg-slate-800 h-6" />
            <button
              onClick={() => onDismiss(t.id)}
              className="flex-1 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-300"
            >
              Adiar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
