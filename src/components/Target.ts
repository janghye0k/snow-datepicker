import type { InputFormats } from '@t/locale';
import {
  Evt,
  assignIn,
  between,
  create$,
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

    effect(
      (date) => {
        this.$input.value = !date
          ? this.inputFormats.format
          : converter.format(date, this.inputFormats.format);
      },
      [store.state.date]
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
    on(this.$input, 'keydown', (evt) => this.handleKeyDown(evt));
    on(this.$input, 'blur', () => this.handleBlur());
    on(find$('.' + cn('calendarBtn')), 'click', () => this.dp.show());
    on(this.$input, 'focus', (evt) => this.handleFocus(evt));
    on(this.$input, 'mouseup', (evt) => this.handleMouseUp(evt));
    on(this.$input, 'drop', (event: any) => {
      event.dataTransfer.dropEffect = 'none';
      event.stopPropagation();
      event.preventDefault();
    });

    this.makeTextInputLikeDate();
  }

  /** Set date & reset input state */
  private handleBlur() {
    this.setToInputDate();
    this.inputState = { ...{ ...INPUT_INITIAL_STATE } } as InputState;
    const $inputBox = find$('.' + cn('inputBox'), this.$el) as HTMLElement;
    $inputBox.classList.remove('--active');
  }

  /** Set input text like date */
  private makeTextInputLikeDate() {
    // Set state when change selection
    on(this.$input, 'select', (e) => {
      e.preventDefault();
      const curTargetKey = this.getNearEditableTargetKey(
        e.currentTarget.selectionStart as number
      );
      if (this.inputState.targetKey !== curTargetKey) {
        this.inputState.targetKey = curTargetKey;
        this.inputState.isSelectChange = true;
      }
    });

    on(this.$input, 'keydown', (event) => {
      event.preventDefault();
      const num = Number(event.key); // Current key number
      if (isNaN(num)) return; // If not a number, return

      // Update input state
      if (this.inputState.isSelectChange) {
        (this.inputState.count = 0), (this.inputState.isSelectChange = false);
      }
      this.inputState.count++;

      // Change input value
      const { value } = event.currentTarget;
      const selectionStart = event.currentTarget.selectionStart ?? 0;
      const selectionEnd = event.currentTarget.selectionEnd as number;

      const text = value.slice(selectionStart, selectionEnd);
      let changedValue = (text.replace(/[^1-9]/g, '0') + num).slice(1);

      if (this.inputState.targetKey === 'month') {
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

      if (this.inputState.targetKey === 'day') {
        if (this.inputState.count === 1) {
          if (num > 3) this.inputState.count++;
          changedValue = `0${num}`;
        }
        if (this.inputState.count === 2) {
          const day = Number(changedValue);
          const { year, month } = this.extractInputValue();
          const lastDate = new Date(Number(year), Number(month), -1, 12);
          if (day < 1) changedValue = '01';
          else if (
            day > (isNaN(lastDate.getDate()) ? 31 : lastDate.getDate())
          ) {
            changedValue = `0${num}`;
          }
        }
      }

      // Set input text date
      event.currentTarget.value =
        value.slice(0, selectionStart) +
        changedValue +
        value.slice(selectionEnd);

      // Select next editable text area
      const { indexMap } = this.inputFormats;
      if (this.inputState.count < selectionEnd - selectionStart) {
        event.currentTarget.setSelectionRange(selectionStart, selectionEnd);
      } else {
        const targetKeys = keys(indexMap);
        const idx = targetKeys.findIndex(
          (item) => item === this.inputState.targetKey
        );
        const nextItem =
          indexMap[
            targetKeys.at(
              idx === -1 || idx === 2 ? 0 : idx + 1
            ) as keyof typeof indexMap
          ];
        this.inputState.count = 0;
        event.currentTarget.setSelectionRange(nextItem[0], nextItem[1]);
      }
    });
  }

  /** Extract (year, month, day) string from input */
  private extractInputValue() {
    const { indexMap } = this.inputFormats;
    const data: Record<string, string> = {
      year: 'YYYY',
      month: 'MM',
      day: 'DD',
    };
    forEach(indexMap, ([std, end], key) => {
      data[key] = this.$input.value.slice(std, end);
    });
    return data;
  }

  /** Make input value to date */
  private getInputValueDate() {
    const [year, month, day] = values(this.extractInputValue());
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
    event.preventDefault();
    if (this.options.readOnly) return;
    if (event.key === 'Escape') {
      this.resetDate();
      event.currentTarget.blur();
      return false;
    }
    if (event.key === 'Enter') {
      this.setToInputDate();
      event.currentTarget.blur();
      return false;
    }
  }

  /** Select first editable text field */
  private handleFocus(event: Evt<'focus', HTMLInputElement>) {
    const { indexMap } = this.inputFormats;
    const item = values(indexMap)[0] as [number, number];
    event.currentTarget.setSelectionRange(...item);
    const $inputBox = find$('.' + cn('inputBox'), this.$el) as HTMLElement;
    $inputBox.classList.add('--active');
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

  /** Select near eidtable text field */
  private handleMouseUp(event: Evt<'mouseup', HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();
    const { indexMap } = this.inputFormats;
    const selectionStart = event.currentTarget.selectionStart ?? 0;
    const [std, end] = indexMap[this.getNearEditableTargetKey(selectionStart)];
    event.currentTarget.setSelectionRange(std, end);
  }
}

export default Target;
