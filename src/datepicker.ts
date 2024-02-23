import type { DateLike, InternalOptions, Options, View } from '@t/options';
import type { Instance } from '@t/instance';
import type { EventManager } from '@t/event';
import checkSchema from '@/helpers/schema';
import { error, parseDate } from '@/helpers/util';
import {
  create$,
  find$,
  get,
  isArray,
  isDateLike,
  isNull,
  keysIn,
  off,
  on,
} from 'doumi';
import { cn } from '@/helpers/selectors';
import createInstance from '@/instance';
import Controls from '@/components/Controls';
import Content from '@/components/Content';
import createEventManager from '@/events';
import { effect } from '@janghye0k/observable';
import Target from '@/components/Target';
import { autoUpdate, computePosition, flip } from '@floating-ui/dom';
import { CONTAINER_ID, PREFIX, VIEW_ORDER } from '@/helpers/consts';
import { createShortcutsHandler } from '@/helpers/shortcuts';
import Button from '@/components/Button';

const createContainer = () => {
  const $find = find$<HTMLDivElement>('#' + CONTAINER_ID);
  if (!isNull($find)) return $find;
  const $container = create$('div', {
    id: CONTAINER_ID,
    classList: [PREFIX, CONTAINER_ID],
    role: 'presentation',
    innerHTML: /*html*/ `<div role="presentation" class="${cn('backdrop')}"></div>`,
  });
  document.body.appendChild($container);
  return $container;
};

class DatePicker {
  private options: InternalOptions;
  private instance: Instance;
  private eventManager: EventManager;
  private originTemplate: string;

  private $container = createContainer();
  private $hide = create$('div');
  private components: any[] = [];
  private unsubscribers: Function[] = [];

  /** ID of datepicker elements container */
  static containerId = CONTAINER_ID;
  static createContainer = createContainer;

  /**
   * Element on which datepicker was initialized.
   * @type {HTMLElement}
   */
  readonly $target: HTMLElement;

  /**
   * Datepicker input element
   * @type {HTMLInputElement}
   */
  readonly $input: HTMLInputElement;

  /**
   * Datepicker calendar element
   * @type {HTMLDivElement}
   */
  readonly $datepicker: HTMLDivElement;

  /**
   * Add event listener
   * @param {string} eventName The event name of datepicker.
   * @param {Function} listener The event listener.
   */
  on: EventManager['on'];
  /**
   * Remove event listener
   * @param {string} eventName The event name of datepicker.
   * @param {Function} listener The event listener.
   */
  off: EventManager['off'];

  /**
   * @param {Element | string} element
   * @param {Options} [options]
   */
  constructor(element: Element | string, options: Options = {}) {
    const target = typeof element === 'string' ? find$(element) : element;
    if (!(target instanceof Element))
      throw error('constructor element shoul be CSS selector or Element');

    // init
    const opts = checkSchema(options);
    this.options = opts;
    this.originTemplate = target.outerHTML;

    const { id, className } = target;
    const $target = create$('div', { id: !id ? undefined : id, className });
    target.replaceWith($target);
    this.$target = $target as HTMLElement;
    this.$input = create$('input');
    const instance = createInstance(opts);
    const eventManager = createEventManager(this, opts);

    this.instance = instance;
    this.eventManager = eventManager;
    this.on = eventManager.on;
    this.off = eventManager.off;

    // Create calendar element
    const classList = [PREFIX, cn('calendar')];
    if (this.options.className) classList.push(this.options.className);
    this.$datepicker = create$('div', { classList });
    this.$hide.appendChild(this.$datepicker); // Default hide calendar

    this.renderDatepicker();
    this.eventSubcribe();

    // Set options value
    const { selectedDate, view, shortcuts } = opts;
    const initDate =
      selectedDate && isDateLike(selectedDate) ? new Date(selectedDate) : null;
    if (initDate) {
      this.setSelectedDate(initDate);
      this.setViewDate(initDate);
    }
    if (view) this.setCurrentView(view);
    if (shortcuts) {
      on(this.$datepicker, 'keydown', createShortcutsHandler(this));
    }

    // Popup setting
    if (!opts.inline && !opts.backdrop) this.calendarPositionUpdate();
  }

  /** Converter instance for convert date to datepicker's locale format */
  get converter() {
    return this.instance.converter;
  }

  /**
   * Current view of calendar
   * @returns {'years' | 'months' | 'days'}
   */
  get currentView(): View {
    return this.instance.store.currentView;
  }

  /**
   * Current view date
   * @returns {Date}
   */
  get viewDate(): Date {
    return this.instance.store.viewDate;
  }

  /**
   * Selected date of calendar, if not selected returns `null`
   * @returns {Date | null}
   */
  get selectedDate(): Date | null {
    return this.instance.store.selectedDate;
  }

  /**
   * Focus date of calendar, if not focused returns `null`
   * @returns {Date | null}
   */
  get focusDate(): Date | null {
    return this.instance.store.state.focusDate();
  }

  /** Rendering datepicker components */
  private renderDatepicker() {
    const { instance, options, eventManager } = this;
    const defaultProps = { dp: this, instance, options, eventManager };

    const $controls = create$('div', { className: cn('controls') });
    const $content = create$('div', { className: cn('content') });
    this.$datepicker.replaceChildren($controls, $content);
    this.$datepicker.tabIndex = -1;

    this.components.push(new Controls($controls, defaultProps));
    this.components.push(new Content($content, defaultProps));

    if (this.options.buttons) {
      // Render buttons
      const $buttonWrapper = create$('div', { className: cn('buttonWrapper') });
      const buttonOptions = isArray(this.options.buttons)
        ? this.options.buttons
        : [this.options.buttons];
      buttonOptions.forEach((buttonOption) => {
        const $btn = create$('button', { className: cn('button') });
        $buttonWrapper.appendChild($btn);
        new Button($btn, { ...defaultProps, buttonOption });
      });
      this.$datepicker.appendChild($buttonWrapper);
    }

    // Determine inline calendar
    if (this.options.inline) {
      this.$datepicker.classList.add('--inline');
      this.$target.replaceWith(this.$datepicker);
    } else new Target(this.$target, defaultProps);

    if (this.options.backdrop) this.$datepicker.classList.add('--center');
  }

  /** Update calendar position automatically */
  private calendarPositionUpdate() {
    const { $target, $datepicker } = this;

    const originMap = {
      top: '50% 100%',
      bottom: '50% 0',
      left: '100% 50%',
      right: '0 50%',
    };

    const updatePosition = () => {
      computePosition($target, $datepicker, {
        placement: this.options.position as any,
        middleware: [flip()],
      }).then(({ x, y, placement }) => {
        const tfOrigin = this.options.animation
          ? {
              transformOrigin:
                originMap[placement.split('-')[0] as keyof typeof originMap],
            }
          : {};
        Object.assign($datepicker.style, {
          top: `${y}px`,
          left: `${x}px`,
          ...tfOrigin,
        });
      });
    };
    return autoUpdate($target, $datepicker, updatePosition);
  }

  /** Subscrie events */
  private eventSubcribe() {
    const { store } = this.instance;
    this.unsubscribers.push(
      effect(
        (date, prevDate) => {
          this.eventManager.trigger('select', { date, prevDate });
        },
        [store.state.date]
      ),

      effect(
        (view, prevView) => {
          this.eventManager.trigger('changeView', { view, prevView });
        },
        [store.state.currentView]
      ),

      effect(
        (date, prevDate) => {
          this.eventManager.trigger('changeViewDate', { date, prevDate });
        },
        [store.state.viewDate]
      )
    );
  }

  /** Hide calendar when click outside */
  private handleClickOutside = (event: MouseEvent) => {
    if (!this.isShow()) {
      off(document, 'click', this.handleClickOutside);
      return;
    }
    const target = event.target as HTMLElement;
    const $btn = find$('.' + cn('calendarBtn'), this.$target);
    if ($btn && $btn.contains(target)) return;
    if (this.$datepicker.contains(target)) return;
    this.hide();
  };

  /**
   * Set selected date of datepicker
   * @param {*} value The date to select
   * @example
   *
   * setSelectedDate(new Date(2024, 01, 01, 12)) // Thu Feb 01 2024 12:00:00
   * setSelectedDate('invalid') // null
   */
  setSelectedDate(value: any) {
    const { minDate, maxDate } = this.options;
    const prevDate = this.selectedDate;
    const nextDate = isDateLike(value) ? new Date(value) : null;
    let date = nextDate;
    if (date) {
      if (date < minDate) date = minDate;
      else if (date > maxDate) date = maxDate;
      date.setHours(12), date.setMinutes(0);
      date.setSeconds(0), date.setMilliseconds(0);
    }
    if (prevDate) {
      prevDate.setHours(12), prevDate.setMinutes(0);
      prevDate.setSeconds(0), prevDate.setMilliseconds(0);
    }
    if (Number(date) === Number(prevDate)) return;

    const eventProps = { prevDate, date };

    const beforeResults = this.eventManager.trigger('beforeSelect', eventProps);
    const isCancel =
      isArray(beforeResults) && beforeResults.some((item) => item === false);
    if (isCancel) return;

    this.instance.store.setSelectedDate(date);
  }

  /**
   * Set view date of datepicker
   * @param {DateLike} value The view date to change.
   */
  setViewDate(value: DateLike) {
    if (!isDateLike(value)) return;
    const { minDate, maxDate } = this.options;
    let viewDate = new Date(value);
    if (viewDate < minDate) viewDate = minDate;
    else if (viewDate > maxDate) viewDate = maxDate;
    this.instance.store.setViewDate(viewDate);
  }

  /**
   * Set current view of datepicker
   * @param {View} value The view to change. (e.g. `days` | `months` | `years`)
   */
  setCurrentView(value: View) {
    this.instance.store.setCurrentView(value);
  }

  /**
   * Set focus date of datepicker
   * @param {*} value The value to change
   */
  setFocusDate(value: any) {
    const date = !isDateLike(value) ? null : new Date(value);
    this.instance.store.state.focusDate(date);
  }

  /**
   * Check arguments date is same date in given view.
   * @param {Date} date The value to check
   * @param {Date} compare The value to compare
   * @param {'days' | 'months' | 'years'} view The view state to use for comparison.
   * @returns {boolean} Returns the value and compare in the same view
   * @example
   *
   * isSameDate(new Date('2024-01-01'), new Date('2024-01-30')) // false
   * isSameDate(new Date('2024-01-01'), new Date('2024-01-30'), 'months') // true
   */
  isSameDate(date: Date, compare: Date, view: View = 'days'): boolean {
    const arr1 = parseDate(date).slice(0, 4 - VIEW_ORDER[view]);
    const arr2 = parseDate(compare);
    return arr1.every((value, index) => arr2[index] === value);
  }

  private addViewDate(direction: 'next' | 'prev') {
    const adder = direction === 'prev' ? -1 : 1;
    const { currentView, viewDate } = this;
    const params = parseDate(viewDate).slice(0, 2);
    let [year, month] = params;
    month += 1;

    switch (currentView) {
      case 'days':
        month += adder;
        if (month === 0) (month = 12), (year -= 1);
        else if (month === 13) (month = 1), (year += 1);
        break;
      case 'months':
        year += adder;
        break;
      case 'years':
        year += adder * 10;
        break;
    }

    const y = String(year).padStart(4, '0');
    const m = String(month).padStart(2, '0');
    const nextViewDate = new Date(`${y}-${m}-01`);
    if (this.options.navigationLoop) {
      const { minDate, maxDate } = this.options;
      if (nextViewDate < minDate) return this.setViewDate(maxDate);
      else if (maxDate < nextViewDate) return this.setViewDate(minDate);
    }
    this.setViewDate(nextViewDate);
  }

  /** Move to next `month` | `years` | `decade` */
  next() {
    this.addViewDate('next');
  }

  /** Move to previous `month` | `years` | `decade` */
  prev() {
    this.addViewDate('prev');
  }

  /** Hide calendar */
  hide() {
    if (this.options.inline || !this.isShow()) return;

    if (this.options.animation) {
      // When animation is `true`
      const animationName = this.options.backdrop ? '--fadeOut' : '--scaleDown';
      this.$datepicker.classList.add(animationName);
      const onAnimeEnd = (event: any) => {
        event.currentTarget.classList.remove(animationName);
        this.$hide.replaceChildren(this.$datepicker);
        off(this.$datepicker, 'animationend', onAnimeEnd);
      };
      on(this.$datepicker, 'animationend', onAnimeEnd);
    } else {
      this.$hide.replaceChildren(this.$datepicker);
    }
    this.$datepicker.classList.remove('--show');

    this.eventManager.trigger('hide', {});
    if (this.$input !== document.activeElement)
      (find$('.' + cn('inputBox')) as HTMLElement).classList.remove('--active');
  }

  /** Show calendar */
  show() {
    if (this.options.inline || this.isShow()) return;
    const $conatiner = this.$container;
    $conatiner.appendChild(this.$datepicker);
    this.$datepicker.classList.add('--show');

    if (this.options.animation) {
      // When animation is `true`
      const animationName = this.options.backdrop ? '--fadeIn' : '--scaleUp';
      this.$datepicker.classList.add(animationName);
      const onAnimeEnd = (event: any) => {
        event.currentTarget.classList.remove(animationName);
        this.$datepicker.focus();
        off(this.$datepicker, 'animationend', onAnimeEnd);
      };
      on(this.$datepicker, 'animationend', onAnimeEnd);
    } else this.$datepicker.focus();

    (find$('.' + cn('inputBox')) as HTMLElement).classList.add('--active');
    on(document, 'click', this.handleClickOutside, { capture: true });
    this.eventManager.trigger('show', {});
  }

  /** Datepicker calendar is visible */
  isShow() {
    return !this.$hide.contains(this.$datepicker);
  }

  /** Delete datepicker */
  destroy() {
    this.unsubscribers.forEach((fn) => fn());
    this.$input.outerHTML = this.originTemplate;
    this.components.forEach((component) => component.destroy());
    const elementKeys = ['$datepicker', '$container', '$hide'];
    elementKeys.forEach((key) => get(this, key).remove());
    keysIn(this).forEach((key) => delete (this as any)[key]);
    this.$target.outerHTML = this.originTemplate;
  }
}

export default DatePicker;
