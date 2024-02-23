import DatePicker from '@/index';
import ko from '@/locale/ko';

let $el;
/** @type {import('../src/index').default} */
let datepicker;

/**
 * @param {Element} element
 * @param {import('../types/options').Options} [options]
 */
function create(element, options) {
  datepicker = new DatePicker(element, options);
}

beforeEach(() => {
  document.body.innerHTML = '';
  datepicker = null;
  $el = document.createElement('input');
  document.body.appendChild($el);
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

      const inputDate = new Date(datepicker.$input.value);
      expect(datepicker.selectedDate).not.toBe(null);
      expect(date.getFullYear()).toBe(inputDate.getFullYear());
      expect(date.getMonth()).toBe(inputDate.getMonth());
      expect(date.getDate()).toBe(inputDate.getDate());
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
          '.datepicker-controls__title'
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
      expect($febFirst.classList.contains('--hidden')).toBe(true);
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

      const $container = document.getElementById(DatePicker.containerId);
      expect($container.contains(datepicker.$datepicker)).toBe(false);
    });
  });

  it('options.dateFormat', () => {
    create($el, {
      selectedDate: new Date('2024-01-01'),
      dateFormat: 'MM/DD/YYYY',
    });
    expect(datepicker.$input.value).toBe('01/01/2024');
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

  describe('options.buttons', () => {
    it('should be render preset buttons', () => {
      create($el, {
        selectedDate: new Date('2024-02-01'),
        buttons: ['clear', 'today'],
      });

      const $btns =
        datepicker.$datepicker.querySelectorAll('.datepicker-button');
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
});
