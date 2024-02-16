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
    (eventName: keyof PickerEventMap, eventProps: PickerEventProps): any;
    (eventName: string, eventProps: PickerEventProps): any;
    (eventName: keyof PickerEventMap, eventProps: PickerEvent): any;
    (eventName: string, eventProps: PickerEvent): any;
  };
};

export type PickerEventMap = {
  show: PickerEvent;
  hide: PickerEvent;
  focus: PickerEvent;
  clickCell: PickerEvent;
  renderCell: PickerEvent;
  beforeSelect: PickerEvent;
  select: PickerEvent;
  changeUnit: PickerEvent;
  changeUnitDate: PickerEvent;
};

export type PickerEventProps = {
  [key: string]: any;
};

export type PickerRenderCellReturns = {
  className?: string;
  innerHTML?: string;
  attrs?: Record<string, string | number | boolean | undefined>;
  dataset?: Record<string, string | number | boolean | undefined>;
};
