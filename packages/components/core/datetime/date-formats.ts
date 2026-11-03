import { InjectionToken } from '@angular/core';
import { DateFormats } from '@koobiq/date-adapter';

/** Date parsing and display formats of the date adapter. */
export const KBQ_DATE_FORMATS = new InjectionToken<DateFormats>('kbq-date-formats');

/** Formats provided through `KBQ_DATE_FORMATS`. */
export type KbqDateFormats = DateFormats;
