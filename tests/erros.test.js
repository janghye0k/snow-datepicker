import SnowDatePicker from '@/index';
import {
  DEFAULT_OPTIONS,
  DEFAULT_TITLE_FORMAT,
  OPTION_EVENT_KEYS,
} from '@/helpers/consts';

/** @typedef {import('../types/options').Options} Options */

/** @type {Options} */
let opts;
let $el;
/**
 * @param {Options} [options]
 * @param {Element} [element]
 */
function create(options, element = $el) {
  return new SnowDatePicker(element, options);
}

beforeEach(() => {
  opts = { ...DEFAULT_OPTIONS };
  document.body.innerHTML = '';
  $el = document.createElement('input');
  document.body.appendChild($el);
});

/** @type {Array<[keyof Options, any]>} */
const cases = [
  ['animation', 'string'],
  ['autoClose', 'string'],
  ['backdrop', 'string'],
  ['buttons', true],
  ['className', true],
  ['dateFormat', true],
  ['inline', 'string'],
  ['locale', 'string'],
  ['maxDate', 'string'],
  ['minDate', 'string'],
  ['minView', true, 'not a view'],
  ['moveOtherMonths', 'string'],
  ['navigationLoop', 'string'],
  ['placeHolder', true],
  ['position', false, 'bottom-error', 'a-b-c'],
  ['readOnly', 'string'],
  ['selectOtherMonths', 'string'],
  ['selectedDate', 'string'],
  ['shortcuts', 'string'],
  ['showOtherMonths', 'string'],
  ['size', true, 'not a size'],
  ['theme', true, 'not a theme'],
  [
    'titleFormat',
    false,
    { ...DEFAULT_TITLE_FORMAT, days: false },
    { ...DEFAULT_TITLE_FORMAT, months: false },
    { ...DEFAULT_TITLE_FORMAT, years: false },
  ],
  ['toggleSelected', 'string'],
  ['view', false, 'not a view'],
  ...OPTION_EVENT_KEYS.map((key) => [key, 'string']),
];

describe('ERRORS TEST', () => {
  it('should throw an error if passed invalid element', () => {
    expect(() => create(opts, 'not a selector')).toThrow();
    expect(() => create(opts, {})).toThrow();
  });

  describe('should throw an error if passed an invalid option value', () => {
    cases.forEach(([key, ...values]) => {
      it(`options.${key}`, () => {
        values.forEach((value) => {
          opts[key] = value;
          expect(() => create(opts)).toThrow();
        });
      });
    });
  });
});
