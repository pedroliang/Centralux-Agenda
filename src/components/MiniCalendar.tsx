import { addMonths, format, isSameDay, isSameMonth, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BR_MONTHS, BR_WEEKDAYS_SHORT, monthGrid } from '../lib/dates';

interface Props {
  ref: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  onChangeRef: (d: Date) => void;
}

export function MiniCalendar({ ref, selected, onSelect, onChangeRef }: Props) {
  const today = new Date();
  const days = monthGrid(ref);
  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-2">
        <div className="text-sm font-medium">
          {BR_MONTHS[ref.getMonth()]} {ref.getFullYear()}
        </div>
        <div className="flex items-center">
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => onChangeRef(subMonths(ref, 1))} aria-label="Mês anterior">
            <ChevronLeft size={14} />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => onChangeRef(addMonths(ref, 1))} aria-label="Próximo mês">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 dark:text-slate-500 mb-1">
        {BR_WEEKDAYS_SHORT.map(d => (
          <div key={d}>{d[0]}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((d, i) => {
          const inMonth = isSameMonth(d, ref);
          const isToday = isSameDay(d, today);
          const isSelected = isSameDay(d, selected);
          return (
            <button
              key={i}
              onClick={() => onSelect(d)}
              className={
                'h-7 text-xs rounded-full flex items-center justify-center ' +
                (isSelected
                  ? 'bg-brand-600 text-white font-semibold'
                  : isToday
                    ? 'border border-brand-500 text-brand-600 dark:text-brand-300'
                    : inMonth
                      ? 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      : 'text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800')
              }
            >
              {format(d, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
