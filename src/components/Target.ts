import Components from '@/components/Components';
import { DATEFORMAT_REGEXP, PREFIX, VIEW_ORDER } from '@/helpers/consts';
import { cn } from '@/helpers/selectors';
import { parseDate } from '@/helpers/util';
import CalendarIcon from '@/icons/calendar';
import { effect } from '@janghye0k/observable';
import { InternalOptions } from '@t/options';
import {
  Evt,
  assignIn,
  create$,
  find$,
  forEach,
  get,
  isDateLike,
  on,
} from 'doumi';

type InputState = ReturnType<typeof createInputState>;
type ValueKey = 'day' | 'month' | 'year';
type IndexMap = Record<ValueKey, [number, number]>;
type EditState = {
  indexMap: IndexMap;
  target: ValueKey;
  count: number;
};

const IGNORE_REGEXP = /[^Y|M|D|\d]*/g;

function createInputState(
  dateFormat: string,
  minView: InternalOptions['minView']
) {
  // save rest str before target str
  const beforeStrMap = {
    year: '',
    month: '',
    day: '',
    rest: '',
  };
  const formatStrMap = {
    year: '',
    month: '',
    day: '',
  };
  let keyOrders: ValueKey[] = [];
  const valueMap = {} as Record<'year' | 'month' | 'day', number>;

  let prevIdx = 0;
  const rest = dateFormat.replace(DATEFORMAT_REGEXP, (match, idx) => {
    const length = match.length;
    const prevStr = dateFormat.slice(prevIdx, idx);
    prevIdx = idx + length;
    const has = (val: string) => match.includes(val);
    const target = has('Y') ? 'year' : has('M') ? 'month' : 'day';
    formatStrMap[target] = match;
    beforeStrMap[target] = prevStr;
    keyOrders.push(target);
    return ''.padStart(length, ' ');
  });
  beforeStrMap.rest = rest.slice(prevIdx);

  const minOrder = VIEW_ORDER[minView];
  keyOrders = keyOrders.filter((key) => VIEW_ORDER[key + 's'] >= minOrder);

  const format = keyOrders.reduce(
    (acc, key) => acc + beforeStrMap[key] + formatStrMap[key],
    ''
  );
  return { beforeStrMap, formatStrMap, keyOrders, valueMap, format };
}

class Target extends Components {
  declare $input: HTMLInputElement;
  declare $inputBox: HTMLElement;
  declare inputState: InputState;
  declare editState: EditState;

  get inputDate() {
    const { year, month, day } = this.inputState.valueMap;
    return new Date(year, month - 1, day);
  }

  beforeDestroy(): void {
    this.$el = create$('input');
  }

  subscribe(): void {
    const { store, converter } = this.instance;

    this.unsubscribers.push(
      effect(
        (date) => {
          if (!date) return (this.$input.value = this.inputState.format);
          const [year, monthindex, day] = parseDate(date);
          const { valueMap } = this.inputState;
          (valueMap.year = year), (valueMap.day = day);
          valueMap.month = monthindex + 1;
          this.$input.value = converter.format(date, this.inputState.format);
        },
        [store.state.date]
      )
    );
  }

  beforeInit(): void {
    // Set input state
    const inputState = createInputState(
      this.options.dateFormat ?? this.instance.converter.locale.formats.date,
      this.options.minView
    );
    assignIn(this, { inputState });
  }

  render() {
    this.$el.classList.add(PREFIX, cn('inputRoot'));
    const $inputBox = create$('div', { className: cn('inputBox') });
    const $input = create$('input', {
      className: cn('input'),
      type: 'text',
      placeholder:
        this.options.placeHolder ??
        this.instance.converter.locale.placeholder ??
        'Choose a date',
      readOnly: this.options.readOnly,
      value: this.inputState.format,
    });
    assignIn(this, { $input, $inputBox });
    const $iconBox = create$('button', {
      className: cn('calendarBtn'),
      innerHTML: CalendarIcon,
    });
    this.$inputBox.replaceChildren($input, $iconBox);
    this.$el.appendChild(this.$inputBox);
    assignIn(this.dp, { $input });
  }

  bindEvents(): void {
    on(find$('.' + cn('calendarBtn')), 'click', () =>
      this.handleClickCalendarButton()
    );
    on(this.$input, 'drop', (event: any) => {
      event.dataTransfer.dropEffect = 'none';
      event.stopPropagation();
      event.preventDefault();
    });
    on(this.$input, 'pointerdown', (evt) =>
      assignIn(evt.currentTarget, { isPointerDown: true })
    );

    on(this.$input, 'blur', (evt) => this.handleBlur(evt));
    on(this.$input, 'focus', (evt) => this.handleFocus(evt));
    on(this.$input, 'pointerup', (evt) => this.handlePointerUp(evt));
    on(
      document,
      'keydown',
      (e) => {
        if (!document.activeElement?.isSameNode(this.$input)) return;
        this.handleKeydown(e as any);
        this.handleKeydownInput(e as any);
      },
      true
    );
    on(this.$input, 'paste', (evt) => this.handlePaste(evt));
  }

  private handleClickCalendarButton() {
    this.dp.isShow() ? this.dp.hide() : this.dp.show();
  }

  private formatTargetValue(key: ValueKey) {
    const { valueMap, formatStrMap } = this.inputState;
    const targetValue = valueMap[key];
    const targetFormat = formatStrMap[key];
    if (!targetValue) return targetFormat;
    if (key !== 'month') {
      return String(targetValue).padStart(targetFormat.length, '0');
    }

    const formatMonthSize = targetFormat.length;
    if (formatMonthSize <= 2) {
      return String(targetValue).padStart(formatMonthSize, '0');
    }
    const { converter } = this.instance;
    return converter.localeMonth(targetValue - 1, formatMonthSize === 3);
  }

  private getIndexMap(): IndexMap {
    const { beforeStrMap, keyOrders } = this.inputState;
    const indexMap = {} as IndexMap;
    let idx = 0;
    keyOrders.forEach((key) => {
      const beforeStr = beforeStrMap[key];
      idx += beforeStr.length;
      const valueSize = this.formatTargetValue(key).length;
      indexMap[key] = [idx, (idx += valueSize)];
    });
    return indexMap;
  }

  private convertInputStateValue() {
    const { keyOrders, beforeStrMap } = this.inputState;
    return (
      keyOrders.reduce((acc, key) => {
        return acc + beforeStrMap[key] + this.formatTargetValue(key);
      }, '') + beforeStrMap.rest
    );
  }

  private findNearSelectionTarget(selectionStart: number) {
    const indexMap = this.getIndexMap();
    let prevDiff = Infinity;
    let target = '' as ValueKey;
    forEach(indexMap, ([std, end], key) => {
      const diff = Math.min(
        Math.abs(selectionStart - std),
        Math.abs(end - selectionStart)
      );
      if (target && diff > prevDiff) return;
      prevDiff = diff;
      target = key as ValueKey;
    });
    return { target, indexMap };
  }

  /** Select first editable text field */
  private handleFocus(event: Evt<'focus', HTMLInputElement>) {
    event.preventDefault();
    if (this.options.readOnly) return;
    this.$inputBox.classList.add('--active');
    if (get(event.currentTarget, 'isPointerDown')) {
      return assignIn(event.currentTarget, { isPointerDown: false });
    }
    const { target, indexMap } = this.findNearSelectionTarget(0);
    this.editState = { target, indexMap, count: 0 };
    event.currentTarget.setSelectionRange(...indexMap[target]);
  }

  /** Select near eidtable text field */
  private handlePointerUp(event: Evt<'pointerup', HTMLInputElement>) {
    event.preventDefault();
    if (this.options.readOnly) return;
    assignIn(event.currentTarget, { isPointerDown: false });
    const selectionStart = event.currentTarget.selectionStart ?? 0;
    const { target, indexMap } = this.findNearSelectionTarget(selectionStart);
    this.editState = { target, indexMap, count: 0 };
    event.currentTarget.setSelectionRange(...indexMap[target]);
  }

  /** Make input[type="text"] like input[type="date"] */
  private handleKeydownInput(event: Evt<'keydown', HTMLInputElement>) {
    if (this.options.readOnly) return;
    if (!event.ctrlKey || event.key !== 'v') event.preventDefault();
    const num = Number(event.key); // Current key number
    if (isNaN(num)) return; // If not a number, return

    const { value } = this.$input;
    const { formatStrMap, valueMap, keyOrders } = this.inputState;
    const { indexMap, target } = this.editState;
    const indexes = indexMap[target];
    const maxCount = target !== 'year' ? 2 : formatStrMap[target].length;

    this.editState.count++;

    if (target === 'year') {
      valueMap[target] =
        this.editState.count === 1 ? num : Number(`${valueMap[target]}${num}`);
    } else if (target === 'month') {
      if (this.editState.count === 1) {
        valueMap[target] = num;
        if (num > 1) this.editState.count++;
      } else {
        valueMap[target] = num < 3 ? Number(valueMap[target] + `${num}`) : num;
      }
    } else {
      if (this.editState.count === 1) {
        valueMap[target] = num;
        const max = valueMap.month && valueMap.month !== 2 ? 3 : 2;
        if (num > max) this.editState.count++;
      } else {
        const max = new Date(valueMap.year, valueMap.month, 0, 12).getDate();
        const value = Number(valueMap[target] + `${num}`);
        valueMap[target] = value > max ? num : value;
      }
    }

    const selectionText = value.slice(...indexes);
    const changeText = this.formatTargetValue(target);
    const textDiff = selectionText.length - changeText.length;
    if (textDiff !== 0) {
      this.editState.indexMap = this.getIndexMap();
    }

    // Change input value text
    this.$input.value =
      value.slice(0, indexes[0]) + changeText + value.slice(indexes[1]);

    if (this.editState.count >= maxCount) {
      const nextIdx = keyOrders.findIndex((item) => item === target) + 1;
      const keyOrderSize = keyOrders.length - 1;
      const nextTarget =
        keyOrders[nextIdx > keyOrderSize ? keyOrderSize : nextIdx];
      this.editState.target = nextTarget;
      this.editState.count = 0;
    }
    this.$input.setSelectionRange(
      ...this.editState.indexMap[this.editState.target]
    );
  }

  /** Change input value, If paste text is match with format */
  private handlePaste(event: Evt<'paste', HTMLInputElement>) {
    if (this.options.readOnly) return;
    if (document.activeElement !== event.currentTarget) return;
    event.preventDefault();
    // Get paste text
    let paste: string = (
      (event?.clipboardData || (window as any).clipboardData)?.getData(
        'text'
      ) ?? ''
    ).trim();

    const { formatStrMap, beforeStrMap, keyOrders } = this.inputState;

    // Replace month string to number
    const formatMonthSize = formatStrMap.month.length;
    if (formatMonthSize > 2) {
      const monthStrs =
        this.instance.converter.locale[
          formatMonthSize === 3 ? 'monthsShort' : 'months'
        ];
      monthStrs.forEach(
        (item, idx) => (paste = paste.replace(item, `${idx + 1}`))
      );
    }

    // Parse paste text
    let items: string[] = [];
    let prevIdx = 0;
    paste.replace(IGNORE_REGEXP, (match, idx) => {
      const length = match.length;
      if (length === 0) return '';
      items.push(paste.slice(prevIdx, idx));
      items.push(match);
      prevIdx = idx + length;
      return '';
    });
    items.push(paste.slice(prevIdx));
    items = items.filter((item) => item.length);

    // Check paste text is match with format and it has date-like value
    const data = { year: '', month: '', day: '' };
    let itemPos = 0;
    for (const key of keyOrders) {
      const beforeStr = beforeStrMap[key];
      if (beforeStr.length) {
        if (beforeStr !== items[itemPos]) return;
        itemPos++;
      }
      const item = items[itemPos];
      itemPos++;
      if (item === formatStrMap[key] || isNaN(Number(item))) return;
      data[key] = item;
    }

    // If paste rest string & format rest string is not matched return
    if ((items[itemPos] ?? '') !== beforeStrMap.rest || items.at(itemPos + 1))
      return;
    // If is not date-like value return
    if (!isDateLike(`${data.year}-${data.month}-${data.day}`)) return;

    // Change input-state value
    forEach(
      data,
      (value, key) => ((this.inputState.valueMap as any)[key] = value)
    );

    // Replace display text
    event.currentTarget.value = this.convertInputStateValue();
  }

  /** Reset Input value to formatted datepicker selected date */
  private resetDate() {
    const { converter } = this.instance;
    const selectedDate = this.dp.selectedDate;
    this.$input.value = !selectedDate
      ? this.inputState.format
      : converter.format(selectedDate, this.inputState.format);
  }

  /** Set datepicker's selected date to input value date */
  private setToInputDate() {
    const date = this.inputDate;
    if (this.options.readOnly) return;
    if (!isDateLike(date)) return this.resetDate();
    this.dp.setSelectedDate(date);
    this.dp.setViewDate(date);
  }

  /** Set date & reset input state */
  private handleBlur(event: Evt<'blur', HTMLInputElement>) {
    this.$inputBox.classList.remove('--active');
    if (!get(event.currentTarget, 'dpDisableInputBlur')) this.setToInputDate();
    assignIn(event.currentTarget, { dpDisableInputBlur: false });
  }

  /** Escape input or submit input value */
  private handleKeydown(event: Evt<'keydown', HTMLInputElement>) {
    if (this.options.readOnly) return;
    const isEnter = event.key === 'Enter';
    const isEscape = event.key === 'Escape';
    if (isEnter || isEscape) {
      event.preventDefault();
      assignIn(this.$input, { dpDisableInputBlur: true });
      this.$input.blur();
      isEnter ? this.setToInputDate() : this.resetDate();
      return false;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const { keyOrders } = this.inputState;
      const { target, indexMap } = this.editState;

      const adder = event.shiftKey ? -1 : 1;
      const keySize = keyOrders.length;

      let nextIdx = keyOrders.findIndex((item) => item === target) + adder;
      if (nextIdx < 0) nextIdx = keySize + nextIdx;
      else if (nextIdx >= keySize) nextIdx = nextIdx % keySize;

      const nextTarget = keyOrders[nextIdx];
      this.editState.count = 0;
      this.editState.target = nextTarget;
      this.$input.setSelectionRange(...indexMap[nextTarget]);

      return false;
    }
  }
}

export default Target;
