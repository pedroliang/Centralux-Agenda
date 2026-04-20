import { TaskColor } from '../types';

/**
 * Paleta calibrada para funcionar bem em dark e light.
 * `bg` = fundo do chip; `ring` = borda esquerda; `dot` = bolinha indicadora.
 */
export const COLORS: Record<TaskColor, { bg: string; ring: string; dot: string; label: string }> = {
  blue:   { label: 'Azul',    bg: 'bg-blue-500/15 text-blue-700 dark:text-blue-200',       ring: 'border-blue-500',   dot: 'bg-blue-500' },
  green:  { label: 'Verde',   bg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200', ring: 'border-emerald-500', dot: 'bg-emerald-500' },
  red:    { label: 'Vermelho',bg: 'bg-rose-500/15 text-rose-700 dark:text-rose-200',       ring: 'border-rose-500',   dot: 'bg-rose-500' },
  yellow: { label: 'Amarelo', bg: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',    ring: 'border-amber-500',  dot: 'bg-amber-500' },
  purple: { label: 'Roxo',    bg: 'bg-violet-500/15 text-violet-700 dark:text-violet-200', ring: 'border-violet-500', dot: 'bg-violet-500' },
  pink:   { label: 'Rosa',    bg: 'bg-pink-500/15 text-pink-700 dark:text-pink-200',       ring: 'border-pink-500',   dot: 'bg-pink-500' },
  slate:  { label: 'Cinza',   bg: 'bg-slate-500/15 text-slate-700 dark:text-slate-200',    ring: 'border-slate-500',  dot: 'bg-slate-500' }
};

export const COLOR_KEYS: TaskColor[] = ['blue', 'green', 'red', 'yellow', 'purple', 'pink', 'slate'];
