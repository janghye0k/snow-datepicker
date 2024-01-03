import { isDate, error, isUndefined, isString, isObject } from './util';

/**
 * @typedef {import('../index').Options} Options
 */

/**
 * @type {Options['titleFormat']}
 */
const DEFAULT_TITLE_FORMAT = {
  days: 'MMM, <i>yyyy</i>',
  months: 'yyyy',
  years: 'yyyy1 - yyyy2',
};

/**
 * @type {Options}
 */
const DEFUALT_OPTIONS = {
  format: 'YYYY-MM-DD',
  setSelected: true,
  shortcuts: true,
  position: 'bottom left',
  view: 'days',
  showOtherMonths: true,
  selectOtherMonths: true,
  moveOtherMonths: true,
  navigationLoop: true,
  autoClose: true,
  readOnly: true,
  titleFormat: {},
};

/**
 * @callback OptionValidator
 * @param {unknown} val
 * @returns {boolean}
 */

/**
 * @typedef {Record<string, { validator: OptionValidator; type: string | string[] }>} ValidateMap
 */

/**
 * @type {ValidateMap}
 */
const VALIDATE_MAP = {
  ...Object.entries(DEFUALT_OPTIONS).reduce((obj, [key, value]) => {
    const type = typeof value;
    obj[key] = { validator: (val) => typeof val === type, type };
    return obj;
  }, /** @type {ValidateMap} */ ({})),
  ...['minDate', 'maxDate', 'selectedDate'].reduce((obj, item) => {
    obj[item] = {
      validator: (val) => isUndefined(val) || isDate(val),
      type: ['string', 'number', 'Date', 'Dayjs'],
    };
    return obj;
  }, /** @type {ValidateMap} */ ({})),
  className: {
    validator: (val) => isUndefined(val) || isString(val),
    type: 'string',
  },
  titleFormat: {
    validator: /** @param {any} val */ (val) => {
      if (isUndefined(val)) return true;
      if (!isObject(val)) return false;
      return Object.keys(DEFAULT_TITLE_FORMAT).every((key) =>
        ['string', 'undefined'].includes(typeof val[key])
      );
    },
    type: 'TitleFormat { days?: string; months?: string; years?: string }',
  },
};

/**
 * @param {Partial<Options>} options
 * @returns {Options}
 */
export default function checkSchema(options) {
  const opt = { ...DEFUALT_OPTIONS, ...options };

  // Validate
  Object.entries(opt).forEach(([key, value]) => {
    const { validator, type } = VALIDATE_MAP[key];
    if (!validator) return;
    const errorMessage = isString(type) ? type : type.join(' or ');
    if (!validator(value))
      error(`Invalid options`, `options.${key} should be ${errorMessage}`);
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
