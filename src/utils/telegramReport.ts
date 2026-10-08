import { useAppStore } from '@/stores/useAppStore';
import { format } from 'date-fns';

export async function sendTelegramReport() {
  const { settings, tasks } = useAppStore.getState();
  
  if (!settings.telegramBotToken || !settings.telegramChatId) {
    console.warn("Telegram Bot Token or Chat ID is missing. Cannot send report.");
    return false;
  }

  const completedCount = tasks.filter(t => t.isCompleted).length;
  const totalCount = tasks.length;
  const percent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  let reportMessage = `📊 <b>Daily Report: ${format(new Date(), 'dd/MM/yyyy')}</b>\n\n`;
  reportMessage += `📈 <b>Progress:</b> ${completedCount}/${totalCount} (${percent}%)\n\n`;
  reportMessage += `📝 <b>Tasks:</b>\n`;
  
  tasks.forEach(task => {
    const statusIcon = task.isCompleted ? "✅" : "❌";
    reportMessage += `${statusIcon} ${task.timeBlock}: ${task.action}\n`;
  });

  // TODO: Add notes from IndexedDB if implemented

  try {
    const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.telegramChatId,
        text: reportMessage,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error(`Telegram API Error: ${await response.text()}`);
    }

    console.log("Telegram report sent successfully!");
    return true;
  } catch (error) {
    console.error("Failed to send Telegram report:", error);
    return false;
  }
}
