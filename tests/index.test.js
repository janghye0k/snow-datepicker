import DatePicker from '../src';

let $el, datepicker;

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

describe('DEFAULT TESTS', () => {
  it('initialized with default options', () => {
    create($el);
    expect(datepicker).toBeInstanceOf(DatePicker);
  });

  it('calendar container should be created', () => {
    create($el);
    expect(document.getElementById(DatePicker.containerId)).not.toBeNull();
  });
});
