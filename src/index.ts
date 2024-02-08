import type { DateLike, InternalOptions, Options, Unit } from '@t/options';
import type { Instance } from '@t/instance';
import type { EventManager } from '@t/event';
import checkSchema from '@/helpers/schema';
import { error } from '@/helpers/util';
import { create$, find$ } from 'doumi';
import { CONTAINER_ID, PREFIX, cn } from '@/helpers/selectors';
import createInstance from '@/instance';
import createEventManager from '@/events';
import PickerEvent from '@/events/picker-event';
import { convertToInput, createContainer } from '@/helpers/elements';
import Controls from '@/components/Controls';
import Content from '@/components/Content';

class DatePicker {
  #options: InternalOptions;
  #instance: Instance;
  #eventManager: EventManager;
  #$datepicker: HTMLDivElement;
  #$hide = create$('div');
  #$container = createContainer();
  #$input: HTMLInputElement;
  #originTemplate: string;

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
    this.#options = opts;
    const instance = createInstance(opts);
    this.#instance = instance;
    this.#eventManager = createEventManager(this);
    this.on = this.#eventManager.on;
    this.off = this.#eventManager.off;

    // Convert target to input element
    const [$input, originTemplate] = convertToInput($target, opts.readOnly);
    this.#$input = $input;
    this.#originTemplate = originTemplate;

    // Create components
    const classList = [PREFIX, cn('calendar')];
    if (this.#options.className) classList.push(this.#options.className);
    this.#$datepicker = create$('div', { classList });
    this.#$hide.appendChild(this.$datepicker); // Default hide datepicker

    const defaultProps = { dp: this, instance, options: opts };

    const $controls = create$('div', { className: cn('controls') });
    this.$datepicker.appendChild($controls);
    new Controls($controls, defaultProps);

    const $content = create$('div', { className: cn('content') });
    this.$datepicker.appendChild($content);
    new Content($content, defaultProps);
  }

  /** ID of datepicker elements container */
  static containerId = CONTAINER_ID;

  /** Element on which datepicker was initialized. */
  get $input() {
    return this.#$input;
  }

  /**
   * Datepicker element
   * @returns {HTMLDivElement}
   */
  get $datepicker(): HTMLDivElement {
    return this.#$datepicker;
  }

  /** Converter instance for convert date to datepicker's locale format */
  get converter() {
    return this.#instance.converter;
  }

  /** Current unit of calendar */
  get currentUnit() {
    return this.#instance.store.currentUnit;
  }

  /** Current unit date */
  get unitDate() {
    return this.#instance.store.unitDate;
  }

  /** Selected date of calendar, if not selected returns `null` */
  get selectedDate() {
    return this.#instance.store.selectedDate;
  }

  /** Datepicker calendar is visible */
  get visible() {
    return !this.#$hide.contains(this.$datepicker);
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
    this.#instance.store.setSelectedDate(value);
  }

  /**
   * Set unit date of datepicker
   * @param {DateLike} value The unit date to change.
   */
  setUnitDate(value: DateLike) {
    this.#instance.store.setUnitDate(value);
  }

  /**
   * Set current unit of datepicker
   * @param {Unit} value The unit to change. (e.g. `days` | `months` | `years`)
   */
  setCurrentUnit(value: Unit) {
    this.#instance.store.setCurrentUnit(value);
  }

  /** Move to next `month` | `years` | `decade` */
  next() {
    this.#instance.store.addUnitDate(1);
  }

  /** Move to previous `month` | `years` | `decade` */
  prev() {
    this.#instance.store.addUnitDate(-1);
  }

  /** Hide calendar */
  hide() {
    this.#$hide.replaceChildren(this.$datepicker);
    const event = new PickerEvent();
    this.#eventManager.trigger('hide', event);
  }

  /** Show calendar */
  show() {
    const $conatiner = this.#$container;
    $conatiner.appendChild(this.$datepicker);
    const event = new PickerEvent();
    this.#eventManager.trigger('show', event);
  }
}

export default DatePicker;
