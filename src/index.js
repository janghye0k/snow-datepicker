import checkSchema from './schema';
import { error } from './util';
import dayjs from 'dayjs';

/**
 * @typedef {ReturnType<dayjs>} Dayjs
 */

/**
 * Language of the calendar. Available locales are in dayjs/locale.
 *
 * For more information about the localization structure
 * @see https://day.js.org/docs/en/customization/customization
 * @typedef {(typeof dayjs.Ls)[number]} DayjsLocale
 */

/**
 * @typedef {string | number | Date | Dayjs} DateLike
 */

/**
 * @typedef {object} TitleFormat
 * @property {string} [days]
 * @property {string} [months]
 * @property {string} [years]
 */

/**
 * @typedef {object} Options
 * @property {string} format Get the formatted date according to the string of tokens passed in.
 * @property {boolean} setSelected If true, then clicking on the active cell will remove the selection from it
 * @property {boolean} shortcuts Enables keyboard navigation.
 * @property {string} position Position of the calendar relative to the text field.
 * @property {string} view The initial view of the calendar. (e.g. days | months | years)
 * @property {boolean} showOtherMonths If true, dates from other months will be displayed in days view.
 * @property {boolean} selectOtherMonths If true, it will be possible to select dates from other months.
 * @property {boolean} moveOtherMonths If true , then selecting dates from another month will be causing transition to this month.
 * @property {boolean} navigationLoop Whether to enable navigation when the maximum/minimum date is exceeded
 * @property {boolean} autoClose If true, the calendar will be hidden after selecting the date
 * @property {TitleFormat} titleFormat
 * @property {string | string[]} [buttons]
 * @property {string} [className] Add custom classes
 * @property {string | DayjsLocale} [locale] Language of the calendar.
 * @property {DateLike} [minDate] The minimum date of calendar
 * @property {DateLike} [maxDate] The maximum date of calendar
 * @property {DateLike} [selectedDate]
 * @property {Event} [onSelect]
 * @property {Event} [onChangeView]
 * @property {Event} [onShow]
 * @property {Event} [onHide]
 * @property {Event} [onFocus]
 * @property {Event} [onBlur]
 */

class DatePicker {
  /**
   * @private
   * @type {Options}
   */
  options;

  /**
   * @param {Element | string} element
   * @param {Partial<Options>} [options]
   */
  constructor(element, options = {}) {
    const $target =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (!($target instanceof Element))
      throw error('constructor element shoul be CSS selector or Element');

    this.options = checkSchema(options);

    this.#createDatePicker();
  }

  /**
   * Set calendar's locale
   * @param {string | DayjsLocale} locale
   */
  locale(locale) {}

  #createDatePicker() {}
}

export default DatePicker;
