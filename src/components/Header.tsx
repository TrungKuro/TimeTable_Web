import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useAppStore } from "@/stores/useAppStore";
import { Settings, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { tasks, setTasks, settings } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = async () => {
    if (!settings.notionToken || !settings.notionDatabaseId) {
      alert("Please configure Notion Token and Database ID in Settings first.");
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetch("/api/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notionToken: settings.notionToken,
          databaseId: settings.notionDatabaseId
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to sync");
      }

      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        // Schedule capacitor notifications
        try {
          const { scheduleTaskNotifications } = await import('@/utils/notifications');
          await scheduleTaskNotifications(data.tasks);
        } catch (e) {
          console.warn("Could not schedule notifications:", e);
        }
      }
    } catch (error: any) {
      console.error(error);
      alert(`Sync failed: ${error.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
        <div className="flex justify-between items-center w-full md:w-auto">
          <div>
            <h1 className="text-lg md:text-xl font-bold font-sans text-accent">
              {format(currentTime, "EEEE, MMM d, yyyy")}
            </h1>
            <p className="text-xs md:text-sm text-muted hidden md:block">
              Week {format(currentTime, "I")} • {Intl.DateTimeFormat().resolvedOptions().timeZone}
            </p>
          </div>
          <div className="flex items-center gap-3 md:hidden">
            <div className="text-xl font-mono font-bold">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleSync} 
                disabled={isSyncing}
                className={`p-1.5 rounded-md border border-transparent hover:border-border hover:bg-surface transition-colors ${isSyncing ? "opacity-50" : ""}`}
              >
                <RefreshCw size={20} className={`text-muted hover:text-accent transition-colors ${isSyncing ? "animate-spin text-accent" : ""}`} />
              </button>
              <Link href="/settings" className="p-1.5 rounded-md border border-transparent hover:border-border hover:bg-surface transition-colors">
                <Settings size={20} className="text-muted hover:text-accent transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto mt-2 md:mt-0">
          <div className="hidden md:flex items-center gap-4">
            <div className="text-2xl font-mono font-bold">
              {format(currentTime, "HH:mm:ss")}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={handleSync} 
                disabled={isSyncing}
                className={`p-1.5 rounded-md border border-transparent hover:border-border hover:bg-surface transition-colors ${isSyncing ? "opacity-50" : ""}`}
              >
                <RefreshCw size={20} className={`text-muted hover:text-accent transition-colors ${isSyncing ? "animate-spin text-accent" : ""}`} />
              </button>
              <Link href="/settings" className="p-1.5 rounded-md border border-transparent hover:border-border hover:bg-surface transition-colors">
                <Settings size={20} className="text-muted hover:text-accent transition-colors" />
              </Link>
            </div>
          </div>
          <div className="text-xs md:text-sm text-muted flex flex-1 md:flex-none items-center gap-3 md:gap-2 justify-between md:justify-end md:mt-1">
            <span className="whitespace-nowrap">
              {completedTasks}/{totalTasks} <span className="hidden sm:inline">({progressPercent}%)</span>
            </span>
            <div className="w-full md:w-24 h-1.5 md:h-2 bg-background rounded-full overflow-hidden border border-border flex-1 md:flex-none">
              <div 
                className="h-full bg-accent transition-all duration-500 shadow-[0_0_8px_var(--color-accent)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
