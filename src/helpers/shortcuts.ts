import SnowDatePicker from '@/datepicker';
import { VIEW_LIST } from '@/helpers/consts';
import { cn } from '@/helpers/selectors';
import { decade, parseDate } from '@/helpers/util';
import { between, find$, type Evt } from 'doumi';

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

export function createShortcutsHandler(dp: SnowDatePicker) {
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
        VIEW_LIST.findIndex((item) => item === dp.currentView) + adder;
      if (between(nextIdx, 0, 2)) {
        dp.setCurrentView((VIEW_LIST as any)[nextIdx]);
      }
      dp.$datepicker.focus();
      return;
    }

    if (!ctrlKey && !shiftKey && !altKey && event.key === 'Enter') {
      event.preventDefault();
      const { focusDate, currentView } = dp;
      if (!focusDate) return;
      const [year, monthindex, day] = parseDate(focusDate);
      let sufix = `[data-year="${year}"]`;
      if (currentView !== 'years') {
        sufix += `[data-monthindex="${monthindex}"]`;
        if (currentView !== 'months') sufix += `[data-day="${day}"]`;
      }
      const $cell = find$(`.${cn('cell')}${sufix}`, dp.$datepicker);
      if ($cell) $cell.click();
      return;
    }

    if (!isArrowKey(key)) return;
    event.preventDefault();

    const { focusDate, viewDate, selectedDate, currentView } = dp;
    let date = focusDate;
    if (!date) {
      date = viewDate;
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
    const [startYear, endYear] = decade(date);
    const isUp = key === 'ArrowRight' || key === 'ArrowDown';

    if (!ctrlKey && !shiftKey && !altKey) {
      // Move focus cell
      const params = [...parsed] as [number, number, number];
      params[ADD_IDX_MAP[currentView]] += ADDER_MAP[currentView][key];
      if (currentView === 'years') {
        if (params[0] < startYear - 1) params[0] += 2;
        if (params[0] > endYear + 1) params[0] -= 2;
      }
      const nextDate = new Date(...params);
      if (
        (currentView === 'days' && nextDate.getMonth() !== monthindex) ||
        (currentView === 'months' && nextDate.getMonth() !== year) ||
        (currentView === 'years' && between(year, startYear, endYear))
      )
        dp.setViewDate(nextDate);
      dp.setFocusDate(nextDate);
      return;
    } else if (ctrlKey && !shiftKey && !altKey) {
      // Move month
      const adder = isUp ? 1 : -1;
      const nextDate = new Date(year, monthindex + adder, day);
      dp.setFocusDate(nextDate);
      dp.setViewDate(nextDate);
    } else if (!ctrlKey && shiftKey && !altKey) {
      // Move year
      const adder = isUp ? 1 : -1;
      const nextDate = new Date(year + adder, monthindex, day);
      dp.setFocusDate(nextDate);
      dp.setViewDate(nextDate);
    } else if (!ctrlKey && !shiftKey && altKey) {
      // Move decade
      let nextYear = year + (isUp ? 10 : -10);
      if (nextYear < 100) nextYear = 10000 - 100 + nextYear;
      if (nextYear > 9999) nextYear = 100 + nextYear - 10000;
      const nextDate = new Date(nextYear, monthindex, day);
      dp.setFocusDate(nextDate);
      dp.setViewDate(nextDate);
    }
    dp.$datepicker.focus();
  };

  return handleShrotchust;
}
