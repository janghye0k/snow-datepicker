import { isDate } from 'doumi';

/**
 * @param {string} title
 * @param {string} [body]
 */
export function error(title, body) {
  const messages = [`[DatePicker] :: ${title}`];
  if (typeof body === 'string') messages.push(body);
  throw new Error(messages.join('\n'));
}

/**
 *
 * @param {*} date
 * @returns {[number, number, number]}
 */
export const parseDate = (date = new Date()) => {
  if (!isDate(date)) return [-1, -1, -1];
  return [date.getFullYear(), date.getMonth(), date.getDate()];
};
