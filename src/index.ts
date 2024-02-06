import checkSchema, { UNIT_ORDER, checkUnit, isUnit } from '@/helpers/schema';
import { decade, error, parseDate } from '@/helpers/util';
import {
  isDateLike,
  isNullish,
  isNull,
  isUndefined,
  isObject,
  on,
  create$,
  find$,
  findAll$,
  entries,
  capitalize,
  off,
  find,
  Evt,
} from 'doumi';
import defaultLocale from '@/locale/en';
import localeInfo from '@/locale.json';
import ChevronLeft from '@/icons/chevron-left';
import ChevronRight from '@/icons/chevron-right';
import LocaleConverter from '@/helpers/locale-converter';
import { effect, observable } from '@janghye0k/observable';
import {
  autoUpdate,
  arrow,
  computePosition,
  offset,
  flip,
} from '@floating-ui/dom';
import anime from 'animejs';
import { Locale } from '@t/locale';
import { InternalOptions, Options, Unit } from '@t/options';

const PREFIX = 'hye0k-datepicker';

class DatePicker {
  #datepicker;

  #input = create$('input');

  #converter = new LocaleConverter(defaultLocale);

  #state = {
    unit: observable({ currentUnit: 'days', unitDate: new Date() }),
    date: observable<null | undefined | Date>(null),
  };

  /** @private */
  private $hide: HTMLElement = create$('body');

  /** @private */
  private options: InternalOptions;

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
  get $datepicker(): HTMLDivElement {
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
    return this.#state.unit().currentUnit as 'days' | 'months' | 'years';
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
    return isNullish(selectedDate) ? null : new Date(selectedDate);
  }

  /**
   * Datepicker calendar is visible
   */
  get visible() {
    return !this.$hide.contains(this.$datepicker);
  }

  /**
   * @param {Element | string} element
   * @param {Options} [options]
   */
  constructor(element: Element | string, options: Options = {}) {
    const $target = typeof element === 'string' ? find$(element) : element;
    if (!($target instanceof Element))
      throw error('constructor element shoul be CSS selector or Element');

    // Check options schema & initialize datepicker
    this.options = checkSchema(options);

    // Convert element
    this.#input = this.#convertToInput($target as HTMLElement);

    // Create datepicker container
    this.#createContainer();

    // Create calendar
    this.#datepicker = this.#createDatepicker();
    this.hide();

    // Bind Calendar poup events
    this.#bindCalendarPopupEvents();

    // Set locale
    this.#setLocale(this.options.locale);

    // Subscribe listener
    this.#bindLisenter();

    // Set data
    const selectedDate = this.options.selectedDate;

    this.#state.unit({
      currentUnit: this.options.unit,
      unitDate: new Date(selectedDate ?? Date.now()),
    });
    this.setSelectedDate(selectedDate);

    // Render
    this.refresh();
  }

  #bindLisenter() {
    effect(
      () => this.#render(),
      [this.#state.unit],
      (state) => {
        let args = parseDate(state.unitDate).slice(
          0,
          3 - UNIT_ORDER[state.currentUnit as keyof typeof UNIT_ORDER]
        );
        args = args.length ? args : decade(state.unitDate);
        return `${state.currentUnit}__${args.join('__')}`;
      }
    );
    effect(
      (state) => {
        this.$input.value = this.converter.date(state); // set input date

        // Unselect all items
        const $items = findAll$(`.${PREFIX}-pickable-item`, this.$datepicker);
        $items.forEach(($item) => $item.classList.remove('active'));

        // Find Select target
        if (!state) return;

        // Make find target's dataset
        const currentUnit = this.currentUnit;
        const order = UNIT_ORDER[currentUnit];
        const [year, monthindex, day] = parseDate(state);
        const dataset: Record<string, any> = { year, monthindex, day };
        if (order > 1) delete dataset.day;
        if (order > 2) delete dataset.monthindex;

        // Find target and select it
        const $target = find$(
          `.${PREFIX}-${this.currentUnit} .${PREFIX}-pickable-item${entries(
            dataset
          ).reduce(
            (acc, [value, key]) => acc + `[data-${key}="${value}"]`,
            ''
          )}`,
          this.$datepicker
        );
        if ($target) $target.classList.add('active');
      },
      [this.#state.date],
      (state) => Number(state)
    );
  }

  /**
   * Get datepicker (browser) locale
   */
  async #setLocale(locale?: string | Locale) {
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
   */
  #convertToInput(element: Element): HTMLInputElement {
    const { id, className } = element;

    const $input = create$('input', {
      id,
      className,
      classList: [PREFIX, `${PREFIX}-input`],
      type: 'text',
      readOnly: this.options.readOnly,
      placeholder: this.converter.locale.placeholder,
    });
    element.replaceWith($input);

    const setDateToCurrent = (event: any) => {
      const selectedDate = this.selectedDate;
      event.currentTarget.value = isNull(selectedDate)
        ? ''
        : this.converter.date(selectedDate);
    };

    on($input, 'keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDateToCurrent(event);
        return false;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        if (this.converter.isValid(event.currentTarget.value)) {
          const inputDate = new Date(event.currentTarget.value);
          this.setSelectedDate(inputDate);
          this.setUnitDate(inputDate);
        } else setDateToCurrent(event);
        return false;
      }
    });

    on($input, 'blur', (event) => {
      if (this.options.readOnly) return;
      if (!this.converter.isValid(event.currentTarget.value)) {
        return setDateToCurrent(event);
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
    const $container = create$('div', {
      id: DatePicker.containerId,
      classList: [PREFIX, DatePicker.containerId],
      role: 'presentation',
      innerHTML: /*html*/ `
      <div role="presentation" class="${PREFIX}-backdrop"></div>
    `,
    });

    document.body.appendChild($container);
  }

  /**
   * Create datepicker element
   * @returns {HTMLDivElement}
   */
  #createDatepicker() {
    const { className } = this.options;

    const classList = [PREFIX, `${PREFIX}-calendar`];
    if (className) classList.push(className);
    const $datepicker = create$('div', { classList });

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
      </div>
      <div class="${PREFIX}-calendar-arrow"></div>`;
    const parser = new DOMParser();
    $datepicker.replaceChildren(
      ...Array.from(
        parser.parseFromString(datepickerText, 'text/html').body.children
      )
    );

    // Bind unit change event
    /** @type {HTMLElement | null} */
    const $navTitle = find$(`.${PREFIX}-nav-title`, $datepicker);
    if ($navTitle)
      on($navTitle, 'click', () => {
        const nextUnit = this.currentUnit === 'days' ? 'months' : 'years';
        this.setCurrentUnit(nextUnit);
      });

    // Bind move event
    findAll$(`.${PREFIX}-nav-btn`, $datepicker).forEach(($el, index) =>
      on(/** @type {HTMLElement} */ $el, 'click', (event) => {
        const { action } = event.currentTarget.dataset;
        const isPrev = isUndefined(action) ? !index : action === 'prev';
        isPrev ? this.prev() : this.next();
      })
    );

    return $datepicker;
  }

  /**
   * Bind calendar popup animation & set position of calendar when calendar is popup
   */
  #bindCalendarPopupEvents() {
    const $input = this.$input;
    const $datepicker = this.$datepicker;
    const $arrow = find$(
      `.${PREFIX}-calendar-arrow`,
      $datepicker
    ) as HTMLElement;
    const updatePosition = () => {
      computePosition($input, $datepicker, {
        placement: this.options.position,
        middleware: [
          offset(12),
          arrow({ element: $arrow, padding: 0 }),
          flip(),
        ],
      }).then(({ x, y, middlewareData, placement }) => {
        Object.assign($datepicker.style, {
          left: `${x}px`,
          top: `${y}px`,
        });

        if (middlewareData.arrow) {
          const { x, y } = middlewareData.arrow;
          const isX = placement.includes('bottom') || placement.includes('top');
          const isReverse =
            placement.includes('left') || placement.includes('top');
          const pad = 6;
          const arrowStyle: Record<string, any> = {
            borderWidth: '0px',
            top: 'unset',
            left: 'unset',
            right: 'unset',
            bottom: 'unset',
          };
          if (isX) {
            arrowStyle.left = x != null ? `${x}px` : '';
            const key = isReverse ? 'bottom' : 'top';
            const bordered = [key, key === 'bottom' ? 'right' : 'left'];
            arrowStyle[key] = `-${pad}px`;
            bordered.forEach(
              (border) =>
                (arrowStyle[`border${capitalize(border)}Width`] = '1px')
            );
          } else {
            arrowStyle.top = y != null ? `${y}px` : '';
            const key = isReverse ? 'right' : 'left';
            const bordered = [key, key === 'right' ? 'top' : 'bottom'];
            arrowStyle[key] = `-${pad}px`;
            bordered.forEach(
              (border) =>
                (arrowStyle[`border${capitalize(border)}Width`] = '1px')
            );
          }
          Object.assign($arrow.style, arrowStyle);
        }
      });
    };
    autoUpdate($input, $datepicker, updatePosition);

    const animationMap = {
      top: { translateY: [-8, 0] },
      bottom: { translateY: [8, 0] },
      left: { translateX: [-8, 0] },
      right: { translateX: [8, 0] },
    };
    const animationItem =
      find(animationMap, (_, key) => this.options.position.includes(key)) ??
      animationMap.bottom;
    const showAnime = anime({
      targets: $datepicker,
      autoplay: false,
      duration: 200,
      easing: 'easeOutSine',
      opacity: [0, 1],
      ...animationItem,
    });
    const hideAnime = anime({
      targets: $datepicker,
      autoplay: false,
      duration: 200,
      easing: 'easeOutSine',
      opacity: [0, 1],
      ...animationItem,
    });
    hideAnime.reverse();

    const handleClickOutSide = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (this.$input.contains(target)) return;
      if (this.$datepicker.contains(target)) return;
      // this.hide();
      if (showAnime.progress) showAnime.pause();
      hideAnime.restart();
      hideAnime.finished.then(() => this.hide());
      off(document, 'click', handleClickOutSide);
    };

    on($input, 'click', () => {
      if (hideAnime.progress) {
        hideAnime.pause();
        this.hide();
      }
      if (!this.visible) {
        showAnime.restart();
        this.show();
      }
      on(document, 'click', handleClickOutSide, { capture: true });
    });
  }

  /**
   * Render locale items like months, weekdays
   */
  #renderLocaleItems() {
    const {
      locale: { weekdaysMin, placeholder },
      weekIndexes,
    } = this.converter;

    // Update placeholder text
    this.$input.placeholder = placeholder;

    // Render weekdays
    const $weekdays = find$(`.${PREFIX}-weekdays`, this.$datepicker);
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
  #renderDays(unitDate: Date) {
    const [year, month] = parseDate(unitDate);

    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const firstDateDay = firstDate.getDay();
    const lastDateDay = lastDate.getDay();

    const { weekStart = 0 } = this.converter.locale;
    const preDays =
      (firstDateDay + 7 - weekStart) % 7 || (lastDate.getDate() === 28 ? 7 : 0);
    const postDays = 6 - lastDateDay;

    const days: { d: number; m: number }[] = [];
    const displayPrevStart = new Date(year, month, 0).getDate() - preDays + 1;

    const pushData = (length: number, m: number, adder: number = 1) =>
      Array.from({ length }, (_, i) => days.push({ d: adder + i, m }));
    pushData(preDays, (month - 1 + 12) % 12, displayPrevStart);
    pushData(lastDate.getDate(), month), pushData(postDays, (month + 1) % 12);

    if (!this.$datepicker) return;
    const $target = find$(`.${PREFIX}-days-content`, this.$datepicker);
    if (!$target) return;

    const selectedDate = this.selectedDate;
    const selected = { month: -1, day: -1 };
    if (!isNull(selectedDate)) {
      selected.day = selectedDate.getDate();
      selected.month = selectedDate.getMonth();
    }
    const todays = parseDate();

    // Render days
    $target.innerHTML = '';
    days.forEach(({ d, m }) => {
      const isOtherMonth = m !== month;
      const isPickable = !isOtherMonth || this.options.selectOtherMonths;
      const isHidden = isOtherMonth && !this.options.showOtherMonths;

      const classList = [`${PREFIX}-pickable-item`];
      if (isOtherMonth) classList.push('other');
      if (selected.day === d && selected.month === m) classList.push('active');
      if (todays[0] === year && todays[1] === m && todays[2] === d)
        classList.push('today');

      const $day = create$('div', {
        classList,
        dataset: { year, monthindex: m, day: d },
        innerHTML: `${d}`,
      });
      if (isHidden) $day.setAttribute('hidden', '');

      $target.appendChild($day);

      if (isPickable)
        on($day, 'click', (event) => this.#onClickPickableItem(event));
    });
  }

  /**
   * Rendering months
   * @param {Date} unitDate
   */
  #renderMonths(unitDate: Date) {
    const year = unitDate.getFullYear();
    const { monthsShort } = this.converter.locale;

    // Render months
    if (!this.$datepicker) return;
    const $months = find$(`.${PREFIX}-months`, this.$datepicker);
    if (!$months) return;
    $months.innerHTML = '';

    const selectedDate = this.selectedDate;
    const selectedMonthIndex = isNull(selectedDate)
      ? -1
      : selectedDate.getMonth();
    const todays = parseDate();

    monthsShort.forEach((monthShort: string, index: number) => {
      const classList = [`${PREFIX}-pickable-item`];
      if (selectedMonthIndex === index) classList.push('active');
      if (todays[0] === year && todays[1] === index) classList.push('today');

      const $month = create$('div', {
        classList,
        dataset: { monthindex: index, year },
        innerHTML: monthShort,
      });
      $months.appendChild($month);

      on($month, 'click', (event) => this.#onClickPickableItem(event));
    });
  }

  /**
   * Rendering decade
   * @param {Date} unitDate
   */
  #renderDecade(unitDate: Date) {
    if (!this.$datepicker) return;
    const $years = find$(`.${PREFIX}-years`, this.$datepicker);
    if (!$years) return;
    $years.innerHTML = '';

    const selectedDate = this.selectedDate;
    const selectedYear = isNull(selectedDate)
      ? Infinity
      : selectedDate.getFullYear();
    const todays = parseDate();

    const [start, end] = decade(unitDate);
    const years = Array.from({ length: end - start }, (_, i) => i + start);
    years.forEach((year) => {
      const classList = [`${PREFIX}-pickable-item`];
      if (selectedYear === year) classList.push('active');
      if (todays[0] === year) classList.push('today');

      const $year = create$('div', {
        classList,
        dataset: { year },
        innerHTML: `${year}`,
      });
      $years.appendChild($year);

      on($year, 'click', (event) => this.#onClickPickableItem(event));
    });
  }

  /**
   * @param {string} currentUnit
   * @param {Date} unitDate
   * @returns
   */
  #renderNavTitle(currentUnit: string, unitDate: Date) {
    if (!this.$datepicker) return;
    const $title = find$(`.${PREFIX}-nav-title`, this.$datepicker);
    if (!$title) return;

    let format =
      this.options.titleFormat[currentUnit as 'days' | 'months' | 'years'];
    if (currentUnit === 'years') {
      const [start, end] = decade(unitDate);
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
    const $items = findAll$(`.${PREFIX}-body > *`, this.$datepicker);
    const $target = find$(`.${PREFIX}-${this.currentUnit}`, this.$datepicker);
    $items.forEach(($el) => $el.classList.remove('show'));
    if ($target) $target.classList.add('show');
  }

  #onClickPickableItem(event: Evt<'click'>) {
    const currentUnit = this.currentUnit;

    let existValueCount = 0;
    const datasetKeys = ['year', 'monthindex', 'day'];
    const params = datasetKeys.map((key) => {
      const item = event.currentTarget.dataset[key];
      if (isUndefined(item)) return 1;
      existValueCount += 1;
      return Number(item);
    }) as [number, number, number];

    const nextUnit = existValueCount === 1 ? 'months' : 'days';
    if (currentUnit !== nextUnit) this.setCurrentUnit(nextUnit);

    const prevDate = this.selectedDate;
    const isUnSelect =
      event.currentTarget.classList.contains('active') &&
      this.options.toggleSelected;
    const date = isUnSelect ? undefined : new Date(...params, 12);
    if (this._onBeforeSelect(date, prevDate)) {
      this.setSelectedDate(date);
      this._onSelect(date, prevDate);
      if (currentUnit !== 'days' || (this.options.moveOtherMonths && date)) {
        this.setUnitDate(date);
      }
    }
  }

  /**
   * @param {Date | undefined | null} date
   * @param {Date | undefined | null} [prevDate]
   * @returns {boolean}
   */
  _onBeforeSelect(
    date: Date | undefined | null,
    prevDate: Date | undefined | null = undefined
  ): boolean {
    console.log(date, prevDate);
    return true;
  }

  /**
   * @param {Date | undefined | null} date
   * @param {Date | undefined | null} [prevDate]
   */
  _onSelect(
    date: Date | undefined | null,
    prevDate: Date | undefined | null = undefined
  ) {
    console.log(date, prevDate);
  }

  _onShow() {}

  /**
   * Rerender datepicker element's calendar
   */
  refresh() {
    // Update weekdays text
    this.$input.value = this.converter.date(this.selectedDate);
    this.#renderLocaleItems();
    this.#render();
  }

  /**
   * Set current unit of datepicker
   * @param {string} unit
   */
  setCurrentUnit(unit: Unit) {
    const nextUnit = isUnit(unit) ? unit : this.options.minUnit;
    if (!checkUnit(unit, this.options.minUnit)) return;
    this.#state.unit({ ...this.#state.unit(), currentUnit: nextUnit });
  }

  /**
   * Set unit date of datepicker
   * @param {*} date
   */
  setUnitDate(date: any) {
    if (!isDateLike(date))
      return console.log(`This unitDate is invalid date - ${date}`);
    this.#state.unit({ ...this.#state.unit(), unitDate: new Date(date) });
  }

  /**
   * @param {*} date
   */
  setSelectedDate(date: any) {
    this.#state.date(isDateLike(date) ? new Date(date) : null);
  }

  /**
   * Move to next month/years/decade
   */
  next() {
    let [year, month] = parseDate(this.unitDate);
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
    let [year, month] = parseDate(this.unitDate);
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
