import { format, parseISO } from 'date-fns';
import { Bell, Calendar, Palette, Save, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { COLOR_KEYS, COLORS } from '../lib/colors';
import { fmtDateInput } from '../lib/dates';
import { NewTask, Task, TaskColor } from '../types';

interface Props {
  task: Task | null;
  initialStart?: Date;
  isAdmin: boolean;
  onClose: () => void;
  onSave: (t: NewTask) => Promise<void>;
  onUpdate: (id: string, patch: Partial<Task>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ALARM_OPTIONS = [
  { v: 0,    label: 'Na hora' },
  { v: 5,    label: '5 min antes' },
  { v: 10,   label: '10 min antes' },
  { v: 15,   label: '15 min antes' },
  { v: 30,   label: '30 min antes' },
  { v: 60,   label: '1 hora antes' },
  { v: 1440, label: '1 dia antes' }
];

function computeAlarmMinutesBefore(start: string | null, alarm: string | null): number | null {
  if (!start || !alarm) return null;
  const diff = Math.round((+parseISO(start) - +parseISO(alarm)) / 60000);
  return diff >= 0 ? diff : null;
}

export function TaskModal({ task, initialStart, isAdmin, onClose, onSave, onUpdate, onDelete }: Props) {
  const now = useMemo(() => initialStart ?? new Date(), [initialStart]);
  const defaultStart = useMemo(() => {
    const d = new Date(now);
    if (!initialStart) {
      d.setMinutes(0, 0, 0);
      d.setHours(d.getHours() + 1);
    }
    return d;
  }, [initialStart, now]);
  const defaultEnd = useMemo(() => {
    const d = new Date(defaultStart);
    d.setHours(d.getHours() + 1);
    return d;
  }, [defaultStart]);

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [allDay, setAllDay] = useState(task?.all_day ?? false);
  const [start, setStart] = useState(task ? fmtDateInput(parseISO(task.start_at)) : fmtDateInput(defaultStart));
  const [end, setEnd] = useState(
    task?.end_at ? fmtDateInput(parseISO(task.end_at)) : fmtDateInput(defaultEnd)
  );
  const [color, setColor] = useState<TaskColor>(task?.color ?? 'blue');
  const [author, setAuthor] = useState(task?.author ?? (localStorage.getItem('celtralux-author') ?? ''));
  const [alarmEnabled, setAlarmEnabled] = useState(Boolean(task?.alarm_at));
  const [alarmMinutes, setAlarmMinutes] = useState<number>(
    computeAlarmMinutesBefore(task?.start_at ?? null, task?.alarm_at ?? null) ?? 15
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Dê um título para a tarefa.');
      return;
    }
    setSaving(true);

    const startISO = new Date(start).toISOString();
    const endISO = allDay ? null : new Date(end).toISOString();
    let alarmISO: string | null = null;
    if (alarmEnabled) {
      const a = new Date(new Date(start).getTime() - alarmMinutes * 60000);
      alarmISO = a.toISOString();
    }

    if (author) { try { localStorage.setItem('celtralux-author', author); } catch { /* ignore */ } }

    if (task) {
      await onUpdate(task.id, {
        title: title.trim(),
        description,
        start_at: startISO,
        end_at: endISO,
        alarm_at: alarmISO,
        all_day: allDay,
        color,
        author: author || 'anon'
      });
    } else {
      const payload: NewTask = {
        title: title.trim(),
        description,
        start_at: startISO,
        end_at: endISO,
        alarm_at: alarmISO,
        all_day: allDay,
        color,
        completed: false,
        author: author || 'anon'
      };
      await onSave(payload);
    }
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirm('Excluir esta tarefa?')) return;
    await onDelete(task.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-sm cl-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800">
          <div className="font-semibold">{task ? (isAdmin ? 'Editar tarefa' : 'Visualizar tarefa') : 'Nova tarefa'}</div>
          <button className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800" onClick={onClose} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Título da tarefa"
            readOnly={!isAdmin}
            className="w-full text-lg font-medium px-0 py-1 bg-transparent border-0 border-b border-slate-200 dark:border-slate-700 focus:border-brand-500 focus:outline-none"
          />

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              disabled={!isAdmin}
              className="accent-brand-600 h-4 w-4"
            />
            Dia todo
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Field label={<><Calendar size={13} className="inline -mt-0.5" /> Início</>}>
              <input
                type="datetime-local"
                value={start}
                onChange={e => setStart(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm"
              />
            </Field>
            <Field label="Fim">
              <input
                type="datetime-local"
                disabled={allDay}
                value={end}
                onChange={e => setEnd(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm disabled:opacity-50"
              />
            </Field>
          </div>

          <Field label="Descrição">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Notas, link, contexto..."
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={<><Palette size={13} className="inline -mt-0.5" /> Cor</>}>
              <div className="flex gap-1.5">
                {COLOR_KEYS.map(k => (
                  <button
                    key={k}
                    onClick={() => setColor(k)}
                    title={COLORS[k].label}
                    className={
                      'h-7 w-7 rounded-full border-2 ' + COLORS[k].dot + ' ' +
                      (color === k ? 'ring-2 ring-offset-2 ring-brand-500 ring-offset-white dark:ring-offset-slate-900 border-white' : 'border-white/0')
                    }
                  />
                ))}
              </div>
            </Field>
            <Field label="Criado por">
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Seu nome (opcional)"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm"
              />
            </Field>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Bell size={14} className="text-brand-500" />
              <input
                type="checkbox"
                checked={alarmEnabled}
                onChange={e => setAlarmEnabled(e.target.checked)}
                className="accent-brand-600 h-4 w-4"
              />
              Alarme popup
            </label>
            {alarmEnabled && (
              <div className="mt-2 flex items-center gap-2">
                <select
                  value={alarmMinutes}
                  onChange={e => setAlarmMinutes(Number(e.target.value))}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-sm"
                >
                  {ALARM_OPTIONS.map(o => (
                    <option key={o.v} value={o.v}>{o.label}</option>
                  ))}
                </select>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Dispara em {format(new Date(new Date(start).getTime() - alarmMinutes * 60000), 'dd/MM HH:mm')}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-800">
          <div>
            {task && isAdmin && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg text-rose-600 hover:bg-rose-500/10"
              >
                <Trash2 size={14} /> Excluir
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isAdmin ? 'Cancelar' : 'Fechar'}
            </button>
            {isAdmin && (
              <button
                disabled={saving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow disabled:opacity-60"
              >
                <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">{label}</div>
      {children}
    </label>
  );
}
