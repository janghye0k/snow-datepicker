import {
  assign,
  forEach,
  isDate,
  isObject,
  isPlainObject,
  isString,
  isUndefined,
  reduce,
} from 'doumi';
import type { InternalOptions, Options, Unit } from '@t/options';
import { error } from '@/helpers/util';
import { UNIT_ORDER, UNIT_LIST, MIN_DATE, MAX_DATE } from '@/helpers/consts';

export function isUnit(unit: any) {
  return isString(unit) && UNIT_LIST.includes(unit);
}

export function checkUnit(unit: Unit, minUnit?: Unit) {
  if (!minUnit) return true;
  return (
    UNIT_ORDER[unit as keyof typeof UNIT_ORDER] >=
    UNIT_ORDER[minUnit as keyof typeof UNIT_ORDER]
  );
}

const DEFUALT_OPTIONS: Options = {
  dateFormat: 'YYYY-MM-DD',
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
  readOnly: false,
  animation: true,
  titleFormat: {},
};

const DEFAULT_TITLE_FORMAT = {
  days: 'MMMM, <i>YYYY</i>',
  months: 'YYYY',
  years: 'YYYY1 - YYYY2',
};

function inValid(key: string, message: string) {
  error(`Invalid options`, `options.${key} should be ${message}`);
}

type ValidationMap = Record<string, (...args: any[]) => any>;

const VALIDATION_MAP: ValidationMap = assign(
  {},
  reduce(
    DEFUALT_OPTIONS,
    (obj, value, key) => {
      const type = typeof value;
      obj[key] = (val: any) => {
        if (typeof val === type) return;
        inValid(key, type);
      };
      return obj;
    },
    {} as ValidationMap
  ),
  ['minDate', 'maxDate', 'selectedDate'].reduce((obj, item) => {
    obj[item] = (val: any) => {
      if (isUndefined(val) || isDate(val)) return;
      inValid(item, 'Date');
    };
    return obj;
  }, {} as ValidationMap),
  {
    className: (val: any) => {
      if (isUndefined(val) || isString(val)) return;
      inValid('className', 'string');
    },
    titleFormat: (val: any) => {
      if (isUndefined(val)) return;
      if (!isObject(val))
        return inValid(
          'titleFormat',
          '{ days?: string; months?: string; years?: string }'
        );
      forEach(DEFAULT_TITLE_FORMAT, (_, key) => {
        const matcher = ['string', 'undefined'];
        if (matcher.includes(typeof val[key])) return;
        inValid(`titleFormat.${key}`, matcher.join(' | '));
      });
    },
  }
);

export default function checkSchema(options: Options): InternalOptions {
  const opt = assign({}, DEFUALT_OPTIONS, options) as any;
  if (!checkUnit(opt.unit, opt.minUnit)) opt.unit = opt.minUnit;
  if (opt.titleFormat === undefined) opt.titleFormat = {};
  if (isPlainObject(opt.titleFormat)) {
    forEach(DEFAULT_TITLE_FORMAT, (value, key) => {
      const titleFormat = opt.titleFormat as Record<string, string>;
      if (!isString(titleFormat[key])) titleFormat[key] = value;
    });
  }

  // Validate
  forEach(opt, (value, key) => {
    const validator = VALIDATION_MAP[key];
    if (!validator) return;
    validator(value);
  });

  const { minDate, maxDate } = opt;
  const min = !minDate
    ? new Date(MIN_DATE)
    : new Date(Math.max(Number(MIN_DATE), Number(new Date(minDate))));
  const max = !maxDate
    ? new Date(MAX_DATE)
    : new Date(Math.min(Number(new Date(maxDate)), Number(maxDate)));
  min.setHours(0), min.setMinutes(0), min.setSeconds(1);
  max.setHours(23), max.setMinutes(59), max.setSeconds(59);

  opt.minDate = min;
  opt.maxDate = max;

  return opt;
}
