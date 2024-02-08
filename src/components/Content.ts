import { cn } from '@/helpers/selectors';
import Components from './Components';

class Content extends Components {
  render(): void {
    this.$el.innerHTML = /*html*/ `
      <div class="${cn('content')}">
        <div class="${cn('days')}">
          <div class="${cn('days.weekdays')}"></div>
          <div class="${cn('days.views')}"></div>
        </div>
        <div class="${cn('months')}"></div>
        <div class="${cn('years')}"></div>
      </div>
    `;
  }
}

export default Content;
