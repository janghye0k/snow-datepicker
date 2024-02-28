import SnowDatePicker from '@/index';

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

describe('COMMON TESTS', () => {
  it('initialized with default options', () => {
    create($el);
    expect(datepicker).toBeInstanceOf(SnowDatePicker);
  });

  it('datepicker container should be created', () => {
    create($el);
    expect(document.getElementById(SnowDatePicker.containerId)).not.toBeNull();
  });

  it('datepicker should be added to the container when visible', async () => {
    create($el);
    expect(
      document
        .getElementById(SnowDatePicker.containerId)
        .contains(datepicker.$datepicker)
    ).toBe(false);
    datepicker.show();
    expect(
      document
        .getElementById(SnowDatePicker.containerId)
        .contains(datepicker.$datepicker)
    ).toBe(true);
  });
});
