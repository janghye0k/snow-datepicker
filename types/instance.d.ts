import type { Observable } from '@janghye0k/observable';
import type { DateLike, View } from '@t/options';
import type { Locale } from '@t/locale';

export type Instance = {
  converter: Converter;
  store: Store;
};

export type Store = {
  state: {
    date: Observable<Date | null | undefined>;
    currentView: Observable<View>;
    viewDate: Observable<Date>;
    focusDate: Observable<Date | null>;
    viewState: Observable<string>;
  };
  readonly currentView: View;
  readonly viewDate: Date;
  readonly selectedDate: Date | null;
  setSelectedDate: (date: any) => void;
  setCurrentView: (date: View) => void;
  setViewDate: (date: DateLike) => void;
};

export type Converter = {
  readonly locale: Locale;
  readonly weekIndexes: number[];
  format(value: DateLike, format: string): string;
  time: (value: DateLike) => string;
  date: (value: DateLike) => string;
  localeMonth: (monthIndex: number, short?: boolean) => string;
  localeWeekday: (weekdayIndex: number, options?: 'short' | 'min') => string;
};
