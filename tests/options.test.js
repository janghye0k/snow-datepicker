import dayjs from 'dayjs';
import DatePicker from '@/index';
import ko from '@/locale/ko';
import { sleep } from 'doumi';

let $el;
/** @type {import('../src/index').default} */
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
      create($el, { selectedDate: date, locale: 'ko' });

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

  describe('options.showOtherMonths', () => {
    const date = new Date('2024-01-01');

    it(`other months's day should be visible when pass options true`, () => {
      create($el, { selectedDate: date, showOtherMonths: true });
      datepicker.show();

      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      expect($febFirst).toBeVisible();
    });

    it(`other months's day should be hidden when pass options false`, () => {
      create($el, { selectedDate: date, showOtherMonths: false });
      datepicker.show();

      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      expect($febFirst).not.toBeVisible();
    });
  });

  describe('options.selectOtherMonths', () => {
    const date = new Date('2024-01-01');
    it(`should be active when click other month's day`, () => {
      create($el, { selectedDate: date, selectOtherMonths: true });
      datepicker.show();
      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      $febFirst.click();
      const selectedDate = datepicker.selectedDate;
      const arr = [
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      ];
      expect(JSON.stringify(arr)).toBe(JSON.stringify([2024, 1, 1]));
    });

    it(`should not be active when click other month's day`, () => {
      create($el, { selectedDate: date, selectOtherMonths: false });
      datepicker.show();
      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      $febFirst.click();
      const selectedDate = datepicker.selectedDate;
      const arr = [
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      ];
      expect(JSON.stringify(arr)).not.toBe(JSON.stringify([2024, 1, 1]));
    });
  });

  describe('options.moveOtherMonths', () => {
    const date = new Date('2024-01-01');
    it(`should be show other month when click other months's day`, () => {
      create($el, { selectedDate: date, locale: 'en', moveOtherMonths: true });
      datepicker.show();
      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      $febFirst.click();

      expect(datepicker.unitDate.getMonth()).toBe(1);
    });

    it(`should not be show other month when click other months's day`, () => {
      create($el, { selectedDate: date, locale: 'en', moveOtherMonths: false });
      datepicker.show();
      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      $febFirst.click();

      expect(datepicker.unitDate.getMonth()).toBe(0);
    });
  });

  describe('options.toggleSelected', () => {
    it('should be unselected when click selected item', () => {
      create($el, {
        selectedDate: new Date('2024-01-01'),
        toggleSelected: true,
      });
      datepicker.show();
      const $day = datepicker.$datepicker.querySelector(
        '[data-monthindex="0"][data-day="1"]'
      );
      expect($day).toHaveClass('active');
      $day.click();
      expect($day).not.toHaveClass('active');
    });
  });

  describe('options.minDate', () => {});

  describe('options.maxDate', () => {});

  describe('options.format', () => {});

  describe('options.shortcuts', () => {});

  describe('options.navigationLoop', () => {});

  describe('options.autoClose', () => {});

  describe('options.titleFormat', () => {});

  describe('options.buttons', () => {});
});
