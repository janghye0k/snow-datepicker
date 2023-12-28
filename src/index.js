import { error } from './util';

/**
 * @typedef {object} Options
 * @property {string} test
 */

class DatePicker {
  /**
   * @param {Element | string} element
   * @param {Options} [options]
   */
  constructor(element, options) {
    const $target =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (!($target instanceof Element))
      throw error('constructor element shoul be CSS selector or Element');

    this.checkSchema(options);
  }

  /**
   * @private
   */
  checkSchema(options = {}) {
    console.log(options);
  }
}

export default DatePicker;
