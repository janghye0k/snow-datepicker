import type { PickerRenderCellReturns } from '@t/event';
import { decade, parseDate } from '@/helpers/util';
import { cn } from '@/helpers/selectors';
import Components, { DefaultProps } from './Components';
import {
  between,
  create$,
  entries,
  isNull,
  isPlainObject,
  isString,
  on,
} from 'doumi';
import type { View } from '@t/options';

export type CellType = 'day' | 'month' | 'year';

interface CellProps extends DefaultProps {
  type: CellType;
  date: Date;
}

const typeCompareLengthMap = {
  day: 3,
  month: 2,
  year: 1,
};

class Cell extends Components<CellProps> {
  type!: CellType;
  date!: Date;
  $el!: HTMLElement;

  isActive() {
    const { selectedDate } = this.instance.store;
    return (
      !isNull(selectedDate) &&
      this.dp.isSameDate(this.date, selectedDate, (this.type + 's') as View)
    );
  }

  isFocus() {
    const { focusDate } = this.dp;
    return (
      !isNull(focusDate) &&
      this.dp.isSameDate(this.date, focusDate, (this.type + 's') as View)
    );
  }

  isToday() {
    return this.dp.isSameDate(this.date, new Date(), (this.type + 's') as View);
  }

  render() {
    const { viewDate } = this.instance.store;
    const { minDate, maxDate } = this.options;
    const length = typeCompareLengthMap[this.type];
    const parsed = parseDate(this.date).slice(0, length);
    const [year, monthindex, day] = parsed;
    const viewMonth = viewDate.getMonth();

    const isActive = this.isActive();

    // Make classList
    const classList = [cn('cell'), `--${this.type}`];
    if (this.isToday()) classList.push('--today');
    if (isActive) classList.push('--active');
    if (this.isFocus()) classList.push('--focus');

    if (this.type === 'day') {
      const isOtherMonth = monthindex !== viewMonth;
      const isHidden = isOtherMonth && this.options.showOtherMonths === false;
      const isDisabled =
        isOtherMonth && this.options.selectOtherMonths === false;
      if (isOtherMonth) classList.push('--other');
      if (isHidden) classList.push('--hidden');
      if (isDisabled) classList.push('--disabled');
    }
    if (this.type === 'year') {
      const [std, end] = decade(viewDate);
      if (!between(year, std, end)) classList.push('--other');
    }

    const N = Number;
    const isOver = !between(N(this.date), N(minDate), N(maxDate));
    if (isOver) classList.push('--disabled');

    // Create element
    const $el = create$('button', {
      classList,
      role: 'gridcell',
      tabIndex: isActive ? 0 : -1,
      dataset: { year, monthindex, day },
      innerHTML: `${parsed[length - 1] + (this.type === 'month' ? 1 : 0)}`,
    });
    if (this.type === 'day' && this.date.getDay() === 0)
      $el.classList.add('--dayoff');

    // Trigger event
    const eventProps = { date: this.date, type: this.type };
    const results: PickerRenderCellReturns[] = [];
    (this.eventManager.trigger('renderCell', eventProps) ?? []).forEach(
      (result: any) => {
        if (isPlainObject(result)) results.push(result as any);
      }
    );
    results.forEach(({ className, innerHTML, dataset, attrs }) => {
      if (isString(className) && className) $el.classList.add(className);
      if (isString(innerHTML) && innerHTML) $el.innerHTML = innerHTML;
      if (isPlainObject(dataset))
        entries(dataset).forEach(
          ([value, key]) => ($el.dataset[key] = `${value}`)
        );
      if (isPlainObject(attrs)) {
        entries(attrs).forEach(([value, key]) =>
          $el.setAttribute(key, `${value}`)
        );
      }
    });

    // Replace element
    const $origin = this.$el;
    this.$el = $el;
    $origin.replaceWith(this.$el);
    (this.$el as any).dpCell = this;
  }

  bindEvents(): void {
    on(this.$el as HTMLElement, 'click', () => this.handleSelectCell());
    on(this.$el, 'click', (evt) => this.handleClickCell(evt));
    on(this.$el, 'mouseenter', () => this.handleMouseEnter());
  }

  private handleMouseEnter() {
    this.instance.store.state.focusDate(this.date);
  }

  private handleSelectCell() {
    const { currentView } = this.instance.store;

    const nextView = this.type === 'year' ? 'months' : 'days';
    if (currentView !== nextView) this.dp.setCurrentView(nextView);

    const date = this.date;
    const isEndView = this.type + 's' === this.options.minView;
    if (isEndView) {
      const isUnSelect = this.isActive() && this.options.toggleSelected;
      this.dp.setSelectedDate(isUnSelect ? null : date);
      if (this.options.autoClose) this.dp.hide();
    }
    if (currentView !== 'days' || this.options.moveOtherMonths) {
      this.dp.setViewDate(date);
    }
  }

  private handleClickCell(event: MouseEvent) {
    const { type, date, $el: $element } = this;
    const eventProps: Record<string, any> = { event, type, date, $element };
    if (type === 'day') eventProps.dayIndex = this.date.getDay();
    this.eventManager.trigger('clickCell', eventProps);
  }
}

export default Cell;
