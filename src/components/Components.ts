import type { Instance } from '@t/instance';
import type { InternalOptions } from '@t/options';
import type { EventManager } from '@t/event';
import SnowDatePicker from '@/index';
import { assign } from 'doumi';

interface DefaultProps {
  dp: SnowDatePicker;
  instance: Instance;
  options: InternalOptions;
  eventManager: EventManager;
}

class Components<T extends DefaultProps = DefaultProps> {
  dp: SnowDatePicker;
  instance: Instance;
  options: InternalOptions;
  $el: Element;
  eventManager: EventManager;
  unsubscribers: Function[] = [];
  [key: string]: any;
  constructor(
    element: Element,
    { dp, instance, options, eventManager, ...props }: T
  ) {
    this.$el = element;
    this.dp = dp;
    this.instance = instance;
    this.options = options;
    this.eventManager = eventManager;
    this.assignProps(props);
    this.beforeInit();
    this.init();
  }

  beforeInit() {}

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
    this.$el.remove();
  }
}

export type { DefaultProps };
export default Components;
