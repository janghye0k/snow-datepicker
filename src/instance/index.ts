import type { InternalOptions } from '@t/options';
import type { Instance } from '@t/instance';
import { createStore } from './store';
import { craeteConverter } from './converter';

function createInstance(options: InternalOptions): Instance {
  const { minUnit, locale, dateFormat } = options;
  const converter = craeteConverter({ locale, dateFormat });
  const store = createStore({ minUnit });

  const instance: Instance = { converter, store };
  return instance;
}

export default createInstance;
