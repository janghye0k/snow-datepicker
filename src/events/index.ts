import { OPTION_EVENT_KEYS } from '@/helpers/consts';
import SnowDatePicker from '@/index';
import type { EventManager } from '@t/event';
import { Options } from '@t/options';
import { get, isArray, isFunction } from 'doumi';
import PickerEvent from './picker-event';

function createEventManager(
  datepicker: SnowDatePicker,
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
      const pickerEvent = new PickerEvent({ ...eventProps, datepicker });

      return listeners.map((listener) => {
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
