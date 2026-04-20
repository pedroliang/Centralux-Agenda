import { useEffect, useMemo, useRef, useState } from 'react';
import { differenceInMinutes, format, isSameDay, parseISO, startOfDay } from 'date-fns';
import { BR_WEEKDAYS_SHORT, layoutDayTasks, tasksOnDay, weekDays } from '../lib/dates';
import { Task } from '../types';
import { TaskChip } from './TaskChip';

const HOUR_HEIGHT = 48; // px por hora
const HOURS = Array.from({ length: 24 }, (_, i) => i);

interface Props {
  days: Date[];                  // 1 dia (view 'day') ou 7 dias (view 'week')
  tasks: Task[];
  onSelectTask: (t: Task) => void;
  onCreateAt: (start: Date) => void;
  onToggleDone: (id: string, done: boolean) => void;
}

export function TimeGrid({ days, tasks, onSelectTask, onCreateAt, onToggleDone }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(t);
  }, []);

  // Auto-scroll para ~8h na primeira renderização
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = Math.max(0, (8 * HOUR_HEIGHT) - 40);
  }, []);

  const allDayPerDay = useMemo(() => {
    return days.map(d =>
      tasksOnDay(tasks, d).filter(t => t.all_day)
    );
  }, [days, tasks]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Cabeçalho com dias */}
      <div className="grid border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
           style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(0,1fr))` }}>
        <div />
        {days.map((d, i) => {
          const isToday = isSameDay(d, new Date());
          return (
            <div key={i} className="py-2 text-center border-l border-slate-200 dark:border-slate-800">
              <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {BR_WEEKDAYS_SHORT[d.getDay()]}
              </div>
              <div
                className={
                  'inline-flex h-8 w-8 items-center justify-center rounded-full text-sm mt-0.5 ' +
                  (isToday ? 'bg-brand-600 text-white font-semibold' : 'text-slate-800 dark:text-slate-100')
                }
              >
                {format(d, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Linha "dia todo" */}
      <div className="grid border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60"
           style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(0,1fr))` }}>
        <div className="py-1 pr-2 text-right text-[10px] text-slate-400 uppercase tracking-wide">Dia todo</div>
        {days.map((_, i) => (
          <div key={i} className="border-l border-slate-200 dark:border-slate-800 p-1 min-h-[28px] space-y-0.5">
            {allDayPerDay[i].map(t => (
              <TaskChip key={t.id} task={t} compact onClick={() => onSelectTask(t)} onToggleDone={d => onToggleDone(t.id, d)} />
            ))}
          </div>
        ))}
      </div>

      {/* Área rolável com horas */}
      <div ref={scrollRef} className="flex-1 overflow-auto cl-scroll">
        <div
          className="grid relative"
          style={{ gridTemplateColumns: `60px repeat(${days.length}, minmax(0,1fr))` }}
        >
          {/* Coluna de horários */}
          <div className="relative">
            {HOURS.map(h => (
              <div key={h} style={{ height: HOUR_HEIGHT }} className="relative">
                <div className="absolute -top-2 right-2 text-[10px] text-slate-400 tabular-nums">
                  {h.toString().padStart(2, '0')}:00
                </div>
              </div>
            ))}
          </div>

          {/* Colunas dos dias */}
          {days.map((d, idx) => {
            const dayTasks = tasksOnDay(tasks, d);
            const positioned = layoutDayTasks(dayTasks, d);
            const showNow = isSameDay(d, now);
            const nowMinutes = differenceInMinutes(now, startOfDay(now));
            const nowTop = (nowMinutes / 60) * HOUR_HEIGHT;
            return (
              <div key={idx} className="relative border-l border-slate-200 dark:border-slate-800">
                {HOURS.map(h => (
                  <div
                    key={h}
                    style={{ height: HOUR_HEIGHT }}
                    onClick={() => {
                      const start = new Date(d);
                      start.setHours(h, 0, 0, 0);
                      onCreateAt(start);
                    }}
                    className="border-b border-slate-100 dark:border-slate-800/80 hover:bg-brand-500/5 cursor-cell"
                  />
                ))}

                {/* Eventos */}
                {positioned.map(p => {
                  const width = 100 / p.cols;
                  const left = p.col * width;
                  const top = (p.topPct / 100) * (24 * HOUR_HEIGHT);
                  const height = Math.max(22, (p.heightPct / 100) * (24 * HOUR_HEIGHT) - 2);
                  return (
                    <TaskChip
                      key={p.task.id}
                      task={p.task}
                      onClick={() => onSelectTask(p.task)}
                      onToggleDone={done => onToggleDone(p.task.id, done)}
                      className="absolute cl-fade-in shadow-sm"
                      style={{
                        top,
                        height,
                        left: `calc(${left}% + 2px)`,
                        width: `calc(${width}% - 4px)`
                      }}
                    />
                  );
                })}

                {showNow && (
                  <div className="cl-now-line" style={{ top: nowTop }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function useWeekDays(ref: Date) {
  return useMemo(() => weekDays(ref), [ref]);
}

// Helpers re-exports para consumidores externos (não usado diretamente, mas útil)
export { parseISO };
