import { BUTTON_PRESETS } from '@/helpers/consts';
import DatePicker from '@/index';
import { Locale } from '@t/locale';
import type { PickerEventListenerMap } from './event';

export type Position =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'right'
  | 'right-start'
  | 'right-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end';

export type DateLike = string | number | Date;

export type TitleFormat = {
  days: string;
  months: string;
  years: string;
};

export type View = 'days' | 'months' | 'years';

type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ButtonPresetType = ArrayElement<typeof BUTTON_PRESETS>;
export type ButtonOptions = {
  id?: string;
  className?: string;
  dataset?: Record<string, string>;
  attrs?: Record<string, string>;
  innerHTML?: string;
  onClick?: (event: MouseEvent, datepicker: DatePicker) => any;
};

export type InternalOptions = {
  /** Get the formatted date according to the string of tokens passed in. By default, `YYYY-MM-DD` */
  dateFormat?: string;
  /** If `true`, then clicking on the active cell will remove the selection from it. By default, `true` */
  toggleSelected: boolean;
  /** Enables keyboard navigation. By default, `true` */
  shortcuts: boolean;
  /** Position of the calendar relative to the input field. By default, `bottom-start` */
  position: Position;
  /** The initial view of the calendar. (e.g. `days` | `months` | `years`) By default, `days` */
  view: View;
  /** The minimum view of the calendar. The values are same as view. By default, `days` */
  minView: View;
  /** If `true`, dates from other months will be displayed in days view. By default, `true` */
  showOtherMonths: boolean;
  /** If `true`, it will be possible to select dates from other months. By default, `true` */
  selectOtherMonths: boolean;
  /**
   * If `true` , then selecting dates from another month will be causing transition to this month. By default, `true`
   */
  moveOtherMonths: boolean;
  /** Whether to enable navigation when the maximum/minimum date is exceeded. By default, `true` */
  navigationLoop: boolean;
  /** If `true`, the calendar will be hidden after selecting the date. By default, `true` */
  autoClose: boolean;
  /** Title templates in the calendar navigation. */
  titleFormat: TitleFormat;
  /** If `true`, it will not be able to edit dates at input field. */
  readOnly: boolean;
  /** If `true`, the calendar will open & close with animation */
  animation: boolean;
  /** The minimum date of calendar, Can't be set to less than `0100-01-01` */
  minDate: Date;
  /** The maximum date of calendar, Can't be set to more than `9999-12-31` */
  maxDate: Date;
  /** Makes the calendar to be permanently visible */
  inline: boolean;
  /** If, `dark`, datepicker's color scheme set to dark mode */
  theme: 'light' | 'dark';
  /** The active date */
  selectedDate?: Date;
  buttons?:
    | ButtonPresetType
    | ButtonPresetType[]
    | ButtonOptions
    | ButtonOptions[];
  /** Add custom classes. */
  className?: string;
  /** Language of the calendar. */
  locale?: Locale;
  /** Datepicker placeholder */
  placeHolder?: string;
  /** If `true`, calendar apper with backdrop */
  backdrop?: boolean;
  onShow?: PickerEventListenerMap['show'];
  onHide?: PickerEventListenerMap['hide'];
  onFocus?: PickerEventListenerMap['focus'];
  onClickCell?: PickerEventListenerMap['clickCell'];
  onRenderCell?: PickerEventListenerMap['renderCell'];
  onBeforeSelect?: PickerEventListenerMap['beforeSelect'];
  onSelect?: PickerEventListenerMap['select'];
  onChangeView?: PickerEventListenerMap['changeView'];
  onChangeViewDate?: PickerEventListenerMap['changeViewDate'];
};

export type Options = Partial<
  Omit<InternalOptions, 'titleFormat'> & {
    titleFormat: Partial<TitleFormat>;
  }
>;
