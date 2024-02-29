import PickerEvent from '@/events/picker-event';
import { View } from './options';
import { CellType } from '@/components/Cell';

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

export type PickerDateEvent = PickerEvent & {
  readonly date: Date;
  readonly prevDate: Date;
};

export type PickerViewEvent = PickerEvent & {
  readonly view: View;
  readonly prevView: View;
};

export type PickerCellEvent = PickerEvent & {
  readonly type: CellType;
  readonly date: Date;
  readonly $element: HTMLButtonElement;
};

export type PickerClickEvent = PickerCellEvent & {
  readonly nativeEvent: MouseEvent;
};

export type PickerEventMap = {
  changeView: PickerViewEvent;
  changeViewDate: PickerDateEvent;
  clickCell: PickerClickEvent;
  renderCell: PickerCellEvent;
  beforeSelect: PickerDateEvent;
  select: PickerDateEvent;
  focus: PickerCellEvent;
  show: PickerEvent;
  hide: PickerEvent;
};

export type PickerRenderCellReturns = {
  className?: string;
  innerHTML?: string;
  attrs?: Record<string, string | number | boolean | undefined>;
  dataset?: Record<string, string | number | boolean | undefined>;
};

export type PickerEventListenerMap = {
  changeView: (event: PickerViewEvent) => void;
  changeViewDate: (event: PickerDateEvent) => void;
  clickCell: (event: PickerCellEvent) => void;
  renderCell: (event: PickerCellEvent) => PickerRenderCellReturns | void;
  beforeSelect: (event: PickerDateEvent) => void;
  select: (event: PickerDateEvent) => void;
  focus: (event: PickerCellEvent) => void;
  show: (event: PickerEvent) => void;
  hide: (event: PickerEvent) => void;
};

export type PickerEventProps = {
  [key: string]: any;
};
