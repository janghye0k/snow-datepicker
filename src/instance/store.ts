import { VIEW_ORDER } from '@/helpers/consts';
import { checkView, isView } from '@/helpers/schema';
import { decade, parseDate } from '@/helpers/util';
import { observable } from '@janghye0k/observable';
import type { Store } from '@t/instance';
import type { DateLike, InternalOptions, View } from '@t/options';
import { isDateLike, isNullish } from 'doumi';

type Params = Pick<InternalOptions, 'minView'>;

export function createStore({ minView }: Params): Store {
  const date = observable<Date | null | undefined>(null);
  const currentView = observable<View>(minView || 'days');
  const viewDate = observable(new Date());
  const focusDate = observable<Date | null>(null);
  const viewState = observable(() => {
    const ud = viewDate();
    const cu = currentView();
    let args = parseDate(ud).slice(0, 3 - VIEW_ORDER[cu]);
    args = args.length ? args : decade(ud);
    return `${cu}__${args.join('__')}`;
  });

  const store: Store = {
    state: {
      date,
      currentView,
      viewDate,
      focusDate,
      viewState,
    },
    get currentView(): View {
      return currentView();
    },
    get viewDate(): Date {
      return viewDate();
    },
    get selectedDate(): Date | null {
      const selectedDate = date();
      return isNullish(selectedDate) ? null : new Date(selectedDate);
    },
    setSelectedDate: (value: any): void => {
      date(!isDateLike(value) ? null : new Date(value));
    },
    setCurrentView: (value: View): void => {
      let nextView = isView(value) ? value : minView;
      if (!checkView(value, minView)) nextView = minView;
      currentView(nextView);
    },
    setViewDate: (value: DateLike): void => {
      if (!isDateLike(value))
        return console.log(`This viewDate is invalid date - ${value}`);
      viewDate(new Date(value));
    },
  };

  return store;
}
