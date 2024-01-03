import checkSchema from './helpers/schema';
import {
  error,
  isDate,
  isNull,
  isObject,
  isUndefined,
  on,
} from './helpers/util';
import defaultLocale from './locale/en';
import localeInfo from './locale.json';
import ChevronLeft from './icons/chevron-left';
import ChevronRight from './icons/chevron-right';
import LocaleConverter from './helpers/locale-converter';

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
 * @property {string} days
 * @property {string} months
 * @property {string} years
 */

/**
 * @typedef {object} InternalOptions
 * @property {string} format Get the formatted date according to the string of tokens passed in.
 * @property {boolean} setSelected If true, then clicking on the active cell will remove the selection from it
 * @property {boolean} shortcuts Enables keyboard navigation.
 * @property {string} position Position of the calendar relative to the text field.
 * @property {string} unit The initial unit of the calendar. (e.g. days | months | years)
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

/**
 * @typedef {Partial<Omit<InternalOptions, 'titleFormat'>> & { titleFormat: Partial<TitleFormat> }} Options
 */

const PREFIX = 'hye0k-datepicker';

class DatePicker {
  static containerId = `${PREFIX}-container`;

  #prevDate = '';

  /**
   * @private
   * @type {HTMLElement}
   */
  $hide = document.createElement('body');

  /**
   * @private
   * @type {InternalOptions}
   */
  options;

  /**
   * @type {HTMLInputElement}
   */
  $input = document.createElement('input');

  /**
   * @type {HTMLDivElement}
   */
  $calendar;

  converter = new LocaleConverter(defaultLocale);

  /**
   * @type {'days' | 'months' | 'years'}
   */
  currentUnit = 'days';

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
    this.options = checkSchema(options);
    this.setCurrentUnit(this.options.unit);

    // Convert element
    this.$input = this.#convertToInput(/** @type {HTMLElement} */ ($target));
    this.#bindInputEvents();

    // Create datepicker container
    this.#createContainer();

    // Create calendar
    this.$calendar = this.#createCalendar();
    this.refresh();

    // Set locale
    this.#setLocale(this.options.locale);
  }

  /**
   * Get datepicker (browser) locale
   * @param {string | Locale} [locale]
   */
  async #setLocale(locale) {
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

    const { default: localeData } = await import(`./locale/${localeKey}.js`);
    this.converter = new LocaleConverter(localeData, this.options.format);

    this.refresh();
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
    $el.classList.add(PREFIX), $el.classList.add(`${PREFIX}-input`);

    $el.placeholder = this.converter.locale.placeholder;
    $el.value = this.formatValue(this.options.selectedDate);
    element.replaceWith($el);

    return $el;
  }

  /**
   * Bind default events
   */
  #bindInputEvents() {
    on(this.$input, 'keypress', (event) => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault();
        event.currentTarget.value = this.formatValue(event.currentTarget.value);
        return false;
      }

      const regex = /[\\/?.,;:|*~`!^\-_+@\\#$%&\\\\=0-9]/g;
      if (!regex.test(event.currentTarget.value + event.key)) {
        event.preventDefault();
        return false;
      }
    });

    on(
      this.$input,
      'blur',
      (event) =>
        (event.currentTarget.value = this.formatValue(
          event.currentTarget.value
        ))
    );
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
    `;
    document.body.appendChild($container);
  }

  /**
   * Create calendar element
   * @returns {HTMLDivElement}
   */
  #createCalendar() {
    const { className } = this.options;

    const $calendar = document.createElement('div');
    $calendar.classList.add(PREFIX);
    $calendar.classList.add(`${PREFIX}-calendar`);
    if (className) $calendar.classList.add(className);

    const calendarText = /*html*/ `
      <div class="${PREFIX}-header">
        <div class="${PREFIX}-nav">
          <button class="${PREFIX}-nav-btn" data-action="prev">${ChevronLeft}</button>
          <span class="${PREFIX}-nav-title"></span>
          <button class="${PREFIX}-nav-btn" data-action="next">${ChevronRight}</button>
        </div>
      </div>
      <div class="${PREFIX}-body">
        <div class="${PREFIX}-days">
          <div class="${PREFIX}-weekdays"></div>
          <div class="${PREFIX}-days-content"></div>
        </div>
        <div class="${PREFIX}-months"></div>
        <div class="${PREFIX}-years"></div>
      </div>`;
    const parser = new DOMParser();
    $calendar.replaceChildren(
      ...parser.parseFromString(calendarText, 'text/html').body.children
    );

    // Set current unit
    $calendar
      .querySelector(`.${PREFIX}-${this.currentUnit}`)
      ?.classList.add('show');

    // Bind move event
    $calendar.querySelectorAll(`.${PREFIX}-nav-btn`).forEach(($el, index) =>
      on(/** @type {HTMLElement} */ ($el), 'click', (event) => {
        const { action } = event.currentTarget.dataset;
        const isPrev = isUndefined(action) ? !index : action === 'prev';
        isPrev ? this.prev() : this.next();
      })
    );

    return $calendar;
  }

  #renderLocaleItems() {
    const {
      locale: { weekdaysMin, weekStart = 0, monthsShort, placeholder },
      weekIndexes,
    } = this.converter;

    // Update placeholder text
    this.$input.placeholder = placeholder;

    // Render weekdays
    const $weekdays = this.$calendar.querySelector(`.${PREFIX}-weekdays`);
    if (!$weekdays) return;

    $weekdays.innerHTML = weekIndexes
      .map((index) => {
        const dayindex = (index + weekStart) % 7;
        return `<span class="${PREFIX}-weekday" data-dayindex="${dayindex}">${weekdaysMin[index]}</span>`;
      })
      .join('');

    // Render months
    const $months = this.$calendar.querySelector(`.${PREFIX}-months`);
    if (!$months) return;

    $months.innerHTML = monthsShort
      .map(
        (month, index) =>
          `<span class="${PREFIX}-pickable-item" data-month="${index}">${month}</span>`
      )
      .join('');
  }

  /**
   * Rendering days & show days view
   * @param {number} year
   * @param {number} month
   */
  #renderDays(year, month) {
    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const firstDateDay = firstDate.getDay();
    const lastDateDay = lastDate.getDay();

    const { weekStart = 0 } = this.converter.locale;
    const preDays =
      (firstDateDay + 7 - weekStart) % 7 || (lastDate.getDate() === 28 ? 7 : 0);
    const postDays = (lastDateDay + 7 - weekStart) % 7;

    /** @type {{d: number; m: number}[]} */
    const days = [];
    const displayPrevStart = new Date(year, month, 0).getDate() - preDays + 1;

    /**
     * @param {number} length
     * @param {number} m
     * @param {number} [adder]
     */
    const pushData = (length, m, adder = 1) =>
      Array.from({ length }, (_, i) => days.push({ d: adder + i, m }));
    pushData(preDays, (month - 1 + 12) % 12, displayPrevStart);
    pushData(lastDate.getDate(), month), pushData(postDays, (month + 1) % 12);

    const $target = this.$calendar.querySelector(`.${PREFIX}-days-content`);
    if (!$target) return;
    $target.innerHTML = days
      .map(
        ({ d, m }) =>
          `<span class="${PREFIX}-pickable-item ${
            m === month ? '' : 'other'
          }" data-month="${m}" data-day="${d}">${d}</span>`
      )
      .join('');
  }

  refresh() {
    // Update weekdays text
    this.#renderLocaleItems();
    this.#renderDays(2024, 0);
  }

  /**
   * Set current unit of calendar
   * @param {string} unit
   */
  setCurrentUnit(unit) {
    const unitList = ['days', 'months', 'years'];
    this.currentUnit = unitList.includes(unit)
      ? /** @type {'days' | 'months' | 'years'} */ (unit)
      : 'days';

    if (!this.$calendar) return;
    const $items = this.$calendar.querySelectorAll(`.${PREFIX}-body > *`);
    const $target = this.$calendar.querySelector(
      `.${PREFIX}-${this.currentUnit}`
    );

    $items.forEach(($el) => $el.classList.remove('show'));
    if ($target) $target.classList.add('show');
  }

  /**
   * Move to next month/years/decade
   */
  next() {}

  /**
   * Move to previous month/years/decade
   */
  prev() {}

  /**
   * Hide calendar
   */
  hide() {
    this.$hide.replaceChildren(this.$calendar);
  }

  /**
   * Show calendar
   */
  show() {
    const $conatiner = document.getElementById(DatePicker.containerId);
    if ($conatiner) $conatiner.appendChild(this.$calendar);
  }

  /**
   * Convert value to datepicker locale
   * @param {any} value
   * @returns {string}
   */
  formatValue(value) {
    return this.converter.date(value);
  }
}

export default DatePicker;
