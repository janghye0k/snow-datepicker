import { isArray } from 'doumi';
import PickerEvent from './picker-event';
import DatePicker from '@/index';
import type { EventManager } from '@t/event';

function createEventManager(datepicker: DatePicker): EventManager {
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

    trigger: (eventName: string, pickerEvent: PickerEvent) => {
      const listeners = listenerMap[eventName];
      if (!isArray(listeners)) return;
      listeners.forEach((listener) => {
        pickerEvent.setDatePicker(datepicker);
        listener(pickerEvent);
      });
    },
  };

  return manager;
}

export default createEventManager;
