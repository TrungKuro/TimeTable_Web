import { LocalNotifications } from '@capacitor/local-notifications';
import { TaskItem } from '@/types';
import { parse } from 'date-fns';

export async function requestNotificationPermission() {
  try {
    const permStatus = await LocalNotifications.requestPermissions();
    return permStatus.display === 'granted';
  } catch (error) {
    console.warn("Notifications not supported or permission denied:", error);
    return false;
  }
}

export async function scheduleTaskNotifications(tasks: TaskItem[]) {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) return;

    // Cancel all existing notifications first
    await LocalNotifications.cancel({ notifications: await LocalNotifications.getPending() });

    const notificationsToSchedule = [];
    const now = new Date();

    for (const task of tasks) {
      if (!task.timeBlock) continue;
      
      // timeBlock is like "10:00 - 11:30"
      const [startTimeStr] = task.timeBlock.split('-').map(s => s.trim());
      if (!startTimeStr) continue;

      // Parse start time today
      const startTime = parse(startTimeStr, 'HH:mm', new Date());
      
      // Schedule 5 minutes before
      const notificationTime = new Date(startTime.getTime() - 5 * 60000);

      if (notificationTime > now) {
        notificationsToSchedule.push({
          id: task.orderIndex,
          title: 'Upcoming Task',
          body: `"${task.action}" starts in 5 minutes! (${startTimeStr})`,
          schedule: { at: notificationTime },
          sound: 'default',
        });
      }
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({
        notifications: notificationsToSchedule
      });
      console.log(`Scheduled ${notificationsToSchedule.length} notifications.`);
    }
  } catch (error) {
    console.error("Error scheduling notifications:", error);
  }
}
