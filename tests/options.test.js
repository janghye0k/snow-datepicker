import dayjs from 'dayjs';
import DatePicker from '../src/index';
import ko from '../src/locale/ko';
import { sleep } from './utils';

let $el;
/** @type {DatePicker} */
let datepicker;

/**
 * @param {Element} element
 * @param {import('../src/index').Options} [options]
 */
function create(element, options) {
  datepicker = new DatePicker(element, options);
}

beforeAll(() => {
  $el = document.createElement('input');
  document.body.appendChild($el);
});

afterEach(() => {
  datepicker = null;
});

describe('OPTIONS TEST', () => {
  describe('options.className', () => {
    it('should append custom className to datepicker', () => {
      const className = 'this-is-custom-class';
      create($el, { className });
      expect(datepicker.$datepicker.classList.contains(className)).toBe(true);
    });
  });

  describe('options.locale', () => {
    it('should change locale to ko', async () => {
      create($el, { locale: ko });

      await sleep(100);

      const weekdaysShort = [];
      datepicker.$datepicker
        .querySelectorAll('.hye0k-datepicker-weekday')
        .forEach(($el) => weekdaysShort.push($el.textContent.trim()));

      expect(
        weekdaysShort.every((item) => ko.weekdaysShort.includes(item))
      ).toBe(true);
    });
  });

  describe('options.selectedDate', () => {
    it('should select date on init', async () => {
      const date = new Date('2024-01-01');
      create($el, { selectedDate: date });

      await sleep(50);

      expect(datepicker.selectedDate).not.toBe(null);
      expect(dayjs(date).format(datepicker.converter.locale.formats.date)).toBe(
        datepicker.$input.value
      );
    });
  });

  describe('options.unit', () => {
    const date = new Date('2024-01-01');
    const cases = [
      { unit: 'days', contains: 'January' },
      { unit: 'months', contains: '2024' },
      { unit: 'years', contains: '2020 - 2029' },
    ];
    cases.forEach(({ unit, contains }) =>
      it(`should ${unit} unit`, () => {
        create($el, { unit, selectedDate: date });
        const $title = datepicker.$datepicker.querySelector(
          '.hye0k-datepicker-nav-title'
        );
        expect($title.textContent.includes(contains)).toBe(true);
      })
    );
  });

  describe('options.minDate', () => {});

  describe('options.maxDate', () => {});

  describe('options.format', () => {});

  describe('options.setSelected', () => {});

  describe('options.shortcuts', () => {});

  describe('options.position', () => {});

  describe('options.showOtherMonths', () => {});

  describe('options.selectOtherMonths', () => {});

  describe('options.navigationLoop', () => {});

  describe('options.autoClose', () => {});

  describe('options.titleFormat', () => {});

  describe('options.buttons', () => {});
});
