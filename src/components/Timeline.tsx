import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/stores/useAppStore";
import EventCard from "./EventCard";

export default function Timeline() {
  const { tasks } = useAppStore();
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeMinutes(now.getHours() * 60 + now.getMinutes());
    };
    
    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to current time on mount
  useEffect(() => {
    if (timelineRef.current && currentTimeMinutes > 0) {
      const targetY = (currentTimeMinutes * 2) - window.innerHeight / 2;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: "smooth"
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate hours array (0 to 24)
  const hours = Array.from({ length: 25 }).map((_, i) => i);

  return (
    <div className="relative w-full" style={{ height: `${24 * 60 * 2}px` }} ref={timelineRef}>
      {/* Background Grid */}
      {hours.map(hour => (
        <div 
          key={hour}
          className="absolute w-full border-t border-border flex items-start"
          style={{ top: `${hour * 60 * 2}px` }}
        >
          <span className="text-xs font-mono text-muted w-14 text-right pr-2 -mt-2">
            {hour.toString().padStart(2, '0')}:00
          </span>
        </div>
      ))}

      {/* Current Time Indicator (CTI) */}
      <div 
        className="absolute left-14 right-0 flex items-center z-20 pointer-events-none"
        style={{ top: `${currentTimeMinutes * 2}px` }}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-accent -ml-[5px] shadow-[0_0_10px_var(--color-accent)] animate-pulse"></div>
        <div className="h-[2px] w-full bg-accent shadow-[0_0_10px_var(--color-accent)] opacity-80"></div>
      </div>

      {/* Event Cards */}
      {tasks.map(task => (
        <EventCard key={task.id} task={task} currentTimeMinutes={currentTimeMinutes} />
      ))}
    </div>
  );
}
