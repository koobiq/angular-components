import { NgModule } from '@angular/core';
import { DateAdapter, KBQ_DATE_LOCALE } from '../datetime';
import { DateFormatter } from './date/formatter';
import {
    AbsoluteDateFormatterImpurePipe,
    AbsoluteDateFormatterPipe,
    AbsoluteDateShortFormatterImpurePipe,
    AbsoluteDateShortFormatterPipe,
    AbsoluteDateTimeFormatterImpurePipe,
    AbsoluteDateTimeFormatterPipe,
    AbsoluteShortDateTimeFormatterImpurePipe,
    AbsoluteShortDateTimeFormatterPipe,
    RangeDateFormatterImpurePipe,
    RangeDateFormatterPipe,
    RangeDateTimeFormatterImpurePipe,
    RangeDateTimeFormatterPipe,
    RangeMiddleDateTimeFormatterImpurePipe,
    RangeMiddleDateTimeFormatterPipe,
    RangeShortDateFormatterImpurePipe,
    RangeShortDateFormatterPipe,
    RangeShortDateTimeFormatterImpurePipe,
    RangeShortDateTimeFormatterPipe,
    RelativeDateFormatterImpurePipe,
    RelativeDateFormatterPipe,
    RelativeDateTimeFormatterImpurePipe,
    RelativeDateTimeFormatterPipe,
    RelativeShortDateFormatterImpurePipe,
    RelativeShortDateFormatterPipe,
    RelativeShortDateTimeFormatterImpurePipe,
    RelativeShortDateTimeFormatterPipe
} from './date/formatter.pipe';
import { KbqDataSizePipe } from './filesize';
import { KbqDecimalPipe, KbqRoundDecimalPipe, KbqTableNumberPipe } from './number/formatter';

@NgModule({
    imports: [
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
        RangeMiddleDateTimeFormatterPipe,
        AbsoluteDateFormatterImpurePipe,
        AbsoluteDateTimeFormatterImpurePipe,
        AbsoluteDateShortFormatterImpurePipe,
        AbsoluteShortDateTimeFormatterImpurePipe,
        RelativeDateFormatterImpurePipe,
        RelativeDateTimeFormatterImpurePipe,
        RelativeShortDateFormatterImpurePipe,
        RelativeShortDateTimeFormatterImpurePipe,
        RangeDateFormatterImpurePipe,
        RangeShortDateFormatterImpurePipe,
        RangeDateTimeFormatterImpurePipe,
        RangeShortDateTimeFormatterImpurePipe,
        RangeMiddleDateTimeFormatterImpurePipe,
        KbqDataSizePipe
    ],
    declarations: [
        KbqDecimalPipe,
        KbqRoundDecimalPipe,
        KbqTableNumberPipe
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
        RangeMiddleDateTimeFormatterPipe,
        AbsoluteDateFormatterImpurePipe,
        AbsoluteDateTimeFormatterImpurePipe,
        AbsoluteDateShortFormatterImpurePipe,
        AbsoluteShortDateTimeFormatterImpurePipe,
        RelativeDateFormatterImpurePipe,
        RelativeDateTimeFormatterImpurePipe,
        RelativeShortDateFormatterImpurePipe,
        RelativeShortDateTimeFormatterImpurePipe,
        RangeDateFormatterImpurePipe,
        RangeShortDateFormatterImpurePipe,
        RangeDateTimeFormatterImpurePipe,
        RangeShortDateTimeFormatterImpurePipe,
        RangeMiddleDateTimeFormatterImpurePipe,
        KbqDataSizePipe
    ],
    providers: [{ provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] }]
})
export class KbqFormattersModule {}

export * from './date/formatter';
export * from './date/formatter.pipe';
export * from './filesize/index';
export * from './number/formatter';
