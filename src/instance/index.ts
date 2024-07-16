import type { Instance } from '@t/instance';
import type { InternalOptions } from '@t/options';
import { craeteConverter } from './converter';
import { createStore } from './store';

function createInstance(options: InternalOptions): Instance {
  const { minView, locale, dateFormat } = options;
  const converter = craeteConverter({ locale, dateFormat });
  const store = createStore({ minView });

  const instance: Instance = { converter, store };
  return instance;
}

export default createInstance;
