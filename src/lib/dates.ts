import {
  addDays, addMinutes, differenceInMinutes, endOfDay, endOfMonth, endOfWeek,
  format, isSameDay, isSameMonth, isWithinInterval, parseISO, startOfDay,
  startOfMonth, startOfWeek, subDays
} from 'date-fns';
import { Task, ViewMode } from '../types';

export const BR_WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const BR_MONTHS = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'
];

export function formatHeader(ref: Date, mode: ViewMode): string {
  if (mode === 'day') return format(ref, "EEEE, d 'de' MMMM 'de' yyyy").replace(/^./, c => c.toUpperCase());
  if (mode === 'month' || mode === 'list') {
    return `${BR_MONTHS[ref.getMonth()]} de ${ref.getFullYear()}`;
  }
  const start = startOfWeek(ref, { weekStartsOn: 0 });
  const end = endOfWeek(ref, { weekStartsOn: 0 });
  const sameMonth = isSameMonth(start, end);
  if (sameMonth) {
    return `${format(start, 'd')} – ${format(end, 'd')} de ${BR_MONTHS[start.getMonth()]} de ${start.getFullYear()}`;
  }
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy')}`;
}

export function weekDays(ref: Date): Date[] {
  const start = startOfWeek(ref, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthGrid(ref: Date): Date[] {
  const firstDay = startOfMonth(ref);
  const lastDay = endOfMonth(ref);
  const gridStart = startOfWeek(firstDay, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(lastDay, { weekStartsOn: 0 });
  const days: Date[] = [];
  let cur = gridStart;
  while (cur <= gridEnd) {
    days.push(cur);
    cur = addDays(cur, 1);
  }
  return days;
}

export function navigate(ref: Date, mode: ViewMode, dir: -1 | 1): Date {
  if (mode === 'day') return dir === 1 ? addDays(ref, 1) : subDays(ref, 1);
  if (mode === 'week') return dir === 1 ? addDays(ref, 7) : subDays(ref, 7);
  // month / list
  const d = new Date(ref);
  d.setMonth(d.getMonth() + dir);
  return d;
}

export function tasksOnDay(tasks: Task[], day: Date): Task[] {
  const dStart = startOfDay(day);
  const dEnd = endOfDay(day);
  return tasks
    .filter(t => {
      const s = parseISO(t.start_at);
      const e = t.end_at ? parseISO(t.end_at) : addMinutes(s, 30);
      return isWithinInterval(s, { start: dStart, end: dEnd }) ||
             isWithinInterval(e, { start: dStart, end: dEnd }) ||
             (s < dStart && e > dEnd);
    })
    .sort((a, b) => +parseISO(a.start_at) - +parseISO(b.start_at));
}

export interface PositionedTask {
  task: Task;
  topPct: number;    // 0..100 relativo ao dia (0h–24h)
  heightPct: number;
  col: number;
  cols: number;
}

/**
 * Layout em colunas para eventos sobrepostos no mesmo dia.
 */
export function layoutDayTasks(tasks: Task[], day: Date): PositionedTask[] {
  const dStart = startOfDay(day);
  const items = tasks
    .filter(t => !t.all_day)
    .map(t => {
      const s = parseISO(t.start_at);
      const e = t.end_at ? parseISO(t.end_at) : addMinutes(s, 30);
      const clampedStart = s < dStart ? dStart : s;
      const clampedEnd = e > endOfDay(day) ? endOfDay(day) : e;
      const top = differenceInMinutes(clampedStart, dStart);
      const height = Math.max(24, differenceInMinutes(clampedEnd, clampedStart));
      return { task: t, top, height, end: top + height };
    })
    .sort((a, b) => a.top - b.top || b.end - a.end);

  // Agrupa clusters que se sobrepõem
  const positioned: PositionedTask[] = [];
  let cluster: typeof items = [];
  let clusterEnd = -1;

  const flush = () => {
    // Atribui colunas gulosamente
    const cols: number[] = []; // fim do último item em cada coluna
    const placed = cluster.map(it => {
      let c = 0;
      for (; c < cols.length; c++) {
        if (cols[c] <= it.top) break;
      }
      cols[c] = it.end;
      return { ...it, col: c };
    });
    const total = cols.length;
    placed.forEach(p => {
      positioned.push({
        task: p.task,
        topPct: (p.top / (24 * 60)) * 100,
        heightPct: (p.height / (24 * 60)) * 100,
        col: p.col,
        cols: total
      });
    });
  };

  for (const it of items) {
    if (cluster.length === 0 || it.top < clusterEnd) {
      cluster.push(it);
      clusterEnd = Math.max(clusterEnd, it.end);
    } else {
      flush();
      cluster = [it];
      clusterEnd = it.end;
    }
  }
  if (cluster.length) flush();

  return positioned;
}

export function fmtTime(d: Date | string): string {
  const date = typeof d === 'string' ? parseISO(d) : d;
  return format(date, 'HH:mm');
}

export function fmtDateInput(d: Date): string {
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function sameDay(a: Date, b: Date): boolean {
  return isSameDay(a, b);
}
