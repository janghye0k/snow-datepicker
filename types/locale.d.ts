type LocaleFormats = { time: string; date: string };

/**
 * Language of the calendar.
 */
export type Locale = {
  name: string;
  months: string[];
  monthsShort: string[];
  weekStart: number;
  weekdays: string[];
  weekdaysShort: string[];
  weekdaysMin: string[];
  formats: LocaleFormats;
  placeholder: string;
};
