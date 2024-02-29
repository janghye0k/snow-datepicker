import SnowDatePicker from '@/index';

let $el;
/** @type {import('../src/index').default} */
let datepicker;

/**
 * @param {Element} element
 * @param {import('../types/options').Options} [options]
 */
function create(options) {
  datepicker = new SnowDatePicker($el, options);
}

beforeEach(() => {
  document.body.innerHTML = '';
  datepicker = null;
  $el = document.createElement('input');
  document.body.appendChild($el);
});

const initDate = new Date('2010-07-15');

describe('API TEST', () => {
  it('setSelectedDate', () => {
    create({ selectedDate: initDate });

    datepicker.setSelectedDate(new Date('2023-01-01'));
    const { selectedDate } = datepicker;
    expect(
      selectedDate.getFullYear() === 2023 &&
        selectedDate.getMonth() === 0 &&
        selectedDate.getDate() === 1
    ).toBe(true);
  });

  it('setViewDate', () => {
    create({ viewDate: initDate });

    datepicker.setViewDate(new Date('2023-01-01'));
    const { viewDate } = datepicker;
    expect(
      viewDate.getFullYear() === 2023 &&
        viewDate.getMonth() === 0 &&
        viewDate.getDate() === 1
    ).toBe(true);
  });

  it('setCurrentView', () => {
    create({ view: 'days' });
    datepicker.setCurrentView('years');
    expect(datepicker.currentView).toBe('years');
  });

  it('setFocusDate', () => {
    create({ selectedDate: initDate });

    datepicker.setFocusDate(new Date('2023-01-01'));
    const { focusDate } = datepicker;
    expect(
      focusDate.getFullYear() === 2023 &&
        focusDate.getMonth() === 0 &&
        focusDate.getDate() === 1
    ).toBe(true);
  });

  it('isSameDate', () => {
    create({ selectedDate: initDate });

    expect(
      datepicker.isSameDate(new Date('2024-01-01'), new Date('2024-01-30'))
    ).toBe(false);
    expect(
      datepicker.isSameDate(
        new Date('2024-01-01'),
        new Date('2024-01-30'),
        'months'
      )
    ).toBe(true); // true
  });

  it('isShow', () => {
    create({ selectedDate: initDate, animation: false });
    expect(datepicker.isShow()).toBe(false);
  });

  it('show', () => {
    create({ selectedDate: initDate, animation: false });
    datepicker.show();
    expect(datepicker.isShow()).toBe(true);
  });

  it('hide', () => {
    create({ selectedDate: initDate, animation: false });
    datepicker.show();
    expect(datepicker.isShow()).toBe(true);

    datepicker.hide();
    expect(datepicker.isShow()).toBe(false);
  });

  it('destroy', () => {
    $el.innerHTML = 'hello';
    const origin = $el.outerHTML;
    create();
    expect(datepicker.$target.outerHTML).not.toBe(origin);
    datepicker.destroy();
    expect($el.outerHTML).toBe(origin);
  });

  it('next', () => {
    create({ animation: false, selectedDate: new Date('2023-12-31') });
    const { converter } = datepicker;

    datepicker.next();
    expect(converter.format(datepicker.viewDate, 'YYYY-MM')).toBe('2024-01');

    datepicker.setCurrentView('months');
    datepicker.next();
    expect(datepicker.viewDate.getFullYear()).toBe(2025);

    datepicker.setCurrentView('years');
    datepicker.next();
    expect(converter.format(datepicker.viewDate, 'YYYY1')).toBe('2030');
  });

  it('prev', () => {
    create({ animation: false, selectedDate: new Date('2024-01-01') });
    const { converter } = datepicker;

    datepicker.prev();
    expect(converter.format(datepicker.viewDate, 'YYYY-MM')).toBe('2023-12');

    datepicker.setCurrentView('months');
    datepicker.prev();
    expect(datepicker.viewDate.getFullYear()).toBe(2022);

    datepicker.setCurrentView('years');
    datepicker.prev();
    expect(converter.format(datepicker.viewDate, 'YYYY1')).toBe('2010');
  });
});
