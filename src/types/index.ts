export type TaskColor =
  | 'blue'
  | 'green'
  | 'red'
  | 'yellow'
  | 'purple'
  | 'pink'
  | 'slate';

export interface Task {
  id: string;
  title: string;
  description: string;
  start_at: string;        // ISO
  end_at: string | null;   // ISO
  alarm_at: string | null; // ISO
  all_day: boolean;
  completed: boolean;
  completed_at: string | null;
  color: TaskColor;
  author: string | null;
  created_at: string;
  updated_at: string;
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'updated_at' | 'completed_at'>;

export type ViewMode = 'day' | 'week' | 'month' | 'list';

export type ThemeMode = 'light' | 'dark';
