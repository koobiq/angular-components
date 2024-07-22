import { NgModule } from '@angular/core';
import { DateAdapter, KBQ_DATE_LOCALE } from '../datetime';
import { DateFormatter } from './date/formatter';
import {
    AbsoluteDateFormatterPipe,
    AbsoluteDateShortFormatterPipe,
    AbsoluteDateTimeFormatterPipe,
    AbsoluteShortDateTimeFormatterPipe,
    RangeDateFormatterPipe,
    RangeDateTimeFormatterPipe,
    RangeMiddleDateTimeFormatterPipe,
    RangeShortDateFormatterPipe,
    RangeShortDateTimeFormatterPipe,
    RelativeDateFormatterPipe,
    RelativeDateTimeFormatterPipe,
    RelativeShortDateFormatterPipe,
    RelativeShortDateTimeFormatterPipe
} from './date/formatter.pipe';
import { KbqDecimalPipe, KbqRoundDecimalPipe, KbqTableNumberPipe } from './number/formatter';

@NgModule({
    declarations: [
        KbqDecimalPipe,
        KbqRoundDecimalPipe,
        KbqTableNumberPipe,
        AbsoluteDateFormatterPipe,
        AbsoluteDateTimeFormatterPipe,
        AbsoluteDateShortFormatterPipe,
        AbsoluteShortDateTimeFormatterPipe,
        RelativeDateFormatterPipe,
        RelativeDateTimeFormatterPipe,
        RelativeShortDateFormatterPipe,
        RelativeShortDateTimeFormatterPipe,
        RangeDateFormatterPipe,
        RangeShortDateFormatterPipe,
        RangeDateTimeFormatterPipe,
        RangeShortDateTimeFormatterPipe,
        RangeMiddleDateTimeFormatterPipe
    ],
    exports: [
        KbqDecimalPipe,
        KbqRoundDecimalPipe,
        KbqTableNumberPipe,
        AbsoluteDateFormatterPipe,
        AbsoluteDateTimeFormatterPipe,
        AbsoluteDateShortFormatterPipe,
        AbsoluteShortDateTimeFormatterPipe,
        RelativeDateFormatterPipe,
        RelativeDateTimeFormatterPipe,
        RelativeShortDateFormatterPipe,
        RelativeShortDateTimeFormatterPipe,
        RangeDateFormatterPipe,
        RangeShortDateFormatterPipe,
        RangeDateTimeFormatterPipe,
        RangeShortDateTimeFormatterPipe,
        RangeMiddleDateTimeFormatterPipe
    ],
    providers: [{ provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }]
})
export class KbqFormattersModule {}

export * from './date/formatter';
export * from './date/formatter.pipe';
export * from './number/formatter';
