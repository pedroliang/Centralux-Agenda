import { format, isSameDay, isSameMonth } from 'date-fns';
import { BR_WEEKDAYS_SHORT, monthGrid, tasksOnDay } from '../lib/dates';
import { Task } from '../types';
import { TaskChip } from './TaskChip';

interface Props {
  refDate: Date;
  tasks: Task[];
  onSelectTask: (t: Task) => void;
  onCreateAt: (day: Date) => void;
  onToggleDone: (id: string, done: boolean) => void;
}

export function MonthView({ refDate, tasks, onSelectTask, onCreateAt, onToggleDone }: Props) {
  const days = monthGrid(refDate);
  const today = new Date();
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {BR_WEEKDAYS_SHORT.map((w, i) => (
          <div key={i} className="py-2 text-center text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800 first:border-l-0">
            {w}
          </div>
        ))}
      </div>
      <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-auto cl-scroll">
        {days.map((d, idx) => {
          const inMonth = isSameMonth(d, refDate);
          const isToday = isSameDay(d, today);
          const dayTasks = tasksOnDay(tasks, d);
          const visible = dayTasks.slice(0, 4);
          const extra = dayTasks.length - visible.length;
          return (
            <div
              key={idx}
              className={
                'border-l border-t border-slate-200 dark:border-slate-800 first:border-l-0 p-1.5 min-h-[110px] flex flex-col gap-1 ' +
                (inMonth ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/60 dark:bg-slate-900/40')
              }
              onDoubleClick={() => {
                const start = new Date(d);
                start.setHours(9, 0, 0, 0);
                onCreateAt(start);
              }}
            >
              <div className="flex items-center justify-between">
                <div
                  className={
                    'inline-flex h-6 min-w-[24px] px-1.5 items-center justify-center rounded-full text-xs ' +
                    (isToday
                      ? 'bg-brand-600 text-white font-semibold'
                      : inMonth
                        ? 'text-slate-700 dark:text-slate-200'
                        : 'text-slate-400 dark:text-slate-600')
                  }
                >
                  {format(d, 'd')}
                </div>
                <button
                  onClick={() => {
                    const start = new Date(d);
                    start.setHours(9, 0, 0, 0);
                    onCreateAt(start);
                  }}
                  className="text-[10px] text-slate-400 hover:text-brand-500"
                  aria-label="Criar tarefa neste dia"
                >
                  +
                </button>
              </div>
              <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                {visible.map(t => (
                  <TaskChip key={t.id} task={t} compact onClick={() => onSelectTask(t)} onToggleDone={d => onToggleDone(t.id, d)} />
                ))}
                {extra > 0 && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-1">+{extra} mais</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
