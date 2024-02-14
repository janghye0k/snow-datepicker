import type { Instance } from '@t/instance';
import type { InternalOptions } from '@t/options';
import DatePicker from '@/index';
import { assign } from 'doumi';

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
  constructor(element: Element, { dp, instance, options, ...props }: T) {
    this.$el = element;
    this.dp = dp;
    this.instance = instance;
    this.options = options;
    this.assignProps(props);
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.subscribe();
  }

  bindEvents() {}

  render() {}

  subscribe() {}

  beforeDestroy() {}

  assignProps(props: Record<string, any>) {
    assign(this, props);
  }

  destroy() {
    this.beforeDestroy();
    this.unsubscribers.forEach((fn) => fn());
  }
}

export type { DefaultProps };
export default Components;
