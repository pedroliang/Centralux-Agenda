import { useEffect, useMemo, useState } from 'react';
import { AlarmPopup } from './components/AlarmPopup';
import { Header } from './components/Header';
import { ListView } from './components/ListView';
import { LoginModal } from './components/LoginModal';
import { MonthView } from './components/MonthView';
import { SearchPalette } from './components/SearchPalette';
import { SetupBanner } from './components/SetupBanner';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { TimeGrid } from './components/TimeGrid';
import { useAlarms } from './hooks/useAlarms';
import { useAuth } from './hooks/useAuth';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import { navigate, weekDays } from './lib/dates';
import { NewTask, Task, ViewMode } from './types';

export default function App() {
  const { tasks, add, update, toggleDone, remove, online, loading } = useTasks();
  const { theme, toggle: toggleTheme } = useTheme();
  const auth = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  const [refDate, setRefDate] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const [view, setView] = useState<ViewMode>('week');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);

  const [editing, setEditing] = useState<Task | null>(null);
  const [creating, setCreating] = useState<{ start: Date } | null>(null);

  const { active, dismiss, dismissAll } = useAlarms(tasks);

  // Solicita permissão de notificação uma vez
  useEffect(() => {
    try {
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().catch(() => { /* ignore */ });
      }
    } catch { /* ignore */ }
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const isEditing =
        (e.target as HTMLElement)?.tagName === 'INPUT' ||
        (e.target as HTMLElement)?.tagName === 'TEXTAREA' ||
        (e.target as HTMLElement)?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (isEditing) return;

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setCreating({ start: defaultCreateStart(selected) });
      }
      if (e.key === 't' || e.key === 'T') {
        const d = new Date();
        setRefDate(d); setSelected(d);
      }
      if (e.key === '1') setView('day');
      if (e.key === '2') setView('week');
      if (e.key === '3') setView('month');
      if (e.key === '4') setView('list');
      if (e.key === 'ArrowLeft')  setRefDate(r => navigate(r, view, -1));
      if (e.key === 'ArrowRight') setRefDate(r => navigate(r, view,  1));
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [view, selected]);

  // Filtra tarefas com hideCompleted + query (leve; a busca avançada está no palette)
  const visibleTasks = useMemo(() => {
    let list = tasks;
    if (hideCompleted) list = list.filter(t => !t.completed);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [tasks, hideCompleted, query]);

  const days = view === 'day' ? [refDate] : view === 'week' ? weekDays(refDate) : [];

  const handleCreateAt = (start: Date) => {
    if (!auth.isAdmin) { setLoginOpen(true); return; }
    setCreating({ start });
  };
  const handleSelectTask = (t: Task) => setEditing(t);

  return (
    <div className="h-full flex flex-col">
      <Header
        refDate={refDate}
        view={view}
        theme={theme}
        query={query}
        online={online}
        isAdmin={auth.isAdmin}
        username={auth.username}
        onToggleSidebar={() => setSidebarOpen(o => !o)}
        onPrev={() => setRefDate(r => navigate(r, view, -1))}
        onNext={() => setRefDate(r => navigate(r, view,  1))}
        onToday={() => { const d = new Date(); setRefDate(d); setSelected(d); }}
        onChangeView={setView}
        onQuery={q => { setQuery(q); if (q && !searchOpen) setSearchOpen(true); }}
        onNew={() => {
          if (!auth.isAdmin) { setLoginOpen(true); return; }
          setCreating({ start: defaultCreateStart(selected) });
        }}
        onToggleTheme={toggleTheme}
        onLogin={() => setLoginOpen(true)}
        onLogout={auth.logout}
      />

      {!online && <SetupBanner />}

      <div className="flex-1 flex min-h-0">
        <Sidebar
          open={sidebarOpen}
          refDate={refDate}
          selected={selected}
          tasks={tasks}
          isAdmin={auth.isAdmin}
          onSelectDate={d => {
            setSelected(d); setRefDate(d);
            if (view === 'month') setView('day');
          }}
          onChangeRef={setRefDate}
          onNew={() => {
            if (!auth.isAdmin) { setLoginOpen(true); return; }
            setCreating({ start: defaultCreateStart(selected) });
          }}
          hideCompleted={hideCompleted}
          onToggleHideCompleted={() => setHideCompleted(v => !v)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950">
          {loading && tasks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">Carregando agenda...</div>
          ) : view === 'month' ? (
            <MonthView
              refDate={refDate}
              tasks={visibleTasks}
              onSelectTask={handleSelectTask}
              onCreateAt={handleCreateAt}
              onToggleDone={toggleDone}
            />
          ) : view === 'list' ? (
            <ListView
              tasks={visibleTasks}
              onSelect={handleSelectTask}
              onToggleDone={toggleDone}
              onDelete={remove}
            />
          ) : (
            <TimeGrid
              days={days}
              tasks={visibleTasks}
              onSelectTask={handleSelectTask}
              onCreateAt={handleCreateAt}
              onToggleDone={toggleDone}
            />
          )}
        </main>
      </div>

      {(editing || creating) && (
        <TaskModal
          task={editing}
          initialStart={creating?.start}
          isAdmin={auth.isAdmin}
          onClose={() => { setEditing(null); setCreating(null); }}
          onSave={async (t: NewTask) => { await add(t); }}
          onUpdate={update}
          onDelete={remove}
        />
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={auth.login}
      />

      <SearchPalette
        open={searchOpen}
        initialQuery={query}
        tasks={tasks}
        onClose={() => setSearchOpen(false)}
        onSelect={(t) => {
          setEditing(t);
          setSelected(new Date(t.start_at));
          setRefDate(new Date(t.start_at));
        }}
      />

      <AlarmPopup
        tasks={active}
        onDismiss={dismiss}
        onDismissAll={dismissAll}
        onMarkDone={(id) => toggleDone(id, true)}
        onOpen={(t) => setEditing(t)}
      />
    </div>
  );
}

function defaultCreateStart(selected: Date): Date {
  const d = new Date(selected);
  const now = new Date();
  // Se o dia selecionado é hoje, abre próximo horário redondo; senão, 09:00
  if (d.toDateString() === now.toDateString()) {
    d.setMinutes(0, 0, 0);
    d.setHours(now.getHours() + 1);
  } else {
    d.setHours(9, 0, 0, 0);
  }
  return d;
}
