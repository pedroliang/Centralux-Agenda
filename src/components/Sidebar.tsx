import { CheckSquare, ListTodo, Plus, Sparkles } from 'lucide-react';
import { MiniCalendar } from './MiniCalendar';
import { Task } from '../types';

interface Props {
  open: boolean;
  refDate: Date;
  selected: Date;
  tasks: Task[];
  onSelectDate: (d: Date) => void;
  onChangeRef: (d: Date) => void;
  onNew: () => void;
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
}

export function Sidebar({
  open, refDate, selected, tasks,
  onSelectDate, onChangeRef, onNew,
  hideCompleted, onToggleHideCompleted
}: Props) {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;

  return (
    <aside
      className={
        'shrink-0 transition-all duration-300 ease-out border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ' +
        (open ? 'w-64' : 'w-0') +
        ' overflow-hidden'
      }
    >
      <div className="w-64 p-3 h-full flex flex-col gap-4">
        <button
          onClick={onNew}
          className="inline-flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow"
        >
          <Plus size={16} /> Criar
        </button>

        <MiniCalendar ref={refDate} selected={selected} onSelect={onSelectDate} onChangeRef={onChangeRef} />

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Sparkles size={15} className="text-brand-500" /> Resumo
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Total" value={total} />
            <Stat label="Pendentes" value={pending} tone="amber" />
            <Stat label="Feitas" value={done} tone="emerald" />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-sm">
          <div className="flex items-center gap-2 font-medium mb-2">
            <ListTodo size={15} className="text-brand-500" /> Filtros
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={onToggleHideCompleted}
              className="accent-brand-600 h-4 w-4"
            />
            <span className="text-slate-700 dark:text-slate-300">Ocultar concluídas</span>
          </label>
        </div>

        <div className="mt-auto text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <CheckSquare size={12} />
          Celtralux Agenda · v1.0
        </div>
      </div>
    </aside>
  );
}

function Stat({ label, value, tone = 'slate' }: { label: string; value: number; tone?: 'slate' | 'amber' | 'emerald' }) {
  const toneCls =
    tone === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-300'
      : tone === 'amber'
        ? 'text-amber-600 dark:text-amber-300'
        : 'text-slate-700 dark:text-slate-200';
  return (
    <div className="flex flex-col items-center">
      <div className={'text-xl font-semibold ' + toneCls}>{value}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
