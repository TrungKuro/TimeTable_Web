"use client";

import { useEffect } from "react";
import Header from "@/components/Header";
import Timeline from "@/components/Timeline";
import { useAppStore } from "@/stores/useAppStore";
import { mockTasks } from "@/lib/mockData";

export default function Home() {
  const { tasks, setTasks } = useAppStore();

  // Load mock data on first load if no tasks exist
  useEffect(() => {
    if (tasks.length === 0) {
      setTasks(mockTasks);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background">
      <Header />
      <div className="flex-1 w-full max-w-3xl mx-auto overflow-hidden pb-32 pt-4 relative">
        <Timeline />
      </div>
    </main>
  );
}
