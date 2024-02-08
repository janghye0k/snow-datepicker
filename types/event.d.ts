import type { Unit } from '@t/options';
import PickerEvent from '@/events/picker-event';

export type EventManager = {
  on: {
    (eventName: keyof PickerEventMap, listener: Function): void;
    (eventName: string, listener: Function): void;
  };
  off: {
    (eventName: keyof PickerEventMap, listener: Function): void;
    (eventName: string, listener: Function): void;
  };
  trigger: {
    (eventName: keyof PickerEventMap, pickerEvent: PickerEvent): void;
    (eventName: string, pickerEvent: PickerEvent): void;
  };
};

export type PickerEventMap = {
  show: PickerEvent;
  hide: PickerEvent;
  focus: PickerEvent;
  blur: PickerEvent;
  clickCell: PickerEvent;
  renderCell: PickerEvent;
  beforeSelect: PickerEvent;
  select: PickerEvent;
  changeUnit: PickerEvent;
  changeUnitDate: PickerEvent;
};

export type PickerEventProps = {
  [key: string]: any;
  event?: Event;
  date?: Date;
  prevDate?: Date | null;
  unit?: Unit;
  prevUnit?: Unit;
};
