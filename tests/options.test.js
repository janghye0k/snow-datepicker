import SnowDatePicker from '@/index';
import ko from '@/locale/ko';
import { cn } from '@/helpers/selectors';

let $el;
/** @type {import('../src/index').default} */
let datepicker;

/**
 * @param {Element} element
 * @param {import('../types/options').Options} [options]
 */
function create(element, options) {
  datepicker = new SnowDatePicker(element, options);
}

beforeEach(() => {
  document.body.innerHTML = '';
  datepicker = null;
  $el = document.createElement('input');
  document.body.appendChild($el);
});

describe('OPTIONS TEST', () => {
  describe('options.animation', () => {
    it('calendar element should be reveal with animation', async () => {
      create($el, { animation: true });
      datepicker.show();
      expect(datepicker.$datepicker.classList.contains('--scaleUp')).toBe(true);
    });
  });

  describe('options.autoClose', () => {
    it('should be hide calendar after select cell', () => {
      create($el, {
        selectedDate: new Date('2024-01-01'),
        autoClose: true,
        animation: false,
      });

      datepicker.show();
      const $day = datepicker.$datepicker.querySelector(
        '[data-monthindex="0"][data-day="3"]'
      );
      $day.click();

      const $container = document.getElementById(SnowDatePicker.containerId);
      expect($container.contains(datepicker.$datepicker)).toBe(false);
    });
  });

  describe('options.backdrop', () => {
    it('calendar should be reveal at center position', () => {
      create($el, {
        animation: false,
        backdrop: true,
      });

      datepicker.show();
      expect(datepicker.$datepicker.classList.contains('--center'));
    });
  });

  describe('options.buttons', () => {
    it('should be render preset buttons', () => {
      create($el, {
        selectedDate: new Date('2024-02-01'),
        buttons: ['clear', 'today'],
      });

      const $btns = datepicker.$datepicker.querySelectorAll('.' + cn('button'));
      expect($btns.length).toBe(2);
      const [$clear, $today] = [...$btns];

      $clear.click();
      expect(datepicker.selectedDate).toBe(null);

      $today.click();
      expect(datepicker.isSameDate(datepicker.selectedDate, new Date())).toBe(
        true
      );
    });

    it('should be render custom buttons', () => {
      let isClick = false;

      create($el, {
        selectedDate: new Date('2024-02-01'),
        buttons: {
          id: 'my-id',
          className: 'my-button',
          innerHTML: 'MyButton',
          dataset: { test: 'test' },
          onClick: () => (isClick = true),
        },
      });

      const $btn = datepicker.$datepicker.querySelector('.my-button');
      expect($btn).not.toBe(null);
      expect($btn.id).toBe('my-id');
      expect($btn.textContent.includes('MyButton')).toBe(true);
      expect($btn.dataset.test).toBe('test');
      $btn.click();
      expect(isClick).toBe(true);
    });
  });

  describe('options.className', () => {
    it('should append custom className to datepicker', () => {
      const className = 'this-is-custom-class';
      create($el, { className });
      expect(datepicker.$datepicker.classList.contains(className)).toBe(true);
    });
  });

  describe('options.dateFormat', () => {
    it('datepicker input value should be match with dateFormat', () => {
      create($el, {
        selectedDate: new Date('2024-01-01'),
        dateFormat: 'MM/DD/YYYY',
      });
      expect(datepicker.$input.value).toBe('01/01/2024');
    });
  });

  describe('options.inline', () => {
    it('calendar should be placed in target element', () => {
      create($el, { inline: true });
      expect(datepicker.$target.contains(datepicker.$datepicker)).toBe(true);
    });
  });

  describe('options.locale', () => {
    it('should change locale to ko', async () => {
      create($el, { locale: ko });

      const weekdaysShort = [];
      datepicker.$datepicker
        .querySelectorAll('.hye0k-datepicker-weekday')
        .forEach(($el) => weekdaysShort.push($el.textContent.trim()));

      expect(
        weekdaysShort.every((item) => ko.weekdaysShort.includes(item))
      ).toBe(true);
    });
  });

  describe('options.maxDate', () => {
    it('should not be move over maximum date', () => {
      create($el, {
        selectedDate: new Date('2024-01-01'),
        maxDate: new Date('2024-01-01'),
        navigationLoop: false,
      });

      datepicker.next();
      expect(datepicker.viewDate.getFullYear()).toBe(2024);
      expect(datepicker.viewDate.getMonth()).toBe(0);
      expect(datepicker.viewDate.getDate()).toBe(1);
    });

    it('should not be select over maximum date', () => {
      create($el, {
        selectedDate: new Date('2024-01-01'),
        maxDate: new Date('2024-01-01'),
      });

      datepicker.show();
      const $cell = datepicker.$datepicker.querySelector(
        '[data-monthindex="0"][data-day="2"]'
      );
      $cell.click();
      expect(datepicker.selectedDate.getDate()).not.toBe(2);
    });
  });

  describe('options.minDate', () => {
    it('should not be move under minimun date', () => {
      create($el, {
        selectedDate: new Date('2024-01-01'),
        minDate: new Date('2024-01-01'),
        navigationLoop: false,
      });

      datepicker.prev();
      expect(datepicker.viewDate.getMonth()).toBe(0);
    });

    it('should not be select under minimun date', () => {
      create($el, {
        selectedDate: new Date('2024-02-01'),
        minDate: new Date('2024-02-01'),
      });

      datepicker.show();
      const $cell = datepicker.$datepicker.querySelector(
        '[data-monthindex="0"][data-day="31"]'
      );
      $cell.click();

      expect(datepicker.selectedDate.getDate()).not.toBe(31);
    });
  });

  describe('options.moveOtherMonths', () => {
    const date = new Date('2024-01-01');
    it(`should be show other month when click other months's day`, () => {
      create($el, { selectedDate: date, moveOtherMonths: true });
      datepicker.show();
      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      $febFirst.click();

      expect(datepicker.viewDate.getMonth()).toBe(1);
    });

    it(`should not be show other month when click other months's day`, () => {
      create($el, { selectedDate: date, moveOtherMonths: false });
      datepicker.show();
      const $febFirst = datepicker.$datepicker.querySelector(
        '[data-monthindex="1"][data-day="1"]'
      );
      $febFirst.click();

      expect(datepicker.viewDate.getMonth()).toBe(0);
    });
  });

  describe('options.navigationLoop', () => {
    it('should be loop, if `true`', () => {
      create($el, {
        selectedDate: new Date('2024-02-01'),
        navigationLoop: true,
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-03-01'),
      });

      datepicker.next();
      datepicker.next();

      expect(datepicker.viewDate.getMonth()).toBe(0);
    });

    it('should not be loop, if `false`', () => {
      create($el, {
        selectedDate: new Date('2024-02-01'),
        navigationLoop: false,
        minDate: new Date('2024-01-01'),
        maxDate: new Date('2024-03-01'),
      });

      datepicker.next();
      datepicker.next();

      expect(datepicker.viewDate.getMonth()).toBe(2);
    });
  });

  describe('options.placeHolder', () => {
    it('should be change input placeholder', () => {
      const text = 'my-text';
      create($el, { placeHolder: text });
      expect(datepicker.$input.placeholder).toBe(text);
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
        selectedDate.getMonth() + 1,
        selectedDate.getDate(),
      ];
      expect(arr.join('-')).toBe('2024-2-1');
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
      expect(arr.join('-')).toBe('2024-1-1');
    });
  });

  describe('options.selectedDate', () => {
    it('should select date on init', async () => {
      const date = new Date('2024-01-01');
      create($el, { selectedDate: date });

      const inputDate = new Date(datepicker.$input.value);
      expect(datepicker.selectedDate).not.toBe(null);
      expect(date.getFullYear()).toBe(inputDate.getFullYear());
      expect(date.getMonth()).toBe(inputDate.getMonth());
      expect(date.getDate()).toBe(inputDate.getDate());
    });
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
      expect($febFirst.classList.contains('--hidden')).toBe(true);
    });
  });

  describe('options.size', () => {
    it('input should be small size, when options.size is `small`', () => {
      create($el, { size: 'small' });
      expect(datepicker.$target.classList.contains('--small')).toBe(true);
    });
  });

  describe('options.theme', () => {
    it('input should be dark theme, when options.theme is `dark`', () => {
      create($el, { theme: 'dark' });
      expect(datepicker.$target.classList.contains('--dark')).toBe(true);
    });
  });

  describe('options.titleFormat', () => {
    const selectedDate = new Date('2024-01-01');
    const findTitle = () =>
      datepicker.$datepicker.querySelector('.' + cn('controlsTitle'));
    it('years', () => {
      create($el, {
        animation: false,
        selectedDate,
        view: 'years',
        titleFormat: { years: 'YYYY1 ~~ YYYY2' },
      });

      datepicker.show();

      const $title = findTitle();
      expect($title.textContent.includes('2020 ~~ 2029'));
    });

    it('months', () => {
      create($el, {
        animation: false,
        selectedDate,
        view: 'months',
        titleFormat: { months: 'YYYY !!' },
      });

      datepicker.show();

      const $title = findTitle();
      expect($title.textContent.includes('2024 !!'));
    });

    it('days', () => {
      create($el, {
        animation: false,
        selectedDate,
        view: 'days',
        titleFormat: { days: 'YYYY-MM !!' },
      });

      datepicker.show();

      const $title = findTitle();
      expect($title.textContent.includes('2024-01 !!'));
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
      $day.click();
      expect(datepicker.selectedDate).toBe(null);
    });
  });

  describe('options.view', () => {
    const date = new Date('2024-01-01');
    const cases = [
      { view: 'days', contains: 'January' },
      { view: 'months', contains: '2024' },
      { view: 'years', contains: '2020 - 2029' },
    ];
    cases.forEach(({ view, contains }) =>
      it(`should ${view} view`, () => {
        create($el, { view, selectedDate: date });
        const $title = datepicker.$datepicker.querySelector(
          '.' + cn('controlsTitle')
        );
        expect($title.textContent.includes(contains)).toBe(true);
      })
    );
  });

  describe('options.minView', () => {
    it('view should not be under minView', () => {
      create($el, { minView: 'months' });
      datepicker.setCurrentView('days');

      expect(datepicker.currentView).toBe('months');
    });
  });
});
