import { useEffect, useRef, useState } from 'react';
import { parseISO } from 'date-fns';
import { Task } from '../types';

const TRIGGERED_KEY = 'celtralux-triggered-alarms';

function loadTriggered(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TRIGGERED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveTriggered(map: Record<string, string>) {
  try { localStorage.setItem(TRIGGERED_KEY, JSON.stringify(map)); } catch { /* ignore */ }
}

/**
 * Observa a lista de tarefas e dispara alarmes cujo alarm_at já passou,
 * desde que ainda não tenham sido disparados (persistido em localStorage).
 */
export function useAlarms(tasks: Task[]) {
  const [active, setActive] = useState<Task[]>([]);
  const triggered = useRef<Record<string, string>>(loadTriggered());

  useEffect(() => {
    let timer: number | undefined;

    const tick = () => {
      const now = Date.now();
      const newly: Task[] = [];
      for (const t of tasks) {
        if (!t.alarm_at || t.completed) continue;
        const at = +parseISO(t.alarm_at);
        if (isNaN(at)) continue;
        const key = `${t.id}:${t.alarm_at}`;
        if (at <= now && !triggered.current[key]) {
          triggered.current[key] = new Date().toISOString();
          newly.push(t);
        }
      }
      if (newly.length) {
        saveTriggered(triggered.current);
        setActive(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...newly.filter(t => !ids.has(t.id))];
        });
        // Toca um "beep" simples (sem arquivos externos)
        try {
          const AC = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
          const ctx = new AC();
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = 'sine';
          o.frequency.value = 880;
          g.gain.value = 0.0001;
          o.connect(g).connect(ctx.destination);
          o.start();
          g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
          o.stop(ctx.currentTime + 0.65);
        } catch { /* silencioso */ }
        // Notificação nativa, se permitida
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            newly.forEach(t => new Notification('⏰ ' + t.title, {
              body: t.description || 'Lembrete da Celtralux Agenda',
              tag: 'celtralux-' + t.id
            }));
          }
        } catch { /* ignore */ }
      }
    };

    tick();
    timer = window.setInterval(tick, 15000);
    return () => { if (timer) window.clearInterval(timer); };
  }, [tasks]);

  const dismiss = (id: string) => setActive(prev => prev.filter(t => t.id !== id));
  const dismissAll = () => setActive([]);

  return { active, dismiss, dismissAll };
}
