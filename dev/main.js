import DatePicker from '../src/index.js';
import '../src/index.css';

const id = 'picker';
const selector = `#${id}`;
document.body.innerHTML = `<div id="${id}"></div>`;

const picker = new DatePicker(selector, {});
