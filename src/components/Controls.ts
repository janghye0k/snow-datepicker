import { ChevronLeft, ChevronRight } from '@/icons';
import Components from './Components';
import { cn } from '@/helpers/selectors';
import { effect } from '@janghye0k/observable';
import { find$, findAll$, isUndefined, on } from 'doumi';

class Controls extends Components {
  render() {
    this.$el.innerHTML = /*html*/ `
      <button class="${cn('controls.btn')}" data-action="prev">
        ${ChevronLeft}
      </button>
      <span class="${cn('controls.title')}"></span>
      <button class="${cn('controls.btn')}" data-action="next">
        ${ChevronRight}
      </button>    
    `;
  }

  bindEvents(): void {
    const { store } = this.instance;
    const $title = find$('.' + cn('controls.title'), this.$el) as HTMLElement;

    // Trigger unit change when click title
    on($title, 'click', () => {
      const nextUnit = store.currentUnit === 'days' ? 'months' : 'years';
      store.setCurrentUnit(nextUnit);
    });

    // Trigger unit date change when click controls.btn
    findAll$('.' + cn('controls.btn'), this.$el).forEach(($el, index) => {
      on($el, 'click', (event) => {
        const { action } = event.currentTarget.dataset;
        const isPrev = isUndefined(action) ? !index : action === 'prev';
        this.dp[isPrev ? 'prev' : 'next']();
      });
    });
  }

  subscribe() {
    const { store, converter } = this.instance;
    const { titleFormat } = this.options;
    const $title = find$('.' + cn('controls.title'), this.$el) as HTMLElement;

    // subcribe auto re-render title listener
    this.unsubscribers.push(
      effect(() => {
        const { currentUnit, unitDate } = store;
        const format = titleFormat[currentUnit];
        $title.innerHTML = converter.format(unitDate, format);
      }, [store.state.viewState, true])
    );
  }
}

export default Controls;
