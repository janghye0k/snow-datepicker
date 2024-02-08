import { Locale } from './locale';

export type Position =
  | 'top-start'
  | 'top-end'
  | 'right-start'
  | 'right-end'
  | 'bottom-start'
  | 'bottom-end'
  | 'left-start'
  | 'left-end';

export type DateLike = string | number | Date;

export type TitleFormat = {
  days: string;
  months: string;
  years: string;
};

export type Unit = 'days' | 'months' | 'years';

export type InternalOptions = {
  /** Get the formatted date according to the string of tokens passed in. By default, `YYYY-MM-DD` */
  dateFormat: string;
  /** If `true`, then clicking on the active cell will remove the selection from it. By default, `true` */
  toggleSelected: boolean;
  /** Enables keyboard navigation. By default, `true` */
  shortcuts: boolean;
  /** Position of the calendar relative to the input field. By default, `bottom-start` */
  position: Position;
  /** The initial unit of the calendar. (e.g. `days` | `months` | `years`) By default, `days` */
  unit: Unit;
  /** The minimum unit of the calendar. The values are same as unit. By default, `days` */
  minUnit: Unit;
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
  /** If `false`, it will be able to edit dates at input field. */
  readOnly: boolean;
  /** The minimum date of calendar */
  minDate: DateLike;
  /** The maximum date of calendar */
  maxDate: DateLike;
  /** The active date */
  selectedDate: DateLike;
  buttons?: string | string[];
  /** Add custom classes. */
  className?: string;
  /** Language of the calendar. */
  locale?: Locale;
  onShow?: Function;
  onHide?: Function;
  onFocus?: Function;
  onBlur?: Function;
  onClickCell?: Function;
  onRenderCell?: Function;
  onBeforeSelect?: Function;
  onSelect?: Function;
  onChangeUnit?: Function;
  onChangeUnitDate?: Function;
};

export type Options = Partial<
  Omit<InternalOptions, 'titleFormat'> & {
    titleFormat: Partial<TitleFormat>;
  }
>;
