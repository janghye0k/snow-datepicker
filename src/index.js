import checkSchema from './helpers/schema';
import {
  error,
  isDate,
  isNull,
  isObject,
  isString,
  isUndefined,
  on,
} from './helpers/util';
import dayjs from 'dayjs';
import defaultLocale from './locale/en';
import localeInfo from './locale.json';

/**
 * @typedef {object} LocaleFormats
 * @property {string} time
 * @property {string} date
 */

/**
 * Language of the calendar.
 * @typedef {object} Locale
 * @property {string} name
 * @property {string[]} months
 * @property {string[]} monthsShort
 * @property {number} weekStart
 * @property {string[]} weekdays
 * @property {string[]} weekdaysShort
 * @property {string[]} weekdaysMin
 * @property {LocaleFormats} formats
 * @property {string} placeholder
 */

/**
 * @typedef {string | number | Date} DateLike
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
 * @property {boolean} readOnly If false, it will be able to edit dates at input field
 * @property {string} [className] Add custom classes
 * @property {string | Locale} [locale] Language of the calendar.
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

const PREFIX = 'hye0k-datepicker';

class DatePicker {
  static containerId = `${PREFIX}-container`;

  #prevDate = '';

  /**
   * @private
   * @type {Options & { locale: Locale }}
   */
  options = /** @type {any} */ ({});

  /**
   * @type {HTMLInputElement}
   */
  $element = document.createElement('input');

  /**
   * @param {Element | string} element
   * @param {Partial<Options>} [options]
   */
  constructor(element, options = {}) {
    const $target =
      typeof element === 'string' ? document.querySelector(element) : element;
    if (!($target instanceof Element))
      throw error('constructor element shoul be CSS selector or Element');

    // Check options schema & initialize datepicker
    this.#init($target, checkSchema(options));
  }

  /**
   * Initialize datepicker
   * @param {Element} $target
   * @param {Options} options
   */
  async #init($target, options) {
    // Set locale
    const locale = await this.#getLocale(options.locale);
    this.options = { ...options, locale };

    // Convert element
    this.$element = this.#convertToInput(/** @type {HTMLElement} */ ($target));
    this.#bindEvents();

    // Create datepicker container
    this.#createContainer();

    // Create calendar
    this.#createCalendar();
  }

  /**
   * Get datepicker (browser) locale
   * @param {string | Locale} [locale]
   * @returns {Promise<Locale>}
   */
  async #getLocale(locale) {
    if (isObject(locale)) {
      return { ...defaultLocale, ...locale };
    }

    let localeKey = locale || '';
    if (isUndefined(locale)) {
      // Use user PC locale
      localeKey = (
        navigator.languages && navigator.languages.length
          ? navigator.languages[0]
          : navigator.language
      ).toLowerCase();
    }
    const localeList = Object.keys(localeInfo);
    localeKey =
      localeList.find((key) => key === localeKey) ??
      localeList.find((key) => localeKey.includes(key)) ??
      'en';

    return (await import(`./locale/${localeKey}.js`)).default;
  }

  /**
   * Convert element to input
   * @param {HTMLElement} element
   * @returns {HTMLInputElement}
   */
  #convertToInput(element) {
    const { id, className } = element;

    const $el = document.createElement('input');
    $el.type = 'text';
    $el.readOnly = this.options.readOnly;
    Object.entries({ id, className }).forEach(([key, val]) =>
      // @ts-ignore
      val?.length ? ($el[key] = val) : false
    );
    $el.classList.add('hye0k-datepicker');
    $el.classList.add('hye0k-datepicker-input');
    $el.placeholder = this.options.locale.placeholder;
    element.replaceWith($el);

    return $el;
  }

  /**
   * Bind default events
   */
  #bindEvents() {
    /**
     * Convert element value to formatted date
     * @param {any} event
     */
    const convertValue = (event) => {
      const value = event.currentTarget.value;
      const dateLike = isDate(value)
        ? value
        : isDate(this.#prevDate)
          ? this.#prevDate
          : null;
      const convertedValue = isNull(dateLike)
        ? ''
        : dayjs(dateLike).format(this.options.format);
      event.currentTarget.value = convertedValue;
    };

    on(this.$element, 'keypress', (event) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        convertValue(event);
        return false;
      }

      const regex = /[\\/?.,;:|*~`!^\-_+@\\#$%&\\\\=0-9]/g;
      if (!regex.test(event.currentTarget.value + event.key)) {
        event.preventDefault();
        return false;
      }
    });

    on(this.$element, 'blur', convertValue);
  }

  /**
   * Create calendar's container
   */
  #createContainer() {
    if (!isNull(document.getElementById(DatePicker.containerId))) return;
    const $container = document.createElement('div');
    ($container.id = DatePicker.containerId),
      ($container.className = `${PREFIX} ${DatePicker.containerId}`);
    $container.role = 'presentation';
    $container.innerHTML = /*html*/ `
      <div role="presentation" class="${PREFIX}-backdrop"></div>
      <div class="${PREFIX}-popup"></div>
    `;
    document.body.appendChild($container);
  }

  #createCalendar() {}
}

export default DatePicker;
