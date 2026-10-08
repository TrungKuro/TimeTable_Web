import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, TaskItem } from '@/types';

interface AppState {
  settings: AppSettings;
  tasks: TaskItem[];
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  setTasks: (tasks: TaskItem[]) => void;
  toggleTaskCompletion: (taskId: string) => void;
  toggleChecklistCompletion: (taskId: string, index: number) => void;
}

const defaultSettings: AppSettings = {
  notionToken: '',
  notionDatabaseId: '',
  durationFormat: '2h 30m',
  clockFormat: '24h',
  theme: 'dark',
  accentColor: 'neon-green',
  weekStart: 'monday',
  telegramBotToken: '',
  telegramChatId: '',
  alertSound: 'default',
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      tasks: [],
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      setTasks: (tasks) => set({ tasks }),
      toggleTaskCompletion: (taskId) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, isCompleted: !task.isCompleted }
              : task
          ),
        })),
      toggleChecklistCompletion: (taskId, index) =>
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === taskId) {
              const newStatus = [...(task.checklistStatus || [])];
              newStatus[index] = !newStatus[index];
              return { ...task, checklistStatus: newStatus };
            }
            return task;
          }),
        })),
    }),
    {
      name: 'timetable-storage',
    }
  )
);
