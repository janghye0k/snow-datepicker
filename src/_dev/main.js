import DatePicker from '@/index';
import localeKo from '@/locale/ko';
import '@/styles/index.css';

const id = 'picker';
const selector = `#${id}`;
document.body.innerHTML = `
    <div id="${id}"></div>
`;

const picker = new DatePicker(selector, {
  selectedDate: new Date('2024-01-01'),
  locale: localeKo,
});

picker.show();
