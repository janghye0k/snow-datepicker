import { error } from '@/helpers/util';
import {
  isDateLike,
  isUndefined,
  isString,
  isObject,
  reduce,
  forEach,
} from 'doumi';
import { InternalOptions, Options } from '@/index';

/**
 * @typedef {import('../index').Options} Options
 */

/**
 * @type {Record<string, number>}
 */
export const UNIT_ORDER = {
  days: 1,
  months: 2,
  years: 3,
};

const UNIT_LIST = ['days', 'months', 'years'];

const DEFAULT_TITLE_FORMAT = {
  days: 'MMMM, <i>YYYY</i>',
  months: 'YYYY',
  years: 'YYYY1 - YYYY2',
};

/**
 * @type {Options}
 */
const DEFUALT_OPTIONS = {
  format: 'YYYY-MM-DD',
  toggleSelected: true,
  shortcuts: true,
  position: 'bottom-start',
  unit: 'days',
  minUnit: 'days',
  showOtherMonths: true,
  selectOtherMonths: true,
  moveOtherMonths: true,
  navigationLoop: true,
  autoClose: true,
  readOnly: true,
  titleFormat: {},
};

function inValid(key: string, message: string) {
  error(`Invalid options`, `options.${key} should be ${message}`);
}

const VALIDATE_MAP: Record<string, (value: unknown) => any> = {
  ...reduce(
    DEFUALT_OPTIONS,
    (obj, value, key) => {
      const type = typeof value;
      obj[key] = (val: any) => {
        if (typeof val === type) return;
        inValid(key, type);
      };
      return obj;
    },
    {} as any
  ),
  ...['unit', 'minUnit'].reduce((obj, item) => {
    obj[item] = (val: any) => {
      if (isUnit(val)) return;
      inValid(item, UNIT_LIST.join(' | '));
    };
    return obj;
  }, {} as any),
  ...['minDate', 'maxDate', 'selectedDate'].reduce((obj, item) => {
    obj[item] = (val: any) => {
      if (isUndefined(val) || isDateLike(val)) return;
      inValid(item, ['string', 'number', 'Date'].join(' | '));
    };
    return obj;
  }, {} as any),
  className: (val) => {
    if (isUndefined(val) || isString(val)) return;
    inValid('className', 'string');
  },
  titleFormat: (val: any) => {
    if (isUndefined(val)) return;
    if (!isObject(val))
      return inValid(
        'titleFormat',
        '{ dayjs?: string; months?: string; years?: string }'
      );
    forEach(DEFAULT_TITLE_FORMAT, (_, key) => {
      const matcher = ['string', 'undefined'];
      if (matcher.includes(typeof val[key])) return;
      inValid(`titleFormat.${key}`, matcher.join(' | '));
    });
  },
};

export function isUnit(unit: any) {
  return isString(unit) && UNIT_LIST.includes(unit);
}

export function checkUnit(unit: string, minUnit?: string) {
  if (!minUnit) return true;
  return (
    UNIT_ORDER[unit as keyof typeof UNIT_ORDER] >=
    UNIT_ORDER[minUnit as keyof typeof UNIT_ORDER]
  );
}

export default function checkSchema(options: Options): InternalOptions {
  /** @type {any} */
  const opt = { ...DEFUALT_OPTIONS, ...options };
  if (!checkUnit(opt.unit, opt.minUnit)) opt.unit = opt.minUnit;

  // Validate
  forEach(opt, (value, key) => {
    const validator = VALIDATE_MAP[key];
    if (!validator) return;
    validator(value);
  });

  // Set titleFormat
  if (opt.titleFormat === undefined) opt.titleFormat = {};
  forEach(DEFAULT_TITLE_FORMAT, (value, key) => {
    const titleFormat = opt.titleFormat as Record<string, string>;
    const optValue = titleFormat[key];
    if (optValue === undefined) titleFormat[key] = value;
  });

  return opt as InternalOptions;
}
