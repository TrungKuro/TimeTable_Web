import { TaskItem } from "@/types";

export const mockTasks: TaskItem[] = [
  {
    id: "t1",
    orderIndex: 1,
    timeBlock: "06:00 - 07:30",
    action: "Morning Workout",
    checklist: ["Warmup (10m)", "Cardio (30m)", "Weightlifting (40m)", "Stretch (10m)"],
    benefit: "Physical health and energy for the day.",
  },
  {
    id: "t2",
    orderIndex: 2,
    timeBlock: "08:00 - 09:00",
    action: "Breakfast & Read",
    checklist: ["Prepare healthy meal", "Read 10 pages of a book"],
    isCompleted: false,
  },
  {
    id: "t3",
    orderIndex: 3,
    timeBlock: "09:30 - 12:00",
    action: "Deep Work Session 1",
    checklist: ["Review emails", "Code feature X", "Code review"],
    instruction: "Focus on the hardest task first. Use Pomodoro 50/10.",
  },
  {
    id: "t4",
    orderIndex: 4,
    timeBlock: "13:30 - 15:00",
    action: "Meetings & Sync",
    checklist: ["Daily Standup", "1-on-1 with manager"],
  },
  {
    id: "t5",
    orderIndex: 5,
    timeBlock: "16:00 - 18:30",
    action: "Deep Work Session 2",
    checklist: ["Refactor component Y", "Write tests"],
  }
];
