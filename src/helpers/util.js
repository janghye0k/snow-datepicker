/**
 * @param {string} title
 * @param {string} [body]
 */
export function error(title, body) {
  const messages = [`[DatePicker] :: ${title}`];
  if (typeof body === 'string') messages.push(body);
  throw new Error(messages.join('\n'));
}

export const getToday = () => {
  const date = new Date();
  return [date.getFullYear(), date.getMonth(), date.getDate()];
};
