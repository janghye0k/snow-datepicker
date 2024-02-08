import type { Observable } from '@janghye0k/observable';
import type { DateLike, Unit } from '@t/options';
import type { Locale } from '@t/locale';

export type Instance = {
  converter: Converter;
  store: Store;
};

export type Store = {
  state: {
    date: Observable<Date | null | undefined>;
    currentUnit: Observable<Unit>;
    unitDate: Observable<Date>;
    viewState: Observable<string>;
  };
  readonly currentUnit: Unit;
  readonly unitDate: Date;
  readonly selectedDate: Date | null;
  setSelectedDate: (date: any) => void;
  setCurrentUnit: (date: Unit) => void;
  setUnitDate: (date: DateLike) => void;
  addUnitDate: (adder: number, options?: { date?: Date; unit?: Unit }) => void;
};

export type Converter = {
  readonly locale: Locale;
  readonly weekIndexes: number[];
  format(value: DateLike, format: string): string;
  time: (value: DateLike) => string;
  date: (value: DateLike) => string;
};
