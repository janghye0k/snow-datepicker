import type { DateLike, InternalOptions, Unit } from '@t/options';
import type { Store } from '@t/instance';
import { observable } from '@janghye0k/observable';
import { isDateLike, isNullish } from 'doumi';
import { UNIT_ORDER, checkUnit, isUnit } from '@/helpers/schema';
import { decade, parseDate } from '@/helpers/util';

type Params = Pick<InternalOptions, 'minUnit'>;

export function createStore({ minUnit }: Params): Store {
  const date = observable<Date | null | undefined>(null);
  const currentUnit = observable<Unit>(minUnit || 'days');
  const unitDate = observable(new Date());
  const viewState = observable(() => {
    const ud = unitDate();
    const cu = currentUnit();
    let args = parseDate(ud).slice(0, 3 - UNIT_ORDER[cu]);
    args = args.length ? args : decade(ud);
    return `${cu}__${args.join('__')}`;
  });

  const store: Store = {
    state: {
      date,
      currentUnit,
      unitDate,
      viewState,
    },
    get currentUnit(): Unit {
      return currentUnit();
    },
    get unitDate(): Date {
      return unitDate();
    },
    get selectedDate(): Date | null {
      const selectedDate = date();
      return isNullish(selectedDate) ? null : new Date(selectedDate);
    },
    setSelectedDate: (value: any): void => {
      date(!isDateLike(value) ? null : new Date(value));
    },
    setCurrentUnit: (value: Unit): void => {
      let nextUnit = isUnit(value) ? value : minUnit;
      if (!checkUnit(value, minUnit)) nextUnit = minUnit;
      currentUnit(nextUnit);
    },
    setUnitDate: (value: DateLike): void => {
      if (!isDateLike(value))
        return console.log(`This unitDate is invalid date - ${value}`);
      unitDate(new Date(value));
    },
    addUnitDate: (adder: number, options = {}) => {
      const { unit = currentUnit(), date = unitDate() } = options;
      const [year, month] = parseDate(date);
      switch (unit) {
        case 'days':
          return unitDate(new Date(year, month + adder));
        case 'months':
          return unitDate(new Date(year + adder, month));
        case 'years':
          return unitDate(new Date(year + adder * 10, month));
      }
    },
  };

  return store;
}
