import { craeteConverter } from '@/instance/converter';

/** @type {import('../types/instance').Converter} */
const converter = craeteConverter({ dateFormat: 'YYYY MMMM DD' });

const dateArgs = [2024, 0, 1, 9, 1, 1, 1];

describe('CONVERTER TEST', () => {
  describe('converter.date', () => {
    it('should be format value to passed dateFormat', () => {
      expect(converter.date(new Date('2023-01-01'))).toBe('2023 January 01');
    });
  });

  describe('converter.time', () => {
    it('should be format value to locale tiem format', () => {
      expect(converter.time(new Date(...dateArgs))).toBe('09:01');
    });
  });

  describe('converter.format', () => {
    /** @type {Record<string, Array<{ mutate?: [number, number], result: string }>>} */
    const cases = {
      YY1: [{ result: '20' }],
      YY2: [{ result: '29' }],
      YY: [{ result: '24' }],
      YYYY1: [{ result: '2020' }],
      YYYY2: [{ result: '2029' }],
      YYYY: [{ result: '2024' }],
      M: [{ result: '1' }],
      MM: [{ result: '01' }],
      MMM: [{ result: 'Jan' }],
      MMMM: [{ result: 'January' }],
      D: [{ result: '1' }],
      DD: [{ result: '01' }],
      d: [{ result: '1' }],
      dd: [{ result: 'Mo' }],
      ddd: [{ result: 'Mon' }],
      dddd: [{ result: 'Monday' }],
      H: [{ result: '9' }],
      HH: [{ result: '09' }],
      h: [{ mutate: [3, 20], result: '8' }],
      hh: [{ mutate: [3, 20], result: '08' }],
      a: [{ result: 'am' }, { mutate: [3, 20], result: 'pm' }],
      A: [{ result: 'AM' }, { mutate: [3, 20], result: 'PM' }],
      m: [{ result: '1' }],
      mm: [{ result: '01' }],
      s: [{ result: '1' }],
      ss: [{ result: '01' }],
    };
    Object.entries(cases).forEach(([key, values]) => {
      it(key, () => {
        values.forEach(({ mutate, result }) => {
          const args = [...dateArgs];
          if (mutate && mutate.length > 1) {
            args[mutate[0]] = mutate[1];
          }
          const date = new Date(...args);
          expect(converter.format(date, key)).toBe(result);
        });
      });
    });
  });
});
