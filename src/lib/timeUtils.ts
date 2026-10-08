import { parse, differenceInMinutes } from "date-fns";

// Parse timeBlock like "05:00 - 07:30"
export function parseTimeBlock(timeBlock: string) {
  const [startStr, endStr] = timeBlock.split("-").map(s => s.trim());
  if (!startStr || !endStr) return null;

  const startTime = parse(startStr, "HH:mm", new Date());
  const endTime = parse(endStr, "HH:mm", new Date());

  // Calculate start minutes from 00:00
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  // Calculate duration
  let duration = differenceInMinutes(endTime, startTime);
  if (duration < 0) {
    // Handles case where it spans past midnight, e.g., 23:00 - 01:00
    duration += 24 * 60;
  }

  return { startMinutes, duration };
}
