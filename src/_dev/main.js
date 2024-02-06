import DatePicker from '@/index';
import '@/styles/index.css';
// import '@/styles/dark.css';

const id = 'picker';
const selector = `#${id}`;
document.body.innerHTML = `
    <div id="${id}"></div>
`;

const picker = new DatePicker(selector, {
  selectedDate: new Date('2024-01-01'),
});
picker;
