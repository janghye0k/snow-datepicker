import type { PickerRenderCellReturns } from '@t/event';
import { decade, parseDate } from '@/helpers/util';
import { cn } from '@/helpers/selectors';
import Components, { DefaultProps } from './Components';
import { between, create$, entries, isPlainObject, isString, on } from 'doumi';

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
    const parsed = parseDate(this.date);
    return parseDate(selectedDate)
      .slice(0, typeCompareLengthMap[this.type])
      .every((item, idx) => item === parsed[idx]);
  }

  isToday() {
    const length = typeCompareLengthMap[this.type];
    const todays = parseDate().slice(0, length);
    const parsed = parseDate(this.date).slice(0, length);
    return todays.every((item, idx) => item === parsed[idx]);
  }

  render() {
    const { unitDate } = this.instance.store;
    const { minDate, maxDate } = this.options;
    const length = typeCompareLengthMap[this.type];
    const parsed = parseDate(this.date).slice(0, length);
    const [year, monthindex, day] = parsed;
    const unitMonth = unitDate.getMonth();

    const isActive = this.isActive();

    // Make classList
    const classList = [cn('cell'), `--${this.type}`];
    if (this.isToday()) classList.push('--today');
    if (isActive) classList.push('--active');

    if (this.type === 'day') {
      const isOtherMonth = monthindex !== unitMonth;
      const isHidden = isOtherMonth && this.options.showOtherMonths === false;
      const isDisabled =
        isOtherMonth && this.options.selectOtherMonths === false;
      if (isOtherMonth) classList.push('--other');
      if (isHidden) classList.push('--hidden');
      if (isDisabled) classList.push('--disabled');
    }
    if (this.type === 'year') {
      const [std, end] = decade(unitDate);
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
  }

  private handleSelectCell() {
    const { currentUnit } = this.instance.store;

    const nextUnit = this.type === 'year' ? 'months' : 'days';
    if (currentUnit !== nextUnit) this.dp.setCurrentUnit(nextUnit);

    const date = this.date;
    const isEndUnit = this.type + 's' === this.options.minUnit;
    const isUnSelect =
      isEndUnit && this.isActive() && this.options.toggleSelected;
    this.dp.setSelectedDate(isUnSelect ? null : date);
    if (currentUnit !== 'days' || this.options.moveOtherMonths) {
      this.dp.setUnitDate(date);
    }

    if (this.options.autoClose && isEndUnit) this.dp.hide();
  }

  private handleClickCell(event: MouseEvent) {
    const { type, date, $el: $element } = this;
    const eventProps: Record<string, any> = { event, type, date, $element };
    if (type === 'day') eventProps.dayIndex = this.date.getDay();
    this.eventManager.trigger('clickCell', eventProps);
  }
}

export default Cell;
