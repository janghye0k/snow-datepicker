import { create } from './helpers';

let $el, datepicker;

beforeAll(() => {
  $el = document.createElement('input');
  document.body.appendChild($el);
});

describe('DEFAULT TESTS', () => {
  it('initialized with default options', () => {
    datepicker = create($el);
  });
});
