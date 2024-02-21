import { cn } from '@/helpers/selectors';
import { effect } from '@janghye0k/observable';
import { create$, findAll$, isArray, range } from 'doumi';
import { decade, getCalendarDates } from '@/helpers/util';
import Components from './Components';
import Cell, { CellType } from './Cell';

class Content extends Components {
  cells: Cell[] = [];

  subscribe(): void {
    const { store } = this.instance;

    this.unsubscribers.push(
      effect(
        (state) => {
          this.$el.className = [cn('content'), `--${state}`].join(' ');
        },
        [store.state.currentUnit, true]
      ),

      effect(() => {
        this.renderCells();
      }, [store.state.viewState, true]),

      effect(() => {
        const $cells = findAll$('.' + cn('cell'), this.$el);
        $cells.forEach(($cell) => {
          const cell = ($cell as any).dpCell as Cell;
          if (cell.isActive()) {
            $cell.classList.add('--active');
            $cell.tabIndex = 0;
          } else {
            $cell.classList.remove('--active');
            $cell.tabIndex = -1;
          }
        });
      }, [store.state.date, true])
    );
  }

  private generateWeekDays() {
    const {
      locale: { weekdaysMin },
      weekIndexes,
    } = this.instance.converter;
    return weekIndexes.map((index: number) => {
      const $weekday = create$('div', {
        role: 'gridcell',
        className: cn('weekday'),
        dataset: { dayindex: index },
        innerHTML: weekdaysMin[index],
      });
      return $weekday;
    });
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

  render(): void {
    this.$el.role = 'grid';
  }

  renderCells() {
    const { instance, options, dp, eventManager } = this;
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
      const $cell = create$('button');
      this.$el.appendChild($cell);
      new Cell($cell, { type, date, dp, instance, options, eventManager });
    });
  }
}

export default Content;
