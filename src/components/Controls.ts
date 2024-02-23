import { ChevronLeft, ChevronRight } from '@/icons';
import Components from './Components';
import { cn } from '@/helpers/selectors';
import { effect } from '@janghye0k/observable';
import { create$, on } from 'doumi';
import { View } from '@t/options';
import { decade, parseDate } from '@/helpers/util';

class Controls extends Components {
  declare $title: HTMLElement;
  declare $prevBtn: HTMLButtonElement;
  declare $nextBtn: HTMLButtonElement;

  render() {
    this.$el.role = 'navigation';
    this.$prevBtn = create$('button', {
      className: cn('controlsBtn'),
      dataset: { action: 'prev' },
      innerHTML: ChevronLeft,
    });
    this.$nextBtn = create$('button', {
      className: cn('controlsBtn'),
      dataset: { action: 'next' },
      innerHTML: ChevronRight,
    });
    this.$title = create$('span', { className: cn('controlsTitle') });
    this.$el.innerHTML = '';
    this.$el.replaceChildren(this.$prevBtn, this.$title, this.$nextBtn);
  }

  bindEvents(): void {
    const { store } = this.instance;

    // Trigger view change when click title
    on(this.$title, 'click', () => {
      const nextView = store.currentView === 'days' ? 'months' : 'years';
      store.setCurrentView(nextView);
    });

    // Trigger view date change when click controlsBtn
    on(this.$prevBtn, 'click', (e) => {
      e.preventDefault();
      this.dp.prev(), this.dp.setFocusDate(null);
    });
    on(this.$nextBtn, 'click', (e) => {
      e.preventDefault();
      this.dp.next(), this.dp.setFocusDate(null);
    });
    [this.$prevBtn, this.$nextBtn].forEach(($el) => {
      on($el, 'keydown', (evt) => evt.key === 'Enter' && $el.click());
      on($el, 'focus', () => this.instance.store.state.focusDate(null));
    });
  }

  subscribe() {
    const { store, converter } = this.instance;
    const { titleFormat, minDate, maxDate } = this.options;

    const parsed = { min: parseDate(minDate), max: parseDate(maxDate) };
    const decades = { min: decade(minDate), max: decade(maxDate) };

    const btnHideCheckMap = {
      days: (year: number, monthindex: number) => {
        if (year <= parsed.min[0] && monthindex - 1 < parsed.min[1]) {
          this.$prevBtn.disabled = true;
        } else if (year >= parsed.max[0] && monthindex + 1 > parsed.max[1]) {
          this.$nextBtn.disabled = true;
        }
      },
      months: (year: number) => {
        if (year <= parsed.min[0]) {
          this.$prevBtn.disabled = true;
        } else if (year >= parsed.max[0]) {
          this.$nextBtn.disabled = true;
        }
      },
      years: (year: number) => {
        if (year <= decades.min[0]) {
          this.$prevBtn.disabled = true;
        } else if (year >= decades.max[1]) {
          this.$nextBtn.disabled = true;
        }
      },
    };

    this.unsubscribers.push(
      effect(
        (state) => {
          const [currentView, year, monthindex] = state.split('__');

          // Auto re-render title
          const format = titleFormat[currentView as View];
          this.$title.innerHTML = converter.format(this.dp.viewDate, format);

          // Hide control button when the maximum/minimum date is exceeded
          if (!this.options.navigationLoop) {
            this.$prevBtn.disabled = false;
            this.$nextBtn.disabled = false;
            btnHideCheckMap[currentView as View](
              Number(year),
              Number(monthindex)
            );
          }
        },
        [store.state.viewState, true]
      )
    );
  }
}

export default Controls;
