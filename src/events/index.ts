import type { EventManager } from '@t/event';
import { get, isArray, isFunction } from 'doumi';
import PickerEvent from './picker-event';
import DatePicker from '@/index';
import { Options } from '@t/options';

const OPTION_EVENT_KEYS = [
  'onShow',
  'onHide',
  'onFocus',
  'onBlur',
  'onClickCell',
  'onRenderCell',
  'onBeforeSelect',
  'onSelect',
  'onChangeView',
  'onChangeViewDate',
];

function createEventManager(
  datepicker: DatePicker,
  options: Options
): EventManager {
  const listenerMap: { [eventName: string]: Function[] } = {};

  const manager: EventManager = {
    on: (eventName: string, listener: Function) => {
      const listeners = listenerMap[eventName];
      isArray(listeners)
        ? listeners.push(listener)
        : (listenerMap[eventName] = [listener]);
    },

    off: (eventName: string, listener: Function) => {
      const listeners = listenerMap[eventName];
      if (!isArray(listener)) return;
      const index = listeners.findIndex((item) => item === listener);
      if (index > -1) {
        listenerMap[eventName] = listeners
          .slice(0, index)
          .concat(listener.slice(index + 1));
      }
    },

    trigger: (eventName, eventProps) => {
      const listeners = listenerMap[eventName];
      if (!isArray(listeners)) return;
      const pickerEvent = new PickerEvent(eventProps);

      return listeners.map((listener) => {
        pickerEvent.setDatePicker(datepicker);
        return listener(pickerEvent);
      });
    },
  };

  OPTION_EVENT_KEYS.forEach((key) => {
    const item = get(options, key);
    const eventName = key.at(2)?.toLowerCase() + key.slice(3);
    if (isFunction(item)) manager.on(eventName, item);
  });

  return manager;
}

export default createEventManager;
