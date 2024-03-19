import { InjectionToken } from '@angular/core';
import { DateFormats } from '@mosaic-design/date-adapter';


export const KBQ_DATE_FORMATS = new InjectionToken<DateFormats>('kbq-date-formats');
export type KbqDateFormats = DateFormats;
