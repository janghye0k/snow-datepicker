import type { Options } from '@t/options';

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

export const PREFIX = 'snow-datepicker';
export const CONTAINER_ID = `${PREFIX}-container`;

export const BUTTON_PRESETS = ['clear', 'today'] as const;

export const DEFUALT_OPTIONS: Options = {
  toggleSelected: true,
  shortcuts: true,
  position: 'bottom-start',
  view: 'days',
  minView: 'days',
  showOtherMonths: true,
  selectOtherMonths: true,
  moveOtherMonths: true,
  navigationLoop: true,
  autoClose: true,
  readOnly: false,
  animation: true,
  inline: false,
  backdrop: false,
  theme: 'light',
  size: 'normal',
  titleFormat: {},
};

export const DEFAULT_TITLE_FORMAT = {
  days: 'MMMM, <i>YYYY</i>',
  months: 'YYYY',
  years: 'YYYY1 - YYYY2',
};

export const OPTION_EVENT_KEYS = [
  'onShow',
  'onHide',
  'onFocus',
  'onBlur',
  'onClickCell',
  'onRenderCell',
  'onBeforeSelect',
  'onSelect',
  'onChangeView',
  'onChangeViewDate',
] as const;
