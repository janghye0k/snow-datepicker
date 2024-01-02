import dayjs from 'dayjs';

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
 * @param {any} value
 * @returns {boolean}
 */
export function isDate(value) {
  return !isNaN(/** @type {any} */ (dayjs(value).toDate()));
}

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export const isString = (value) => typeof value === 'string';

/**
 * @param {unknown} value
 * @returns {value is undefined}
 */
export const isUndefined = (value) => value === undefined;

/**
 * @param {unknown} value
 * @returns {value is null}
 */
export const isNull = (value) => value === null;

/**
 * @param {unknown} value
 * @returns {value is number}
 */
export const isNumber = (value) => typeof value === 'number';

/**
 * @param {unknown} value
 * @returns {value is boolean}
 */
export const isBoolean = (value) => typeof value === 'boolean';

/**
 * @param {unknown} value
 * @returns {value is Function}
 */
export const isFunction = (value) => typeof value === 'function';

/**
 * @param {unknown} value
 * @returns {value is Record<string|number|symbol, any>}
 */
export const isObject = (value) => !isNull(value) && typeof value === 'object';
