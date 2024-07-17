import SnowDatePicker from '@/index';

let $el;
/** @type {import('../src/index').default} */
let datepicker;

const opts = {
  shortcuts: true,
  animation: false,
  selectedDate: new Date('2015-07-15'),
};

/**
 * @param {import('../types/options').Options} [options]
 */
function create(options = {}) {
  datepicker = new SnowDatePicker($el, { ...opts, ...options });
}

/**
 * @param {string} key
 * @param {{ctrlKey?:boolean; altKey?:boolean; shiftKey?:boolean}} options
 */
function triggerKeyboardEvent(key, options) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    key,
    ...options,
  });
  datepicker.$datepicker.dispatchEvent(event);
}

beforeEach(() => {
  document.body.innerHTML = '';
  datepicker = null;
  $el = document.createElement('input');
  document.body.appendChild($el);
});

describe('SHORTCUTS TEST', () => {
  it('should be hide when press `Escape`', () => {
    create();
    datepicker.show();
    expect(datepicker.isShow()).toBe(true);

    triggerKeyboardEvent('Escape');
    expect(datepicker.isShow()).toBe(false);
  });

  it('should be move focus cell when press `ArrowKey`', () => {
    create();
    datepicker.show();

    let day = datepicker.selectedDate.getDate();

    const exec = (key, adder) => {
      triggerKeyboardEvent(key), (day += adder);
      expect(datepicker.focusDate.getDate()).toBe(day);
    };

    exec('ArrowLeft', -1);
    exec('ArrowRight', 1);
    exec('ArrowUp', -7);
    exec('ArrowDown', 7);
  });

  it('should be select focused cell date, when press `Enter`', () => {
    create();
    datepicker.show();

    triggerKeyboardEvent('ArrowRight');
    const focusDate = datepicker.focusDate;
    triggerKeyboardEvent('Enter');
    const { selectedDate, converter } = datepicker;
    expect(converter.date(selectedDate)).toBe(converter.date(focusDate));
  });

  it('should be change view, when press `PageUp` or `PageDown`', () => {
    create();
    datepicker.show();

    triggerKeyboardEvent('PageUp');
    expect(datepicker.currentView).toBe('months');

    triggerKeyboardEvent('PageDown');
    expect(datepicker.currentView).toBe('days');
  });

  it('should be change month, when press `ArrowKey` with `ctrlKey`', () => {
    create();
    datepicker.show();

    let month = datepicker.selectedDate.getMonth();
    const exec = (key, adder) => {
      triggerKeyboardEvent(key, { ctrlKey: true });
      month += adder;
      expect(datepicker.focusDate.getMonth()).toBe(month);
    };

    exec('ArrowLeft', -1);
    exec('ArrowDown', 1);
    exec('ArrowRight', 1);
    exec('ArrowUp', -1);
  });

  it('should be change year, when press `ArrowKey` with `shiftKey`', () => {
    create();
    datepicker.show();

    let year = datepicker.selectedDate.getFullYear();
    const exec = (key, adder) => {
      triggerKeyboardEvent(key, { shiftKey: true });
      year += adder;
      expect(datepicker.focusDate.getFullYear()).toBe(year);
    };

    exec('ArrowLeft', -1);
    exec('ArrowDown', 1);
    exec('ArrowRight', 1);
    exec('ArrowUp', -1);
  });

  it('should be change year, when press `ArrowKey` with `altKey`', () => {
    create();
    datepicker.show();

    let year = datepicker.selectedDate.getFullYear();
    const exec = (key, adder) => {
      triggerKeyboardEvent(key, { altKey: true });
      year += adder;
      expect(datepicker.focusDate.getFullYear()).toBe(year);
    };

    exec('ArrowLeft', -10);
    exec('ArrowDown', 10);
    exec('ArrowRight', 10);
    exec('ArrowUp', -10);
  });

  it('should be change viewDate, when move ohter month', () => {
    create({ selectedDate: new Date('2024-01-01') });
    datepicker.show();

    triggerKeyboardEvent('ArrowLeft');
    const formatDate = datepicker.converter.format(
      datepicker.focusDate,
      'YYYY-MM-DD'
    );
    expect(formatDate).toBe('2023-12-31');
    expect(datepicker.viewDate.getMonth()).toBe(11);
  });
});
