export const FORMAT_REGEXP =
  /\[([^\]]+)]|YY[1|2]|YYYY[1|2]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
export const DATEFORMAT_REGEXP = /Y{2,4}|M{1,4}|D{1,2}/g;
export const DEFAULT_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
export const INVALID_DATE = 'Invalid Date';

export const VIEW_ORDER: Record<string, number> = {
  days: 1,
  months: 2,
  years: 3,
};
export const VIEW_LIST = ['days', 'months', 'years'];

export const MIN_DATE = new Date(100, 0, 1, 0, 1, 0);
export const MAX_DATE = new Date(9999, 11, 31, 23, 59, 59);

export const PREFIX = 'datepicker';
export const CONTAINER_ID = `${PREFIX}-container`;
