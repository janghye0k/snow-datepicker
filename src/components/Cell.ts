import { parseDate } from '@/helpers/util';
import Components, { DefaultProps } from './Components';
import { cn } from '@/helpers/selectors';
import { create$ } from 'doumi';

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
  type: CellType = 'day';
  date: Date = new Date();

  isToday() {
    const length = typeCompareLengthMap[this.type];
    const todays = parseDate().slice(0, length);
    const parsed = parseDate(this.date).slice(0, length);
    return todays.every((item, idx) => item === parsed[idx]);
  }

  render() {
    const { unitDate, selectedDate } = this.instance.store;
    const length = typeCompareLengthMap[this.type];
    const parsed = parseDate(this.date).slice(0, length);
    const [year, monthindex, day] = parsed;
    const selectedParsed = parseDate(selectedDate).slice(0, length);
    const unitMonth = unitDate.getMonth();

    const isActive = selectedParsed.every((item, idx) => item === parsed[idx]);

    const classList = [cn('cell'), `--${this.type}`];
    if (this.isToday()) classList.push('--today');
    if (isActive) classList.push('--active');
    if (this.type === 'day') {
      const isOtherMonth = monthindex !== unitMonth;
      const isHidden = isOtherMonth && this.options.showOtherMonths === false;
      const isDisabled =
        isOtherMonth && this.options.selectOtherMonths === false;
      if (isOtherMonth) classList.push('--ohter');
      if (isHidden) classList.push('--hidden');
      if (isDisabled) classList.push('--disabled');
    }

    this.$el.outerHTML = create$('div', {
      classList,
      dataset: { year, monthindex, day },
      innerHTML: `${parsed[length - 1] + (this.type === 'month' ? 1 : 0)}`,
    }).outerHTML;
  }
}

export default Cell;
