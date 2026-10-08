export interface TaskItem {
  id: string;
  orderIndex: number;
  timeBlock: string; // HH:mm - HH:mm
  action: string;
  checklist: string[]; // parsed from string with '-'
  benefit?: string;
  instruction?: string;
  isCompleted?: boolean;
  checklistStatus?: boolean[];
}

export interface AppSettings {
  notionToken: string;
  notionDatabaseId: string;
  durationFormat: '2h 30m' | '150\'' | '02:30';
  clockFormat: '12h' | '24h';
  theme: 'dark' | 'light' | 'system';
  accentColor: 'neon-green' | 'electric-blue' | 'sunset-orange' | 'cyberpunk-purple';
  weekStart: 'monday' | 'sunday';
  telegramBotToken: string;
  telegramChatId: string;
  alertSound: string;
}
