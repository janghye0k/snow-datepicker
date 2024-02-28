import { isDate, range } from 'doumi';

export function error(title: string, body?: string) {
  const messages = [`[SnowDatePicker]: ${title}`];
  if (typeof body === 'string') messages.push(body);
  throw new Error(messages.join('\n'));
}

export const parseDate = (date: any = new Date()) => {
  if (!isDate(date)) return [-1, -1, -1];
  return [date.getFullYear(), date.getMonth(), date.getDate()];
};

/**
 * Get decade array from date
 */
export const decade = (date: Date) => {
  const currentUnitYear = date.getFullYear();
  const yearPerDecade = Math.floor(currentUnitYear / 10);
  const start = yearPerDecade * 10;
  const end = start + 9;
  return [start, end];
};

export const getCalendarDates = (date: Date, weekStart: number = 0) => {
  const [year, month] = parseDate(date);

  const lastDate = new Date(year, month + 1, 0);
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDayIndex = lastDate.getDay();

  const preDaysCount =
    (firstDayIndex + 7 - weekStart) % 7 || (lastDate.getDate() === 28 ? 7 : 0);
  const postDaysCount = 6 - lastDayIndex;

  const totalDaysCount = preDaysCount + postDaysCount + lastDate.getDate();

  const results = range(-preDaysCount + 1, totalDaysCount).map(
    (dayindex) => new Date(year, month, dayindex, 12)
  );
  return results;
};
