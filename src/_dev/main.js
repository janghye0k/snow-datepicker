import SnowDatePicker from '@/index';
import '@/styles/index.css';

const id = 'picker';
const selector = `#${id}`;
document.body.innerHTML = `
    <div id="${id}"></div>
`;

const picker = new SnowDatePicker(selector, {
  selectedDate: new Date('2024-01-01'),
});
picker;
