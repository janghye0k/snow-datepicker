import checkSchema, { checkUnit, isUnit } from './helpers/schema';
import { error, getToday } from './helpers/util';
import { isDateLike, isNull, isUndefined, isObject, on } from 'doumi';
import defaultLocale from './locale/en';
import localeInfo from './locale.json';
import ChevronLeft from './icons/chevron-left';
import ChevronRight from './icons/chevron-right';
import LocaleConverter from './helpers/locale-converter';
import { effect, observable } from '@janghye0k/observable';

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
 * @template {keyof HTMLElementEventMap} K
 * @template {Element} [T = HTMLElement]
 * @typedef {import('doumi').Evt<K, T>} Evt
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
 * @property {string} position Position of the calendar relative to the input field.
 * @property {string} unit The initial unit of the calendar. (e.g. days | months | years)
 * @property {string} minUnit The minimum unit of the calendar. The values are same as unit
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
  #datepicker;

  #input = document.createElement('input');

  #converter = new LocaleConverter(defaultLocale);

  #state = {
    unit: observable({ currentUnit: 'days', unitDate: new Date() }),
    date: /** @type {import('@janghye0k/observable').Observable<null | Date>} */ (
      observable(null)
    ),
  };

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
   * ID of datepicker elements container
   */
  static containerId = `${PREFIX}-container`;

  /**
   * Element on which datepicker was initialized.
   */
  get $input() {
    return this.#input;
  }

  /**
   * Datepicker element
   * @returns {HTMLDivElement}
   */
  get $datepicker() {
    return this.#datepicker;
  }

  /**
   * LocaleConverter instance for convert date to datepicker's locale format
   */
  get converter() {
    return this.#converter;
  }

  /**
   * Current unit of calendar
   */
  get currentUnit() {
    return /** @type {'days' | 'months' | 'years'} */ (
      this.#state.unit().currentUnit
    );
  }

  /**
   * Current unit date
   */
  get unitDate() {
    return new Date(this.#state.unit().unitDate);
  }

  /**
   * Selected date
   */
  get selectedDate() {
    const selectedDate = this.#state.date();
    return isNull(selectedDate) ? null : new Date(selectedDate);
  }

  /**
   * Datepicker calendar is visible
   */
  get visible() {
    return !this.$hide.contains(this.$datepicker);
  }

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

    // Convert element
    this.#input = this.#convertToInput(/** @type {HTMLElement} */ ($target));

    // Create datepicker container
    this.#createContainer();

    // Create calendar
    this.#datepicker = this.#createDatepicker();

    // Set locale
    this.#setLocale(this.options.locale);

    // Subscribe listener
    effect(
      () => this.#render(),
      [this.#state.unit],
      (state) => {
        return `${state.currentUnit}__${Number(state.unitDate)}`;
      }
    );
    effect(
      (state) => {
        this.$input.value = isDateLike(this.converter.date(state))
          ? this.converter.date(state)
          : '';
      },
      [this.#state.date],
      (s) => Number(s)
    );

    // Set data
    this.#state.unit({
      currentUnit: this.options.unit,
      unitDate: new Date(this.options.selectedDate ?? Date.now()),
    });
    this.setSelectedDate(this.options.selectedDate);

    // Render
    this.refresh();
  }

  /**
   * Get datepicker (browser) locale
   * @param {string | Locale} [locale]
   */
  async #setLocale(locale) {
    if (isObject(locale)) {
      this.#converter = new LocaleConverter(
        { ...defaultLocale, ...locale },
        this.options.format
      );
      return;
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
    this.#converter = new LocaleConverter(localeData, this.options.format);
    this.refresh();
  }

  /**
   * Convert element to input
   * @param {HTMLElement} element
   * @returns {HTMLInputElement}
   */
  #convertToInput(element) {
    const { id, className } = element;

    const $input = document.createElement('input');
    $input.type = 'text';
    $input.readOnly = this.options.readOnly;
    Object.entries({ id, className }).forEach(([key, val]) =>
      // @ts-ignore
      val?.length ? ($input[key] = val) : false
    );
    $input.classList.add(PREFIX), $input.classList.add(`${PREFIX}-input`);

    $input.placeholder = this.converter.locale.placeholder;
    element.replaceWith($input);

    on($input, 'keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        const selectedDate = this.selectedDate;
        event.currentTarget.value = isNull(selectedDate)
          ? ''
          : this.converter.date(this.selectedDate);
        return false;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.converter.isValid(event.currentTarget.value)) {
          this.setSelectedDate(new Date(event.currentTarget.value));
        } else {
          const selectedDate = this.selectedDate;
          event.currentTarget.value = isNull(selectedDate)
            ? ''
            : this.converter.date(this.selectedDate);
        }
        return false;
      }
    });

    on($input, 'blur', (event) => {
      if (this.options.readOnly) return;
      if (!this.converter.isValid(event.currentTarget.value)) {
        const selectedDate = this.selectedDate;
        event.currentTarget.value = isNull(selectedDate)
          ? ''
          : this.converter.date(this.selectedDate);
        return;
      }
      this.setSelectedDate(new Date(event.currentTarget.value));
    });

    return $input;
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
   * Create datepicker element
   * @returns {HTMLDivElement}
   */
  #createDatepicker() {
    const { className } = this.options;

    const $datepicker = document.createElement('div');
    $datepicker.classList.add(PREFIX);
    $datepicker.classList.add(`${PREFIX}-calendar`);
    if (className) $datepicker.classList.add(className);

    const datepickerText = /*html*/ `
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
    $datepicker.replaceChildren(
      ...parser.parseFromString(datepickerText, 'text/html').body.children
    );

    // Bind unit change event
    /** @type {HTMLElement | null} */
    const $navTitle = $datepicker.querySelector(`.${PREFIX}-nav-title`);
    if ($navTitle)
      on($navTitle, 'click', () => {
        const nextUnit = this.currentUnit === 'days' ? 'months' : 'years';
        this.setCurrentUnit(nextUnit);
      });

    // Bind move event
    $datepicker.querySelectorAll(`.${PREFIX}-nav-btn`).forEach(($el, index) =>
      on(/** @type {HTMLElement} */ ($el), 'click', (event) => {
        const { action } = event.currentTarget.dataset;
        const isPrev = isUndefined(action) ? !index : action === 'prev';
        isPrev ? this.prev() : this.next();
      })
    );

    return $datepicker;
  }

  #renderLocaleItems() {
    const {
      locale: { weekdaysMin, placeholder },
      weekIndexes,
    } = this.converter;

    // Update placeholder text
    this.$input.placeholder = placeholder;

    // Render weekdays
    const $weekdays = this.$datepicker.querySelector(`.${PREFIX}-weekdays`);
    if (!$weekdays) return;

    $weekdays.innerHTML = weekIndexes
      .map(
        (index) =>
          `<span class="${PREFIX}-weekday" data-dayindex="${index}">${weekdaysMin[index]}</span>`
      )
      .join('');
  }

  /**
   * Rendering days
   * @param {Date} unitDate
   */
  #renderDays(unitDate) {
    const year = unitDate.getFullYear();
    const month = unitDate.getMonth();

    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const firstDateDay = firstDate.getDay();
    const lastDateDay = lastDate.getDay();

    const { weekStart = 0 } = this.converter.locale;
    const preDays =
      (firstDateDay + 7 - weekStart) % 7 || (lastDate.getDate() === 28 ? 7 : 0);
    const postDays = 6 - lastDateDay;

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

    if (!this.$datepicker) return;
    const $target = this.$datepicker.querySelector(`.${PREFIX}-days-content`);
    if (!$target) return;

    const selectedDate = this.selectedDate;
    const selected = { month: -1, day: -1 };
    if (!isNull(selectedDate)) {
      selected.day = selectedDate.getDate();
      selected.month = selectedDate.getMonth();
    }
    const todays = getToday();

    // Render days
    $target.innerHTML = '';
    days.forEach(({ d, m }) => {
      const $day = document.createElement('div');

      $day.classList.add(`${PREFIX}-pickable-item`);
      if (m !== month) $day.classList.add('other');
      if (selected.day === d && selected.month === m) {
        $day.classList.add('active');
      }
      if (todays[0] === year && todays[1] === m && todays[2] === d) {
        $day.classList.add('today');
      }
      $day.dataset.year = `${year}`;
      $day.dataset.monthindex = `${m}`;
      $day.dataset.day = `${d}`;
      $day.innerHTML = `${d}`;

      $target.appendChild($day);

      on($day, 'click', (event) => this.#onClickPickableItem(event));
    });
  }

  /**
   * Rendering months
   * @param {Date} unitDate
   */
  #renderMonths(unitDate) {
    const year = unitDate.getFullYear();
    const { monthsShort } = this.converter.locale;

    // Render months
    if (!this.$datepicker) return;
    const $months = this.$datepicker.querySelector(`.${PREFIX}-months`);
    if (!$months) return;
    $months.innerHTML = '';

    const selectedDate = this.selectedDate;
    const selectedMonthIndex = isNull(selectedDate)
      ? -1
      : selectedDate.getMonth();
    const todays = getToday();

    monthsShort.forEach((monthShort, index) => {
      const $month = document.createElement('div');
      $month.classList.add(`${PREFIX}-pickable-item`);
      if (selectedMonthIndex === index) $month.classList.add('active');
      if (todays[0] === year && todays[1] === index) {
        $month.classList.add('today');
      }
      $month.dataset.monthindex = `${index}`;
      $month.dataset.year = `${year}`;
      $month.innerHTML = monthShort;

      $months.appendChild($month);

      on($month, 'click', (event) => this.#onClickPickableItem(event));
    });
  }

  /**
   * Rendering decade
   * @param {Date} unitDate
   */
  #renderDecade(unitDate) {
    if (!this.$datepicker) return;
    const $years = this.$datepicker.querySelector(`.${PREFIX}-years`);
    if (!$years) return;
    $years.innerHTML = '';

    const selectedDate = this.selectedDate;
    const selectedYear = isNull(selectedDate)
      ? Infinity
      : selectedDate.getFullYear();
    const todays = getToday();

    const [start, end] = this.converter.decade(unitDate);
    const years = Array.from({ length: end - start }, (_, i) => i + start);
    years.forEach((year) => {
      const $year = document.createElement('div');
      $year.classList.add(`${PREFIX}-pickable-item`);
      if (selectedYear === year) $year.classList.add('active');
      if (todays[0] === year) $year.classList.add('today');
      $year.dataset.year = `${year}`;
      $year.innerHTML = `${year}`;

      $years.appendChild($year);

      on($year, 'click', (event) => this.#onClickPickableItem(event));
    });
  }

  /**
   * @param {string} currentUnit
   * @param {Date} unitDate
   * @returns
   */
  #renderNavTitle(currentUnit, unitDate) {
    if (!this.$datepicker) return;
    const $title = this.$datepicker.querySelector(`.${PREFIX}-nav-title`);
    if (!$title) return;

    let format =
      this.options.titleFormat[
        /** @type {'days' | 'months' | 'years'} */ (currentUnit)
      ];
    if (currentUnit === 'years') {
      const [start, end] = this.converter.decade(unitDate);
      format = format.replaceAll('YYYY1', start.toString());
      format = format.replaceAll('YYYY2', end.toString());
      format = format.replaceAll('YY1', start.toString().substring(2));
      format = format.replaceAll('YY2', end.toString().substring(2));
    }
    $title.innerHTML = this.converter.format(unitDate, format);
  }

  #render() {
    const { currentUnit, unitDate } = this.#state.unit();
    this.#renderNavTitle(currentUnit, unitDate);

    switch (currentUnit) {
      case 'days':
        this.#renderDays(unitDate);
        break;
      case 'months':
        this.#renderMonths(unitDate);
        break;
      case 'years':
        this.#renderDecade(unitDate);
        break;
    }

    if (!this.$datepicker) return;
    const $items = this.$datepicker.querySelectorAll(`.${PREFIX}-body > *`);
    const $target = this.$datepicker.querySelector(
      `.${PREFIX}-${this.currentUnit}`
    );
    $items.forEach(($el) => $el.classList.remove('show'));
    if ($target) $target.classList.add('show');
  }

  /**
   *
   * @param {Evt<'click'>} event
   */
  #onClickPickableItem(event) {
    let existValueCount = 0;
    const datasetKeys = ['year', 'monthindex', 'day'];
    const params = /** @type {[number, number, number]} */ (
      datasetKeys.map((key) => {
        const item = event.currentTarget.dataset[key];
        if (isUndefined(item)) return 1;
        existValueCount += 1;
        return Number(item);
      })
    );

    const nextUnit = existValueCount === 1 ? 'months' : 'days';

    const prevDate = this.selectedDate;
    const date = new Date(...params);
    if (this.#onBeforeSelect(date, prevDate)) {
      this.setSelectedDate(date);
      this.#onSelect(date, prevDate);
    }
    this.setUnitDate(date);
    if (this.currentUnit !== nextUnit) this.setCurrentUnit(nextUnit);
  }

  /**
   * @param {Date} date
   * @param {Date | null} [prevDate]
   * @returns {boolean}
   */
  #onBeforeSelect(date, prevDate = null) {
    return true;
  }

  /**
   * @param {Date} date
   * @param {Date | null} [prevDate]
   */
  #onSelect(date, prevDate = null) {}

  /**
   * Rerender datepicker element's calendar
   */
  refresh() {
    // Update weekdays text
    this.#renderLocaleItems();
    this.#render();
  }

  /**
   * Set current unit of datepicker
   * @param {string} unit
   */
  setCurrentUnit(unit) {
    const nextUnit = /** @type {'days' | 'months' | 'years'} */ (
      isUnit(unit) ? unit : this.options.minUnit
    );
    if (!checkUnit(unit, this.options.minUnit)) return;
    this.#state.unit({ ...this.#state.unit(), currentUnit: nextUnit });
  }

  /**
   * Set unit date of datepicker
   * @param {Date} date
   */
  setUnitDate(date) {
    this.#state.unit({ ...this.#state.unit(), unitDate: date });
  }

  /**
   * @param {*} date
   */
  setSelectedDate(date) {
    this.#state.date(isDateLike(date) ? new Date(date) : null);
  }

  /**
   * Move to next month/years/decade
   */
  next() {
    const date = this.unitDate;
    let year = date.getFullYear();
    let month = date.getMonth();
    switch (this.currentUnit) {
      case 'days': {
        month++;
        break;
      }
      case 'months': {
        year++;
        break;
      }
      case 'years': {
        year = Math.floor(year / 10) * 10 + 10;
        break;
      }
    }

    this.setUnitDate(new Date(year, month));
  }

  /**
   * Move to previous month/years/decade
   */
  prev() {
    const date = this.unitDate;
    let year = date.getFullYear();
    let month = date.getMonth();
    switch (this.currentUnit) {
      case 'days': {
        month--;
        break;
      }
      case 'months': {
        year--;
        break;
      }
      case 'years': {
        year = Math.floor(year / 10) * 10 - 10;
        break;
      }
    }

    this.setUnitDate(new Date(year, month));
  }

  /**
   * Hide calendar
   */
  hide() {
    this.$hide.replaceChildren(this.$datepicker);
  }

  /**
   * Show calendar
   */
  show() {
    const $conatiner = document.getElementById(DatePicker.containerId);
    if ($conatiner) $conatiner.appendChild(this.$datepicker);
  }
}

export default DatePicker;
