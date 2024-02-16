import type { DateLike, InternalOptions, Options, Unit } from '@t/options';
import type { Instance } from '@t/instance';
import type { EventManager } from '@t/event';
import checkSchema from '@/helpers/schema';
import { error } from '@/helpers/util';
import { create$, find$, get, isArray, isDateLike, keysIn } from 'doumi';
import { CONTAINER_ID, PREFIX, cn } from '@/helpers/selectors';
import createInstance from '@/instance';
import PickerEvent from '@/events/picker-event';
import { convertToInput, createContainer } from '@/helpers/elements';
import Controls from '@/components/Controls';
import Content from '@/components/Content';
import createEventManager from './events';
import { effect } from '@janghye0k/observable';

class DatePicker {
  private options: InternalOptions;
  private instance: Instance;
  private eventManager: EventManager;
  private originTemplate: string;

  private $hide = create$('div');
  private $container = createContainer();
  private components: any[] = [];
  private unsubscribers: Function[] = [];

  /** ID of datepicker elements container */
  static containerId = CONTAINER_ID;

  /** Element on which datepicker was initialized. */
  readonly $input: HTMLInputElement;

  /**
   * Datepicker element
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
    const $target = typeof element === 'string' ? find$(element) : element;
    if (!($target instanceof Element))
      throw error('constructor element shoul be CSS selector or Element');

    // init
    const opts = checkSchema(options);
    this.options = opts;

    const instance = createInstance(opts);
    const eventManager = createEventManager(this, opts);

    this.instance = instance;
    this.eventManager = eventManager;
    this.on = eventManager.on;
    this.off = eventManager.off;

    // Convert target to input element
    const [$input, originTemplate] = convertToInput($target, opts.readOnly);
    this.$input = $input;
    this.originTemplate = originTemplate;

    // Create datepicker element
    const classList = [PREFIX, cn('calendar')];
    if (this.options.className) classList.push(this.options.className);
    this.$datepicker = create$('div', { classList });
    this.$hide.appendChild(this.$datepicker); // Default hide datepicker

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

  private renderDatepicker() {
    const { instance, options, eventManager } = this;
    const defaultProps = { dp: this, instance, options, eventManager };

    const $controls = create$('div', { className: cn('controls') });
    this.$datepicker.appendChild($controls);
    this.components.push(new Controls($controls, defaultProps));

    const $content = create$('div', { className: cn('content') });
    this.$datepicker.appendChild($content);
    this.components.push(new Content($content, defaultProps));
  }

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
    this.$hide.replaceChildren(this.$datepicker);
    const event = new PickerEvent();
    this.eventManager.trigger('hide', event);
  }

  /** Show calendar */
  show() {
    const $conatiner = this.$container;
    $conatiner.appendChild(this.$datepicker);
    const event = new PickerEvent();
    this.eventManager.trigger('show', event);
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
