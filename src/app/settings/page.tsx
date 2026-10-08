"use client";

import { useState } from "react";
import { useAppStore } from "@/stores/useAppStore";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof typeof settings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 rounded-md hover:bg-surface transition-colors">
            <ArrowLeft size={20} className="text-muted hover:text-accent" />
          </Link>
          <h1 className="text-xl font-bold font-sans">Settings</h1>
        </div>
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-md font-semibold hover:opacity-90 transition-opacity"
        >
          <Save size={18} />
          {saved ? "Saved!" : "Save"}
        </button>
      </header>

      <div className="flex-1 w-full max-w-2xl mx-auto p-4 space-y-8 pb-32">
        {/* Notion Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-2">Notion Integration</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-muted">Notion Token</label>
              <input 
                type="password"
                value={localSettings.notionToken}
                onChange={e => handleChange("notionToken", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                placeholder="secret_..."
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-muted">Database ID</label>
              <input 
                type="text"
                value={localSettings.notionDatabaseId}
                onChange={e => handleChange("notionDatabaseId", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                placeholder="abc123def456..."
              />
            </div>
          </div>
        </section>

        {/* UI Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-2">Appearance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-muted">Theme</label>
              <select 
                value={localSettings.theme}
                onChange={e => handleChange("theme", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-accent appearance-none"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-muted">Accent Color</label>
              <select 
                value={localSettings.accentColor}
                onChange={e => handleChange("accentColor", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-accent appearance-none"
              >
                <option value="neon-green">Neon Green</option>
                <option value="electric-blue">Electric Blue</option>
                <option value="sunset-orange">Sunset Orange</option>
                <option value="cyberpunk-purple">Cyberpunk Purple</option>
              </select>
            </div>
          </div>
        </section>

        {/* Telegram Settings */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-accent border-b border-border pb-2">Telegram Reports</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-muted">Bot Token</label>
              <input 
                type="password"
                value={localSettings.telegramBotToken}
                onChange={e => handleChange("telegramBotToken", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm text-muted">Chat ID</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={localSettings.telegramChatId}
                  onChange={e => handleChange("telegramChatId", e.target.value)}
                  className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-foreground focus:outline-none focus:border-accent"
                  placeholder="-1001234567890"
                />
                <button 
                  onClick={async () => {
                    if (!localSettings.telegramBotToken) {
                      alert("Please enter your Bot Token first.");
                      return;
                    }
                    try {
                      const res = await fetch(`https://api.telegram.org/bot${localSettings.telegramBotToken}/getUpdates`);
                      const data = await res.json();
                      if (data.ok && data.result.length > 0) {
                        // Get chat ID from the most recent message
                        const lastMessage = data.result.filter((r: any) => r.message).pop();
                        if (lastMessage) {
                          handleChange("telegramChatId", lastMessage.message.chat.id.toString());
                          alert(`Chat ID auto-filled: ${lastMessage.message.chat.id}`);
                        } else {
                          alert("Could not find a recent message. Please send 'hello' to your bot and try again.");
                        }
                      } else {
                        alert("No messages found. Please send a message like 'hello' to your bot and click this button again.");
                      }
                    } catch (e) {
                      alert("Failed to fetch updates. Check your Bot Token.");
                    }
                  }}
                  className="px-3 py-2 bg-surface border border-border rounded-md hover:border-accent hover:text-accent transition-colors text-sm font-semibold"
                  title="Auto-detect from recent messages"
                >
                  Get ID
                </button>
              </div>
            </div>
            <button 
              onClick={async () => {
                const { sendTelegramReport } = await import('@/utils/telegramReport');
                // Save settings first before testing so the utility picks up latest store values if we just updated them.
                // But since user might not have clicked save, let's use the local state? 
                // Better: just call save first.
                updateSettings(localSettings);
                const success = await sendTelegramReport();
                if (success) alert('Telegram report sent successfully!');
                else alert('Failed to send Telegram report. Check console and API token.');
              }}
              className="w-full md:w-auto mt-2 px-4 py-2 bg-accent text-background rounded-md hover:opacity-90 transition-opacity text-sm font-bold flex items-center justify-center"
            >
              Test Send Report
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
