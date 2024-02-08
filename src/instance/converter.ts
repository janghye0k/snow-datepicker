import { capitalize, isDateLike, range } from 'doumi';
import LocaleEn from '@/locale/en';
import type { DateLike, Options } from '@t/options';
import type { Converter } from '@t/instance';
import { decade } from '@/helpers/util';

type Prams = Pick<Options, 'locale' | 'dateFormat'>;

const FORMAT_REGEXP =
  /\[([^\]]+)]|YY[1|2]|YYYY[1|2]|Y{2,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;
const DEFAULT_FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const INVALID_DATE = 'Invalid Date';

const getZone = (date: Date) => {
  const zoneOffset = -(-Math.round(date.getTimezoneOffset() / 15) * 15);
  const offset = Math.abs(zoneOffset);
  const operator = zoneOffset <= 0 ? '+' : '-';
  const offsetHours = Math.floor(offset / 60)
    .toString()
    .padStart(2, '0');
  const offsetMinutes = (offset % 60).toString().padStart(2, '0');

  return `${operator}${offsetHours}:${offsetMinutes}`;
};

export function craeteConverter({
  locale = LocaleEn,
  dateFormat,
}: Prams = {}): Converter {
  const month = (monthIndex: number, short?: boolean) => {
    const monthStr = locale.months[monthIndex];
    if (!short) return monthStr;
    return locale.monthsShort[monthIndex] || monthStr.slice(0, 3);
  };

  const weekday = (weekdayIndex: number, options?: 'short' | 'min') => {
    const weekdayStr = locale.weekdays[weekdayIndex];
    if (!options) return weekdayStr;
    return locale[`weekdays${capitalize(options)}` as 'weekdaysMin'][
      weekdayIndex
    ];
  };

  const hour = (hours: number) => hours % 12 || 12;

  const meridiem = (hours: number) => (hours < 12 ? 'AM' : 'PM');

  const converter: Converter = {
    get locale() {
      return locale;
    },
    get weekIndexes() {
      const { weekStart = 0 } = locale;
      return range(weekStart, 7).map((item) => item % 7);
    },
    /**
     * Format date
     * @param {DateLike} value The value to format.
     * @param {string} formatStr The format string for formating value.
     * @returns {string} Returns formatted value.
     */
    format(value: DateLike, formatStr: string = DEFAULT_FORMAT): string {
      if (!isDateLike(value)) return INVALID_DATE;
      const date = new Date(value);
      const Y = date.getFullYear();
      const M = date.getMonth();
      const D = date.getDate();
      const W = date.getDay();
      const H = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();
      const ms = date.getMilliseconds();
      const [d1, d2] = decade(date);

      return formatStr.replace(FORMAT_REGEXP, (match, escapeStr) => {
        if (escapeStr) return escapeStr;
        switch (match) {
          case 'YY1':
            return d1.toString().slice(-2);
          case 'YY2':
            return d2.toString().slice(-2);
          case 'YY':
            return Y.toString().slice(-2);
          case 'YYYY1':
            return d1;
          case 'YYYY2':
            return d2;
          case 'YYYY':
            return Y.toString().padStart(4, '0');
          case 'M':
            return M + 1;
          case 'MM':
            return (M + 1).toString().padStart(2, '0');
          case 'MMM':
            return month(M, true);
          case 'MMMM':
            return month(M);
          case 'D':
            return D;
          case 'DD':
            return D.toString().padStart(2, '0');
          case 'd':
            return W;
          case 'dd':
            return weekday(W, 'min');
          case 'ddd':
            return weekday(W, 'short');
          case 'dddd':
            return weekday(W);
          case 'H':
            return H;
          case 'HH':
            return H.toString().padStart(2, '0');
          case 'h':
            return hour(H);
          case 'hh':
            return hour(H).toString().padStart(2, '0');
          case 'a':
            return meridiem(H).toLowerCase();
          case 'A':
            return meridiem(H);
          case 'm':
            return m;
          case 'mm':
            return M.toString().padStart(2, '0');
          case 's':
            return s;
          case 'ss':
            return s.toString().padStart(2, '0');
          case 'sss':
            return ms.toString().padStart(3, '0');
          case 'Z':
            return getZone(date);
          case 'ZZ':
            return getZone(date).replace(':', '');
          default:
            return '';
        }
      });
    },

    /**
     * Convert date to locale time format
     * @param {DateLike} value The value to convert
     * @returns {string} Returns formatted time
     */
    time(value: DateLike): string {
      return this.format(value, dateFormat ?? locale.formats.date);
    },

    /**
     * Convert date to options date format (defaults locale date format)
     * @param {DateLike} value The value to convert.
     * @returns {string} Returns formatted date.
     */
    date(value: DateLike): string {
      return this.format(value, dateFormat ?? locale.formats.date);
    },
  };

  return converter;
}
