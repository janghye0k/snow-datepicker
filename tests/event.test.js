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

describe('EVENT TEST', () => {
  it('onChangeView', () => {
    let evt;
    create({
      selectedDate: new Date('2024-01-01'),
      animation: false,
      onChangeView: (event) => (evt = event),
    });

    datepicker.setCurrentView('months');
    datepicker.setCurrentView('years');

    expect(evt.datepicker instanceof SnowDatePicker).toBe(true);
    expect(evt.view).toBe(datepicker.currentView);
    expect(evt.prevView).toBe('months');
  });

  it('onChangeViewDate', () => {
    let evt;
    create({
      selectedDate: new Date('2024-01-01'),
      animation: false,
      onChangeViewDate: (event) => (evt = event),
    });

    datepicker.setViewDate(new Date('2010-01-01'));
    expect(evt.datepicker instanceof SnowDatePicker).toBe(true);
    expect(datepicker.converter.format(evt.date, 'YYYY-MM-DD')).toBe(
      '2010-01-01'
    );
    expect(datepicker.converter.format(evt.prevDate, 'YYYY-MM-DD')).toBe(
      '2024-01-01'
    );
  });

  it('onSelect', () => {
    let evt;
    create({
      selectedDate: new Date('2024-01-01'),
      animation: false,
      onSelect: (event) => (evt = event),
    });

    datepicker.setSelectedDate(new Date('2010-01-01'));
    expect(evt.datepicker instanceof SnowDatePicker).toBe(true);
    expect(datepicker.converter.format(evt.date, 'YYYY-MM-DD')).toBe(
      '2010-01-01'
    );
    expect(datepicker.converter.format(evt.prevDate, 'YYYY-MM-DD')).toBe(
      '2024-01-01'
    );
  });

  it('onBeforeSelect', () => {
    let evt;
    create({
      selectedDate: new Date('2024-01-01'),
      animation: false,
    });
    datepicker.on('beforeSelect', (event) => {
      evt = event;
      if (datepicker.isSameDate(new Date('2024-01-15'), event.date))
        return false;
      return true;
    });
    datepicker.show();

    datepicker.setSelectedDate(new Date('2024-01-15'));
    expect(evt.datepicker instanceof SnowDatePicker).toBe(true);
    expect(
      datepicker.isSameDate(datepicker.selectedDate, new Date('2024-01-15'))
    ).toBe(false);
  });
});
