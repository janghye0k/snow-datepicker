import { error } from './util';
import { isDateLike, isUndefined, isString, isObject } from 'doumi';

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

/**
 * @type {Options['titleFormat']}
 */
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
  setSelected: true,
  shortcuts: true,
  position: 'bottom left',
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

/**
 * @typedef {Record<string, (value: unknown) => any>} ValidateMap
 */

/**
 * @param {string} key
 * @param {string} message
 */
function inValid(key, message) {
  error(`Invalid options`, `options.${key} should be ${message}`);
}

/**
 * @type {ValidateMap}
 */
const VALIDATE_MAP = {
  ...Object.entries(DEFUALT_OPTIONS).reduce((obj, [key, value]) => {
    const type = typeof value;
    obj[key] = (val) => {
      if (typeof val === type) return;
      inValid(key, type);
    };
    return obj;
  }, /** @type {ValidateMap} */ ({})),
  ...['unit', 'minUnit'].reduce((obj, item) => {
    obj[item] = (val) => {
      if (isUnit(val)) return;
      inValid(item, UNIT_LIST.join(' | '));
    };
    return obj;
  }, /** @type {ValidateMap} */ ({})),
  ...['minDate', 'maxDate', 'selectedDate'].reduce((obj, item) => {
    obj[item] = (val) => {
      if (isUndefined(val) || isDateLike(val)) return;
      inValid(item, ['string', 'number', 'Date'].join(' | '));
    };
    return obj;
  }, /** @type {ValidateMap} */ ({})),
  className: (val) => {
    if (isUndefined(val) || isString(val)) return;
    inValid('className', 'string');
  },
  titleFormat: /** @param {any} val */ (val) => {
    if (isUndefined(val)) return;
    if (!isObject(val))
      return inValid(
        'titleFormat',
        '{ dayjs?: string; months?: string; years?: string }'
      );
    Object.keys(DEFAULT_TITLE_FORMAT).forEach((key) => {
      const matcher = ['string', 'undefined'];
      if (matcher.includes(typeof val[key])) return;
      inValid(`titleFormat.${key}`, matcher.join(' | '));
    });
  },
};

/**
 * @param {*} unit
 */
export function isUnit(unit) {
  return isString(unit) && UNIT_LIST.includes(unit);
}

/**
 * @param {string} unit
 * @param {string} [minUnit]
 */
export function checkUnit(unit, minUnit) {
  if (!minUnit) return true;
  return UNIT_ORDER[unit] >= UNIT_ORDER[minUnit];
}

/**
 * @param {Partial<Options>} options
 * @returns {import('../index').InternalOptions}
 */
export default function checkSchema(options) {
  /** @type {any} */
  const opt = { ...DEFUALT_OPTIONS, ...options };
  if (!checkUnit(opt.unit, opt.minUnit)) opt.unit = opt.minUnit;

  // Validate
  Object.entries(opt).forEach(([key, value]) => {
    const validator = VALIDATE_MAP[key];
    if (!validator) return;
    validator(value);
  });

  // Set titleFormat
  if (opt.titleFormat === undefined) opt.titleFormat = {};
  Object.entries(DEFAULT_TITLE_FORMAT).forEach((entry) => {
    const [key, value] = /** @type {[keyof Options['titleFormat'], string]} */ (
      entry
    );
    const optValue = opt.titleFormat[key];
    if (optValue === undefined) opt.titleFormat[key] = value;
  });

  return opt;
}
