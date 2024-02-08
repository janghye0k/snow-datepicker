import { cn } from '@/helpers/selectors';
import Components from './Components';
import { effect } from '@janghye0k/observable';
import { create$, isNull } from 'doumi';
import { parseDate } from '@/helpers/util';

class Content extends Components {
  subscribe(): void {
    const { store } = this.instance;
    const unsub = effect(
      (state) => {
        this.$el.className = [cn('content'), `--${state}`].join(' ');
      },
      [store.state.currentUnit, true]
    );

    this.unsubscribers.push(unsub);
  }

  generateWeekDays() {
    const {
      locale: { weekdaysMin },
      weekIndexes,
    } = this.instance.converter;
    weekIndexes.map((index: number) =>
      create$('div', {
        className: cn('weekday'),
        dataset: { dayindex: index },
        innerHTML: weekdaysMin[index],
      })
    );
  }

  generateDays() {
    const { store, converter } = this.instance;
    const { unitDate, selectedDate } = store;
    const [year, month] = parseDate(unitDate);

    const firstDate = new Date(year, month, 1);
    const lastDate = new Date(year, month + 1, 0);
    const firstDateDay = firstDate.getDay();
    const lastDateDay = lastDate.getDay();

    const { weekStart = 0 } = converter.locale;
    const preDays =
      (firstDateDay + 7 - weekStart) % 7 || (lastDate.getDate() === 28 ? 7 : 0);
    const postDays = 6 - lastDateDay;

    const days: { d: number; m: number }[] = [];
    const displayPrevStart = new Date(year, month, 0).getDate() - preDays + 1;

    const pushData = (length: number, m: number, adder: number = 1) =>
      Array.from({ length }, (_, i) => days.push({ d: adder + i, m }));
    pushData(preDays, month - 1, displayPrevStart);
    pushData(lastDate.getDate(), month);
    pushData(postDays, (month + 1) % 12);

    const selected = { month: -1, day: -1 };
    if (!isNull(selectedDate)) {
      selected.day = selectedDate.getDate();
      selected.month = selectedDate.getMonth();
    }
    const todays = parseDate();

    // Render days
    days.forEach(({ d, m }) => {
      const isOtherMonth = m !== month;
      const isSelectable = !isOtherMonth || this.options.selectOtherMonths;
      const isHidden = isOtherMonth && !this.options.showOtherMonths;

      const classList = [cn('cell')];
      if (isOtherMonth) classList.push('other');
      if (selected.day === d && selected.month === m) classList.push('active');
      if (todays[0] === year && todays[1] === m && todays[2] === d)
        classList.push('today');

      const $day = create$('div', {
        classList,
        dataset: { year, monthindex: m, day: d },
        innerHTML: `${d}`,
      });
      if (isHidden) $day.setAttribute('hidden', '');

      this.$el.appendChild($day);
      if (isSelectable) false; // bindevents
    });
  }
}

export default Content;
