import type { DateLike, InternalOptions, Options, Unit } from '@t/options';
import type { Instance } from '@t/instance';
import type { EventManager } from '@t/event';
import checkSchema from '@/helpers/schema';
import { error } from '@/helpers/util';
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
import { CONTAINER_ID, PREFIX, cn } from '@/helpers/selectors';
import createInstance from '@/instance';
import Controls from '@/components/Controls';
import Content from '@/components/Content';
import createEventManager from './events';
import { effect } from '@janghye0k/observable';
import Target from '@/components/Target';
import { autoUpdate, computePosition, flip } from '@floating-ui/dom';

class DatePicker {
  private options: InternalOptions;
  private instance: Instance;
  private eventManager: EventManager;
  private originTemplate: string;

  private $hide = create$('div');
  private $container = DatePicker.createContainer();
  private components: any[] = [];
  private unsubscribers: Function[] = [];

  /** ID of datepicker elements container */
  static containerId = CONTAINER_ID;

  static createContainer = () => {
    const $find = find$<HTMLDivElement>('#' + CONTAINER_ID);
    if (!isNull($find)) return $find;
    const $container = create$('div', {
      id: CONTAINER_ID,
      classList: [PREFIX, CONTAINER_ID],
      role: 'presentation',
      innerHTML: /*html*/ `
        <div role="presentation" class="${cn('backdrop')}"></div>
      `,
    });
    document.body.appendChild($container);
    return $container;
  };

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
    const { selectedDate, unit } = opts;
    const initDate = isDateLike(selectedDate) ? new Date(selectedDate) : null;
    if (initDate) {
      this.setSelectedDate(initDate);
      this.setUnitDate(initDate);
    }
    if (unit) this.setCurrentUnit(unit);

    // Popup setting
    this.calendarPositionUpdate();
  }

  /** Converter instance for convert date to datepicker's locale format */
  get converter() {
    return this.instance.converter;
  }

  /** Current unit of calendar */
  get currentUnit() {
    return this.instance.store.currentUnit;
  }

  /** Current unit date */
  get unitDate() {
    return this.instance.store.unitDate;
  }

  /** Selected date of calendar, if not selected returns `null` */
  get selectedDate() {
    return this.instance.store.selectedDate;
  }

  /** Rendering datepicker components */
  private renderDatepicker() {
    const { instance, options, eventManager } = this;
    const defaultProps = { dp: this, instance, options, eventManager };

    const $controls = create$('div', { className: cn('controls') });
    const $content = create$('div', { className: cn('content') });
    const $arrow = create$('div', { className: cn('arrow') });
    this.$datepicker.replaceChildren($controls, $content, $arrow);

    this.components.push(new Controls($controls, defaultProps));
    this.components.push(new Content($content, defaultProps));
    new Target(this.$target, defaultProps);
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
        (unit, prevUnit) => {
          this.eventManager.trigger('changeUnit', { unit, prevUnit });
        },
        [store.state.currentUnit]
      ),

      effect(
        (date, prevDate) => {
          this.eventManager.trigger('changeUnitDate', { date, prevDate });
        },
        [store.state.unitDate]
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
    const prevDate = this.selectedDate;
    const nextDate = isDateLike(value) ? new Date(value) : null;
    const eventProps = { prevDate, date: nextDate };

    const beforeResults = this.eventManager.trigger('beforeSelect', eventProps);
    const isCancel =
      isArray(beforeResults) && beforeResults.some((item) => item === false);
    if (isCancel) return;

    this.instance.store.setSelectedDate(value);
  }

  /**
   * Set unit date of datepicker
   * @param {DateLike} value The unit date to change.
   */
  setUnitDate(value: DateLike) {
    this.instance.store.setUnitDate(value);
  }

  /**
   * Set current unit of datepicker
   * @param {Unit} value The unit to change. (e.g. `days` | `months` | `years`)
   */
  setCurrentUnit(value: Unit) {
    this.instance.store.setCurrentUnit(value);
  }

  /** Move to next `month` | `years` | `decade` */
  next() {
    this.instance.store.addUnitDate(1);
  }

  /** Move to previous `month` | `years` | `decade` */
  prev() {
    this.instance.store.addUnitDate(-1);
  }

  /** Hide calendar */
  hide() {
    if (this.options.animation) {
      // When animation is `true`
      this.$datepicker.classList.add('--scaleDown');
      const onAnimeEnd = (event: any) => {
        event.currentTarget.classList.remove('--scaleDown');
        this.$hide.replaceChildren(this.$datepicker);
        off(this.$datepicker, 'animationend', onAnimeEnd);
      };
      on(this.$datepicker, 'animationend', onAnimeEnd);
    } else {
      this.$hide.replaceChildren(this.$datepicker);
    }

    this.eventManager.trigger('hide', {});
    if (this.$input !== document.activeElement)
      (find$('.' + cn('inputBox')) as HTMLElement).classList.remove('--active');
  }

  /** Show calendar */
  show() {
    const $conatiner = this.$container;

    if (this.options.animation) {
      // When animation is `true`
      this.$datepicker.classList.add('--scaleUp');
      const onAnimeEnd = (event: any) => {
        event.currentTarget.classList.remove('--scaleUp');
        off(this.$datepicker, 'animationend', onAnimeEnd);
      };
      on(this.$datepicker, 'animationend', onAnimeEnd);
    }

    $conatiner.appendChild(this.$datepicker);
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
  }
}

export default DatePicker;
