import DatePicker from '../src';

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

describe('COMMON TESTS', () => {
  it('initialized with default options', () => {
    create($el);
    expect(datepicker).toBeInstanceOf(DatePicker);
  });

  it('datepicker container should be created', () => {
    create($el);
    expect(document.getElementById(DatePicker.containerId)).not.toBeNull();
  });

  it('datepicker should be added to the container when visible', async () => {
    create($el);
    expect(
      document
        .getElementById(DatePicker.containerId)
        .contains(datepicker.$datepicker)
    ).toBe(false);
    datepicker.show();
    expect(
      document
        .getElementById(DatePicker.containerId)
        .contains(datepicker.$datepicker)
    ).toBe(true);
  });
});
