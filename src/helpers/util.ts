import { isDate } from 'doumi';

export function error(title: string, body?: string) {
  const messages = [`[DatePicker] :: ${title}`];
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
