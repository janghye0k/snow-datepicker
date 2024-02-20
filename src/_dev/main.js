import DatePicker from '@/index';
import localeKo from '@/locale/ko';
import '@/styles/index.css';

const id = 'picker';
const selector = `#${id}`;
document.body.innerHTML = `
    <div id="${id}"></div>
`;

const picker = new DatePicker(selector, {
  selectedDate: new Date('2024-02-01'),
  locale: localeKo,
  minDate: new Date('2024-01-01'),
  maxDate: new Date('2024-03-01'),
});
picker;
