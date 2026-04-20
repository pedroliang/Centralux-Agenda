import { Bell, Check } from 'lucide-react';
import { COLORS } from '../lib/colors';
import { fmtTime } from '../lib/dates';
import { Task } from '../types';

interface Props {
  task: Task;
  compact?: boolean;
  onClick?: () => void;
  onToggleDone?: (done: boolean) => void;
  style?: React.CSSProperties;
  className?: string;
}

export function TaskChip({ task, compact, onClick, onToggleDone, style, className }: Props) {
  const c = COLORS[task.color] ?? COLORS.blue;
  return (
    <div
      style={style}
      onClick={onClick}
      className={
        'group relative rounded-md border-l-2 pl-2 pr-1 py-1 cursor-pointer select-none ' +
        c.bg + ' ' + c.ring +
        (task.completed ? ' opacity-60' : '') +
        ' ' + (className ?? '')
      }
    >
      <div className="flex items-start gap-1.5 min-w-0">
        {onToggleDone && (
          <button
            onClick={e => { e.stopPropagation(); onToggleDone(!task.completed); }}
            className={
              'mt-0.5 h-3.5 w-3.5 rounded-[4px] border flex items-center justify-center shrink-0 ' +
              (task.completed
                ? 'bg-brand-600 border-brand-600 text-white'
                : 'border-slate-400 dark:border-slate-500 hover:border-brand-500')
            }
            aria-label={task.completed ? 'Desmarcar concluída' : 'Marcar como concluída'}
          >
            {task.completed && <Check size={10} strokeWidth={3} />}
          </button>
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <div className={'text-[11px] font-medium truncate ' + (task.completed ? 'line-through' : '')}>
            {task.title || '(sem título)'}
          </div>
          {!compact && !task.all_day && (
            <div className="text-[10px] opacity-80 truncate">
              {fmtTime(task.start_at)}
              {task.end_at ? ` – ${fmtTime(task.end_at)}` : ''}
              {task.alarm_at ? <Bell size={9} className="inline ml-1 -mt-0.5" /> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
