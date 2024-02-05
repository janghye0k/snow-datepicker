import dayjs from 'dayjs';
import { capitalize, isDateLike } from 'doumi';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Locale } from '@/index';
// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(customParseFormat);

class LocaleConverter {
  locale: Locale;
  dateFormat?: string;

  constructor(locale: Locale, dateFormat?: string) {
    this.locale = locale;
    this.dateFormat = dateFormat;
  }

  /**
   * Locale week order
   */
  get weekIndexes() {
    const { weekStart = 0 } = this.locale;
    return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
  }

  /**
   * Convert date to locale month string
   * @param {any} value
   * @param {boolean} [short]
   * @returns {string}
   */
  #month(value: any, short?: boolean): string {
    const date = new Date(value);
    return this.locale[short ? 'monthsShort' : 'months'][date.getMonth()];
  }

  /**
   * Convert date to locale weekday string
   * @param {any} value
   * @param {'short' | 'min'} [options]
   */
  #weekday(value: any, options?: 'short' | 'min') {
    const date = new Date(value);
    const suffix =
      options === 'short' || options === 'min' ? capitalize(options) : '';
    return this.locale[`weekdays${suffix}` as 'weekdaysMin'][date.getDay()];
  }

  /**
   * Format date
   * @param {*} value
   * @param {string} format
   * @returns {string}
   */
  format(value: any, format: string): string {
    if (!isDateLike(value)) return '';
    let arr = [{ text: format, convert: false }];
    const items: Array<[string, () => string]> = [
      ['dd', () => this.#weekday(value, 'min')],
      ['ddd', () => this.#weekday(value, 'short')],
      ['dddd', () => this.#weekday(value)],
      ['MMM', () => this.#month(value, true)],
      ['MMMM', () => this.#month(value)],
    ];
    let item;
    while ((item = items.pop())) {
      const [matcher, callback] = item;
      const temp: { text: string; convert: boolean }[] = [];
      arr.forEach((item) => {
        if (item.convert) return temp.push(item);
        const splitList = item.text.split(matcher);
        if (splitList.length === 1) return temp.push(item);
        splitList.forEach((text, index) => {
          if (index !== 0) temp.push({ text: callback(), convert: true });
          if (text.length) temp.push({ text, convert: false });
        });
      });
      arr = temp;
    }

    return arr
      .map((item) => {
        if (item.convert) return item.text;
        return dayjs(value).format(item.text);
      })
      .join('');
  }

  /**
   * Convert date to locale time format
   * @param {*} value
   * @returns {string}
   */
  time(value: any): string {
    return dayjs(value).format(this.locale.formats.time);
  }

  /**
   * Convert date to options date format (defaults locale date format)
   * @param {*} value
   * @returns {string}
   */
  date(value: any): string {
    return isDateLike(value)
      ? dayjs(value).format(this.dateFormat ?? this.locale.formats.date)
      : '';
  }

  /**
   * Check date is matched with options date format (or locale date format)
   * @param {*} date
   */
  isValid(date: any) {
    return dayjs(
      date,
      this.dateFormat ?? this.locale.formats.date,
      true
    ).isValid();
  }
}

export default LocaleConverter;
