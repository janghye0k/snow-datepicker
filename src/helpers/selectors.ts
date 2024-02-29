import { PREFIX } from '@/helpers/consts';

const classNameMap = {
  controls: 'controls',
  controlsBtn: 'controls__btn',
  controlsTitle: 'controls__title',
  content: 'content',
  days: 'content__days',
  months: 'content__months',
  years: 'content__years',
  weekday: 'content__weekday',
  cell: 'content__cell',
  calendar: 'calendar',
  inputRoot: 'inputRoot',
  inputBox: 'inputBox',
  label: 'inputLabel',
  input: 'input',
  backdrop: 'backdrop',
  calendarBtn: 'calendarBtn',
  button: 'button',
  buttonWrapper: 'buttonWrapper',
} as const;

type ClassNameKey = keyof typeof classNameMap;

const cn = (key: ClassNameKey) => PREFIX + '-' + classNameMap[key];

export { cn };
