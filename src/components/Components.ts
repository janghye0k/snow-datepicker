import type { Instance } from '@t/instance';
import type { InternalOptions } from '@t/options';
import DatePicker from '@/index';

interface DefaultProps {
  dp: DatePicker;
  instance: Instance;
  options: InternalOptions;
}

class Components<T extends DefaultProps = DefaultProps> {
  dp: DatePicker;
  instance: Instance;
  options: InternalOptions;
  $el: Element;
  unsubscribers: Function[] = [];
  constructor(element: Element, { dp, instance, options }: T) {
    this.$el = element;
    this.dp = dp;
    this.instance = instance;
    this.options = options;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {}

  render() {}

  clear() {
    this.$el.innerHTML = '';
  }

  beforeDestroy() {}

  destroy() {
    this.beforeDestroy();
    this.unsubscribers.forEach((fn) => fn());
    this.$el.parentElement?.removeChild(this.$el);
  }
}

export type { DefaultProps };
export default Components;
