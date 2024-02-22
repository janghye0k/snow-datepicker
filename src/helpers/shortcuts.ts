import { UNIT_LIST } from '@/helpers/consts';
import { between, find$, type Evt } from 'doumi';
import DatePicker from '..';
import { decade, parseDate } from '@/helpers/util';
import { cn } from '@/helpers/selectors';

const ADDER_MAP = {
  days: {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowDown: 7,
    ArrowUp: -7,
  },
  months: {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowDown: 3,
    ArrowUp: -3,
  },
  years: {
    ArrowLeft: -1,
    ArrowRight: 1,
    ArrowDown: 4,
    ArrowUp: -4,
  },
};
const ADD_IDX_MAP = {
  days: 2 as const,
  months: 1 as const,
  years: 0 as const,
};

const AVAILABLE_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

const isArrowKey = (
  key: string
): key is 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' =>
  AVAILABLE_KEYS.includes(key);

export function createShortcutsHandler(dp: DatePicker) {
  const handleShrotchust = (event: Evt<'keydown'>) => {
    const { ctrlKey, shiftKey, altKey, key } = event;
    if (key === 'Escape') {
      event.preventDefault();
      return dp.hide();
    }

    if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      event.stopPropagation();
      const adder = event.key === 'PageUp' ? 1 : -1;
      const nextIdx =
        UNIT_LIST.findIndex((item) => item === dp.currentUnit) + adder;
      if (between(nextIdx, 0, 2)) {
        dp.setCurrentUnit((UNIT_LIST as any)[nextIdx]);
      }
      event.currentTarget.focus();
      return;
    }

    if (!ctrlKey && !shiftKey && !altKey && event.key === 'Enter') {
      event.preventDefault();
      const { focusDate, currentUnit } = dp;
      if (!focusDate) return;
      const [year, monthindex, day] = parseDate(focusDate);
      let sufix = `[data-year="${year}"]`;
      if (currentUnit !== 'years') {
        sufix += `[data-monthindex="${monthindex}"]`;
        if (currentUnit !== 'months') sufix += `[data-day="${day}"]`;
      }
      const $cell = find$(`.${cn('cell')}${sufix}`, dp.$datepicker);
      if ($cell) $cell.click();
      return;
    }

    if (!isArrowKey(key)) return;
    event.preventDefault();

    const { focusDate, unitDate, selectedDate, currentUnit } = dp;
    let date = focusDate;
    if (!date) {
      date = unitDate;
      if (
        selectedDate &&
        selectedDate.getFullYear() === date.getFullYear() &&
        selectedDate.getMonth() === date.getMonth()
      ) {
        date = selectedDate;
      } else {
        if (key === 'ArrowLeft' || key === 'ArrowUp')
          date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        else date = new Date(date.getFullYear(), date.getMonth(), 1);
      }
    }
    const parsed = parseDate(date);
    const [year, monthindex, day] = parsed;
    const isUp = key === 'ArrowRight' || key === 'ArrowUp';

    if (!ctrlKey && !shiftKey && !altKey) {
      // Move focus cell
      const params = [...parsed] as [number, number, number];
      params[ADD_IDX_MAP[currentUnit]] += ADDER_MAP[currentUnit][key];
      const nextDate = new Date(...params);
      if (
        (currentUnit === 'days' && nextDate.getMonth() !== monthindex) ||
        (currentUnit === 'months' && nextDate.getMonth() !== year) ||
        (currentUnit === 'years' &&
          between(year, ...(decade(date) as [number, number])))
      )
        dp.setUnitDate(nextDate);
      dp.setFocusDate(nextDate);
    } else if (ctrlKey && !shiftKey && !altKey) {
      // Move month
      const adder = isUp ? 1 : -1;
      const nextDate = new Date(year, monthindex + adder, day);
      dp.setFocusDate(nextDate);
      dp.setUnitDate(nextDate);
    } else if (!ctrlKey && shiftKey && !altKey) {
      // Move year
      const adder = isUp ? 1 : -1;
      const nextDate = new Date(year + adder, monthindex, day);
      dp.setFocusDate(nextDate);
      dp.setUnitDate(nextDate);
    } else if (!ctrlKey && !shiftKey && altKey) {
      // Move decade
      let nextYear = year + (isUp ? 10 : -10);
      if (nextYear < 100) nextYear = 10000 - 100 + nextYear;
      if (nextYear > 9999) nextYear = 100 + nextYear - 10000;
      const nextDate = new Date(nextYear, monthindex, day);
      dp.setFocusDate(nextDate);
      dp.setUnitDate(nextDate);
    }
  };

  return handleShrotchust;
}
