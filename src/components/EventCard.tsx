import { TaskItem } from "@/types";
import { parseTimeBlock } from "@/lib/timeUtils";
import { CheckCircle2, Circle, FileText, Edit3 } from "lucide-react";
import { useAppStore } from "@/stores/useAppStore";

export default function EventCard({ task, currentTimeMinutes }: { task: TaskItem; currentTimeMinutes: number }) {
  const { toggleTaskCompletion, toggleChecklistCompletion } = useAppStore();
  const timeInfo = parseTimeBlock(task.timeBlock);
  if (!timeInfo) return null;

  // 1 minute = 2px
  const topPosition = timeInfo.startMinutes * 2;
  const height = timeInfo.duration * 2;

  const isActive = currentTimeMinutes >= timeInfo.startMinutes && currentTimeMinutes < timeInfo.startMinutes + timeInfo.duration;
  const timeRemaining = isActive ? (timeInfo.startMinutes + timeInfo.duration) - currentTimeMinutes : 0;

  const checklistTotal = task.checklist.length;
  const checklistCompleted = task.checklistStatus ? task.checklistStatus.filter(Boolean).length : 0;
  const checklistProgress = checklistTotal === 0 ? 0 : Math.round((checklistCompleted / checklistTotal) * 100);

  const baseClasses = "absolute left-16 right-4 rounded-xl border p-3 transition-all duration-300 flex flex-col gap-2 overflow-hidden";
  const stateClasses = task.isCompleted
    ? "bg-surface/50 border-border opacity-70 shadow-sm"
    : isActive
    ? "bg-surface border-accent shadow-[0_0_15px_var(--color-accent)] z-10"
    : "bg-surface border-border hover:border-accent/50 shadow-sm";

  return (
    <div
      className={`${baseClasses} ${stateClasses}`}
      style={{ top: `${topPosition}px`, height: `${height}px` }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-base flex items-center gap-2">
            <button onClick={() => toggleTaskCompletion(task.id)} className="text-accent hover:text-accent-hover transition-colors">
              {task.isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
            </button>
            <span className={task.isCompleted ? "line-through text-muted" : ""}>{task.action}</span>
          </h3>
          <div className="flex items-center gap-3 mt-1.5">
            <p className="text-xs text-muted font-mono">{task.timeBlock}</p>
            {isActive && !task.isCompleted && (
              <span className="text-xs font-mono font-bold text-accent px-1.5 py-0.5 rounded bg-accent/10 animate-pulse">
                {Math.floor(timeRemaining / 60)}h {timeRemaining % 60}m left
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {task.instruction && (
            <button 
              title="Instructions"
              className="flex items-center justify-center w-8 h-8 rounded bg-background border border-border hover:border-accent hover:shadow-[0_0_8px_var(--color-accent)] text-muted hover:text-accent transition-all duration-300"
            >
              <FileText size={16} />
            </button>
          )}
          <button 
            title="Notes"
            className="flex items-center justify-center w-8 h-8 rounded bg-background border border-border hover:border-accent hover:shadow-[0_0_8px_var(--color-accent)] text-muted hover:text-accent transition-all duration-300"
          >
            <Edit3 size={16} />
          </button>
        </div>
      </div>

      {checklistTotal > 0 && (
        <div className="mt-auto">
          <div className="flex justify-between text-xs text-muted mb-1">
            <span>Checklist</span>
            <span className="font-mono">{checklistCompleted}/{checklistTotal} ({checklistProgress}%)</span>
          </div>
          <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
             <div 
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${checklistProgress}%` }}
              />
          </div>
        </div>
      )}
    </div>
  );
}
