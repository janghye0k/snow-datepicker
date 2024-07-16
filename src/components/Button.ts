import { cn } from '@/helpers/selectors';
import type { ButtonOptions, ButtonPresetType } from '@t/options';
import { capitalize, create$, forEach, isObject, on } from 'doumi';
import Components, { DefaultProps } from './Components';

export type ButtonProps = DefaultProps & {
  buttonOption: ButtonPresetType | ButtonOptions;
};

class Button extends Components<ButtonProps> {
  declare buttonOption: ButtonProps['buttonOption'];
  declare onClick: (...args: any) => any;

  render(): void {
    let $el: HTMLButtonElement;
    if (isObject(this.buttonOption)) {
      const { id, className, innerHTML, style, dataset, attrs, onClick } =
        this.buttonOption;
      $el = create$('button', { id, className, innerHTML, dataset, style });
      if (attrs) {
        forEach(attrs, (value, key) => $el.setAttribute(key, value));
      }
      if (onClick) this.onClick = (e: MouseEvent) => onClick(e, this.dp);
    } else {
      this.onClick =
        this.buttonOption === 'clear'
          ? () => this.dp.setSelectedDate(null)
          : () => this.dp.setSelectedDate(new Date());
      $el = create$('button', {
        className: cn('button'),
        innerHTML: capitalize(this.buttonOption),
      });
    }

    const $origin = this.$el;
    this.$el = $el;
    $origin.replaceWith($el);
  }

  bindEvents(): void {
    on(this.$el, 'click', this.onClick);
  }
}

export default Button;
