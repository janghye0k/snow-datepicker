import DatePicker from '../src/index.js';
import '../src/styles/index.css';
// import '../src/styles/dark.css';

const id = 'picker';
const selector = `#${id}`;
document.body.innerHTML = `
    <div id="${id}"></div>
    <button id="show">show</button>
    <button id="hide">hide</button>
`;

const picker = new DatePicker(selector, { readOnly: false });

document.getElementById('show').onclick = () => picker.show();
document.getElementById('hide').onclick = () => picker.hide();
