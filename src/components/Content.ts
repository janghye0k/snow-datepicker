import { cn } from '@/helpers/selectors';
import Components from './Components';
import { effect } from '@janghye0k/observable';
import { create$, isArray, range } from 'doumi';
import { decade, getCalendarDates } from '@/helpers/util';
import Cell, { CellType } from './Cell';

class Content extends Components {
  cells: Cell[] = [];

  subscribe(): void {
    const { store } = this.instance;
    const unsub1 = effect(
      (state) => {
        this.$el.className = [cn('content'), `--${state}`].join(' ');
      },
      [store.state.currentUnit, true]
    );

    const unsub2 = effect(() => {
      this.renderCells();
    }, [store.state.viewState, true]);

    this.unsubscribers.push(unsub1, unsub2);
  }

  private generateWeekDays() {
    const {
      locale: { weekdaysMin },
      weekIndexes,
    } = this.instance.converter;
    return weekIndexes.map((index: number) =>
      create$('div', {
        className: cn('weekday'),
        dataset: { dayindex: index },
        innerHTML: weekdaysMin[index],
      })
    );
  }

  private generateDates() {
    const { store, converter } = this.instance;
    const { unitDate, currentUnit } = store;

    switch (currentUnit) {
      case 'days':
        return getCalendarDates(unitDate, converter.locale.weekStart);
      case 'months':
        // eslint-disable-next-line
        const year = unitDate.getFullYear();
        return range(12).map((idx) => new Date(year, idx, 1, 12));
      case 'years':
        return range(decade(unitDate)[0] - 1, 12).map(
          (year) => new Date(year, 0, 1, 12)
        );
    }
  }

  renderCells() {
    const { instance, options, dp } = this;
    const type = instance.store.currentUnit.slice(0, -1) as CellType;
    const dates = this.generateDates();

    if (!isArray(this.cells)) this.cells = [];
    this.cells.forEach((cell) => cell.destroy());
    this.$el.innerHTML = '';

    if (type === 'day') {
      const $weekdays = this.generateWeekDays();
      this.$el.replaceChildren(...$weekdays);
    }

    dates.forEach((date) => {
      const $cell = create$('div');
      this.$el.appendChild($cell);
      new Cell($cell, { type, date, dp, instance, options });
    });
  }
}

export default Content;
