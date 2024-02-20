import type { InputFormats } from '@t/locale';
import {
  Evt,
  assignIn,
  between,
  create$,
  entries,
  find$,
  forEach,
  get,
  isDateLike,
  keys,
  on,
  values,
} from 'doumi';
import Components from './Components';
import { PREFIX, cn } from '@/helpers/selectors';
import { effect } from '@janghye0k/observable';
import CalendarIcon from '@/icons/calendar';

type InputState = {
  targetKey: 'year' | 'month' | 'day';
  isSelectChange: boolean;
  count: number;
};

const INPUT_INITIAL_STATE = { targetKey: '', isSelectChange: false, count: 0 };

class Target extends Components {
  $el!: HTMLElement;
  $input!: HTMLInputElement;
  inputFormats!: InputFormats;
  inputState!: InputState;

  beforeDestroy(): void {
    this.$el = create$('input');
  }

  subscribe(): void {
    const { store, converter } = this.instance;

    this.unsubscribers.push(
      effect(
        (date) => {
          this.$input.value = !date
            ? this.inputFormats.format
            : converter.format(date, this.inputFormats.format);
        },
        [store.state.date]
      )
    );
  }

  beforeInit(): void {
    // Get input format
    this.inputFormats = get(
      this.instance.converter,
      'inputFormats'
    ) as InputFormats;

    // Set input state
    this.inputState = { ...INPUT_INITIAL_STATE } as InputState;
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
      value: this.inputFormats.format,
    });
    this.$input = $input;
    const $iconBox = create$('button', {
      className: cn('calendarBtn'),
      innerHTML: CalendarIcon,
    });
    $inputBox.replaceChildren($input, $iconBox);
    this.$el.appendChild($inputBox);
    assignIn(this.dp, { $input });
  }

  bindEvents(): void {
    on(find$('.' + cn('calendarBtn')), 'click', () => this.dp.show());
    on(this.$input, 'drop', (event: any) => {
      event.dataTransfer.dropEffect = 'none';
      event.stopPropagation();
      event.preventDefault();
    });
    on(this.$input, 'pointerdown', (evt) =>
      assignIn(evt.currentTarget, { isPointerDown: true })
    );

    on(this.$input, 'keydown', (evt) => this.handleKeyDown(evt));
    on(this.$input, 'blur', () => this.handleBlur());
    on(this.$input, 'focus', (evt) => this.handleFocus(evt));
    on(this.$input, 'pointerup', (evt) => this.handlePointerUp(evt));
    on(this.$input, 'select', (evt) => this.handleSelectInput(evt));
    on(this.$input, 'keydown', (evt) => this.handleKeydownInput(evt));
    on(this.$input, 'paste', (evt) => this.handlePaste(evt));
  }

  /** Set date & reset input state */
  private handleBlur() {
    this.setToInputDate();
    this.inputState = { ...{ ...INPUT_INITIAL_STATE } } as InputState;
    const $inputBox = find$('.' + cn('inputBox'), this.$el) as HTMLElement;
    $inputBox.classList.remove('--active');
  }

  /** Set input state when change selection */
  private handleSelectInput(event: Evt<'select', HTMLInputElement>) {
    event.preventDefault();
    const curTargetKey = this.getNearEditableTargetKey(
      event.currentTarget.selectionStart as number
    );
    if (this.inputState.targetKey !== curTargetKey) {
      this.inputState.targetKey = curTargetKey;
      this.inputState.isSelectChange = true;
    }
  }

  /** Make input[type="text"] like input[type="date"] */
  private handleKeydownInput(event: Evt<'keydown', HTMLInputElement>) {
    if (!event.ctrlKey || event.key !== 'v') event.preventDefault();
    const num = Number(event.key); // Current key number
    if (isNaN(num)) return; // If not a number, return

    // Update input state
    if (this.inputState.isSelectChange) {
      (this.inputState.count = 0), (this.inputState.isSelectChange = false);
    }
    this.inputState.count++;

    // Change input value
    const { indexMap } = this.inputFormats;
    const { value } = event.currentTarget;
    const selectionStart = event.currentTarget.selectionStart ?? 0;
    const selectionEnd = event.currentTarget.selectionEnd as number;

    const text = value.slice(selectionStart, selectionEnd);
    let changedValue = (text.replace(/[^1-9]/g, '0') + num).slice(1);

    const { targetKey } = this.inputState;
    if (targetKey === 'year') {
      if (this.inputState.count === 1) {
        const [std, end] = indexMap[targetKey];
        changedValue = `${num}`.padStart(end - std, '0');
      }
    }

    if (targetKey === 'month') {
      if (this.inputState.count === 1) {
        if (num > 1) this.inputState.count++;
        changedValue = `0${num}`;
      }
      if (this.inputState.count === 2) {
        const month = Number(changedValue);
        if (month < 1) changedValue = '01';
        else if (month > 12) changedValue = `0${num}`;
      }
    }

    if (targetKey === 'day') {
      if (this.inputState.count === 1) {
        if (num > 3) this.inputState.count++;
        changedValue = `0${num}`;
      }
      if (this.inputState.count === 2) {
        const day = Number(changedValue);
        const { year, month } = this.extractDateStringFromValue(
          this.$input.value
        );
        const lastDate = new Date(Number(year), Number(month), 0, 12);
        if (day < 1) changedValue = '01';
        else if (day > (isNaN(lastDate.getDate()) ? 31 : lastDate.getDate())) {
          changedValue = `0${num}`;
        }
      }
    }

    // Set input text date
    event.currentTarget.value =
      value.slice(0, selectionStart) + changedValue + value.slice(selectionEnd);

    // Select next editable text area

    if (this.inputState.count < selectionEnd - selectionStart) {
      event.currentTarget.setSelectionRange(selectionStart, selectionEnd);
    } else {
      const targetKeys = keys(indexMap);
      const idx = targetKeys.findIndex((item) => item === targetKey);
      const nextItem =
        indexMap[
          targetKeys.at(
            idx === -1 || idx === 2 ? -1 : idx + 1
          ) as keyof typeof indexMap
        ];
      this.inputState.count = 0;
      event.currentTarget.setSelectionRange(nextItem[0], nextItem[1]);
    }
  }

  /** Extract (year, month, day) string from input */
  private extractDateStringFromValue(value: string) {
    const { indexMap } = this.inputFormats;
    const data: Record<string, string> = {
      year: 'YYYY',
      month: 'MM',
      day: 'DD',
    };
    forEach(indexMap, ([std, end], key) => {
      data[key] = value.slice(std, end);
    });
    return data;
  }

  /** Make input value to date */
  private getInputValueDate() {
    const [year, month, day] = values(
      this.extractDateStringFromValue(this.$input.value)
    );
    return new Date(Number(year), Number(month) - 1, Number(day), 12);
  }

  /** Reset Input value to formatted datepicker selected date */
  private resetDate() {
    const selectedDate = this.dp.selectedDate;
    this.$input.value = !selectedDate
      ? this.inputFormats.format
      : this.instance.converter.format(selectedDate, this.inputFormats.format);
  }

  /** Set datepicker's selected date to input value date */
  private setToInputDate() {
    const date = this.getInputValueDate();
    if (this.options.readOnly) return;
    if (!isDateLike(date)) return this.resetDate();
    this.dp.setSelectedDate(date);
    this.dp.setUnitDate(date);
  }

  /** Escape input or submit input value */
  private handleKeyDown(event: Evt<'keydown', HTMLInputElement>) {
    if (this.options.readOnly) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.resetDate();
      event.currentTarget.blur();
      return false;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      this.setToInputDate();
      event.currentTarget.blur();
      return false;
    }
  }

  /** Select first editable text field */
  private handleFocus(event: Evt<'focus', HTMLInputElement>) {
    if (get(event.currentTarget, 'isPointerDown')) {
      return assignIn(event.currentTarget, { isPointerDown: false });
    }
    const { indexMap } = this.inputFormats;
    const item = values(indexMap)[0] as [number, number];
    event.currentTarget.setSelectionRange(...item);
    const $inputBox = find$('.' + cn('inputBox'), this.$el) as HTMLElement;
    $inputBox.classList.add('--active');
  }

  /** Select near eidtable text field */
  private handlePointerUp(event: Evt<'pointerup', HTMLInputElement>) {
    assignIn(event.currentTarget, { isPointerDown: false });
    const { indexMap } = this.inputFormats;
    const selectionStart = event.currentTarget.selectionStart ?? 0;
    const [std, end] = indexMap[this.getNearEditableTargetKey(selectionStart)];
    event.currentTarget.setSelectionRange(std, end);
  }

  /** Find near eidtable text field target key */
  private getNearEditableTargetKey(selectionStart: number) {
    const { indexMap } = this.inputFormats;
    let diff = Infinity;
    let target = '';
    forEach(indexMap, ([std, end], key) => {
      if (!key) return (target = key);
      if (between(selectionStart, std, end)) {
        diff = 0;
        target = key;
      } else {
        const curDiff = Math.min(
          Math.abs(selectionStart - std),
          Math.abs(selectionStart - end)
        );
        if (curDiff < diff) {
          diff = curDiff;
          target = key;
        }
      }
    });
    return target as 'year' | 'month' | 'day';
  }

  /** Change input value, If paste text is match with format */
  private handlePaste(event: Evt<'paste', HTMLInputElement>) {
    if (document.activeElement !== event.currentTarget) return;
    event.preventDefault();
    const paste: string = (
      (event?.clipboardData || (window as any).clipboardData)?.getData(
        'text'
      ) ?? ''
    ).trim();

    const { indexMap, format } = this.inputFormats;
    if (paste.length !== format.length) return;
    let checkStr = paste;
    const indexMapArr = entries(indexMap);
    indexMapArr.forEach(([[std, end], key]) => {
      const replaceChar = key === 'year' ? 'Y' : key === 'month' ? 'M' : 'D';
      checkStr =
        checkStr.slice(0, std) +
        ''.padStart(end - std, replaceChar) +
        checkStr.slice(end);
    });
    if (checkStr !== format) return;

    const data = this.extractDateStringFromValue(paste);
    const params = values(data).map((value) => Number(value));
    if (
      params.some((value, index) => {
        if (isNaN(value)) return true;
        if (index === 1 && !between(value, 1, 12)) return true;
        if (index === 2) {
          const maxDate = new Date(params[0], params[1], 0, 12).getDate();
          if (!between(value, 1, maxDate)) return true;
        }
        return false;
      })
    )
      return;
    event.currentTarget.value = paste;
    event.currentTarget.setSelectionRange(
      ...(indexMapArr[2][0] as [number, number])
    );
  }
}

export default Target;
