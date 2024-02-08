const PREFIX = 'datepicker' as const;
const CONTAINER_ID = `${PREFIX}-container` as const;

const classNameMap = {
  controls: 'controls',
  'controls.btn': 'controls__btn',
  'controls.title': 'controls__title',
  content: 'content',
  days: 'content__days',
  'days.weekdays': 'content__weekdays',
  'days.weekdays.item': 'content__weekdays-item',
  'days.views': 'content__views',
  cell: 'content__cell',
  months: 'content__months',
  years: 'content__years',
  arrow: 'calendar__arrow',
  calendar: 'calendar',
  input: 'input',
  backdrop: 'backdrop',
} as const;

type ClassNameKey = keyof typeof classNameMap;

const get = (key: ClassNameKey) => PREFIX + '-' + classNameMap[key];

function cn(find: ClassNameKey): string;
function cn(...args: ClassNameKey[]): string[];
function cn(
  find: ClassNameKey,
  ...args: Array<ClassNameKey>
): string | string[] {
  const className = get(find);
  if (!args.length) return className;
  return [className].concat(args.map((arg) => get(arg)));
}

export { cn, CONTAINER_ID, PREFIX };
