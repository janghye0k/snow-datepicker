import { cn } from '@/helpers/selectors';
import { decade, getCalendarDates, parseDate } from '@/helpers/util';
import { effect } from '@janghye0k/observable';
import { create$, findAll$, isArray, on, range } from 'doumi';
import Cell, { CellType } from './Cell';
import Components from './Components';

class Content extends Components {
  cells: Cell[] = [];

  subscribe(): void {
    const { store } = this.instance;

    this.unsubscribers.push(
      effect(
        (state) => {
          this.$el.className = [cn('content'), `--${state}`].join(' ');
        },
        [store.state.currentView, true]
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
      }, [store.state.date, true]),

      effect(
        (focusDate) => {
          const [year, monthindex, day] = parseDate(focusDate);

          const currentView = store.currentView;
          const comapre = (date: Date) => {
            let isSame = true;
            isSame = isSame && date.getFullYear() === year;
            if (currentView === 'years') return isSame;
            isSame = isSame && date.getMonth() === monthindex;
            if (currentView === 'months') return isSame;
            return isSame && date.getDate() === day;
          };

          const $cells = findAll$('.' + cn('cell'), this.$el);
          $cells.forEach(($cell) => {
            $cell.classList.remove('--focus');
            const { date, type } = ($cell as any).dpCell as Cell;
            const isFocus = comapre(date);
            if (isFocus) {
              $cell.focus(), $cell.classList.add('--focus');
              const eventProps = {
                $element: $cell,
                type,
                date,
              };
              this.eventManager.trigger('focus', eventProps);
            }
          });
        },
        [store.state.focusDate]
      )
    );
  }

  bindEvents(): void {
    on(this.$el, 'mouseleave', () => this.instance.store.state.focusDate(null));
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
    const { viewDate, currentView } = store;

    switch (currentView) {
      case 'days':
        return getCalendarDates(viewDate, converter.locale.weekStart);
      case 'months':
        // eslint-disable-next-line
        const year = viewDate.getFullYear();
        return range(12).map((idx) => new Date(year, idx, 1, 12));
      case 'years':
        return range(decade(viewDate)[0] - 1, 12).map(
          (year) => new Date(year, 0, 1, 12)
        );
    }
  }

  render(): void {
    this.$el.role = 'grid';
  }

  renderCells() {
    const { instance, options, dp, eventManager } = this;
    const type = instance.store.currentView.slice(0, -1) as CellType;
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
