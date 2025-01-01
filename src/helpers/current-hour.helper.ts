import { getHours } from "date-fns";

export const getGreetingFlow = (): string => {
  const date: Date = new Date();
  const hour: number = getHours(date);

  if (hour >= 5 && hour < 12) return "morningFlow"; // 5 AM - 11 AM
  if (hour >= 13 && hour < 18) return "afternoonFlow"; // 1 PM - 6 PM
  if (hour >= 19 && hour < 23) return "nightFlow"; // 6 PM -  11 PM
  return "assistantMessageFlow"; // 12 AM - 4 AM
};
