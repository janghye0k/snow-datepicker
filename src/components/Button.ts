import type { ButtonOptions, ButtonPresetType } from '@t/options';
import Components, { DefaultProps } from './Components';
import { capitalize, create$, forEach, isObject, on } from 'doumi';
import { cn } from '@/helpers/selectors';

export type ButtonProps = DefaultProps & {
  buttonOption: ButtonPresetType | ButtonOptions;
};

class Button extends Components<ButtonProps> {
  $el!: HTMLElement;
  buttonOption!: ButtonProps['buttonOption'];

  render(): void {
    let $el: HTMLButtonElement;
    if (isObject(this.buttonOption)) {
      const { id, className, innerHTML, dataset, attrs, onClick } =
        this.buttonOption;
      const classList = [cn('button')];
      if (className) classList.push(className);
      $el = create$('button', { id, classList, innerHTML, dataset });
      if (attrs) {
        forEach(attrs, (value, key) => $el.setAttribute(key, value));
      }
      if (onClick) {
        on($el, 'click', (event) => onClick(event, this.dp));
      }
    } else {
      const onclick =
        this.buttonOption === 'clear'
          ? () => this.dp.setSelectedDate(null)
          : () => this.dp.setSelectedDate(new Date());
      $el = create$('button', {
        className: cn('button'),
        innerHTML: capitalize(this.buttonOption),
        onclick,
      });
    }

    const $origin = this.$el;
    this.$el = $el;
    $origin.replaceWith($el);
  }
}

export default Button;
