import dayjs from 'dayjs';
import { isDate } from './util';

class LocaleConverter {
  /**
   * @type {import('../index').Locale}
   */
  locale;
  /**
   * @type {string | undefined}
   */
  dateFormat;

  /**
   * @param {import('../index').Locale} locale
   * @param {string} [dateFormat]
   */
  constructor(locale, dateFormat) {
    this.locale = locale;
    this.dateFormat = dateFormat;
  }

  get weekIndexes() {
    const { weekStart = 0 } = this.locale;
    return Array.from({ length: 7 }, (_, i) => (i + weekStart) % 7);
  }

  /**
   * @param {any} value
   * @param {boolean} [short]
   * @returns {string}
   */
  #month(value, short) {
    const date = new Date(value);
    return this.locale[short ? 'monthsShort' : 'months'][date.getMonth()];
  }

  /**
   *
   * @param {any} value
   * @param {'short' | 'min'} [options]
   */
  #weekday(value, options) {
    const date = new Date(value);
    const suffix =
      options === 'short' || options === 'min'
        ? /** @type {'Short' | 'Min' } */ (
            options.charAt(0).toUpperCase() + options.substring(1)
          )
        : '';
    return this.locale[`weekdays${suffix}`][date.getDay()];
  }

  /**
   * @param {*} value
   * @param {string} format
   * @returns {string}
   */
  format(value, format) {
    if (!isDate(value)) return '';
    let arr = [{ text: format, convert: false }];
    /** @type {Array<[string, () => string]>} */
    const items = [
      ['dd', () => this.#weekday(value, 'min')],
      ['ddd', () => this.#weekday(value, 'short')],
      ['dddd', () => this.#weekday(value)],
      ['MMM', () => this.#month(value, true)],
      ['MMMM', () => this.#month(value)],
    ];
    let item;
    while ((item = items.pop())) {
      const [matcher, callback] = item;
      /** @type {{ text:string; convert:boolean }[]} */
      const temp = [];
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
   * @param {*} value
   * @returns {string}
   */
  time(value) {
    return dayjs(value).format(this.locale.formats.time);
  }

  /**
   * @param {*} value
   * @returns {string}
   */
  date(value) {
    return isDate(value)
      ? dayjs(value).format(this.dateFormat ?? this.locale.formats.date)
      : '';
  }
}

export default LocaleConverter;
