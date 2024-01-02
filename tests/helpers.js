import DatePicker from '../src/index.js';

/**
 * @param {Element} element
 * @param {import('../src/index').Options} [options]
 */
export function create(element, options) {
  const datepicker = new DatePicker(element, options);
  return datepicker;
}
