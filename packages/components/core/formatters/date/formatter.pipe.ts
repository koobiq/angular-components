import { inject, Pipe, PipeTransform } from '@angular/core';
import { DateTimeOptions } from '@koobiq/date-formatter';
import { DateAdapter } from '../../datetime';
import { DateFormatter } from './formatter';

export class BaseFormatterPipe<D> {
    protected readonly adapter: DateAdapter<D> = inject(DateAdapter<D>);
    protected readonly formatter: DateFormatter<D> = inject(DateFormatter<D>);
}

@Pipe({
    name: 'absoluteLongDate'
})
export class AbsoluteDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'absoluteLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateFormatterImpurePipe<D> extends AbsoluteDateFormatterPipe<D> {
    transform(value: string | D, currYear?: boolean): string {
        return super.transform(value, currYear);
    }
}

@Pipe({
    name: 'absoluteLongDateTime'
})
export class AbsoluteDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'absoluteLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateTimeFormatterImpurePipe<D> extends AbsoluteDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'absoluteShortDate'
})
export class AbsoluteDateShortFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({
    name: 'absoluteShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateShortFormatterImpurePipe<D> extends AbsoluteDateShortFormatterPipe<D> {
    transform(value: string | D, currYear?: boolean): string {
        return super.transform(value, currYear);
    }
}

@Pipe({
    name: 'absoluteShortDateTime'
})
export class AbsoluteShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'absoluteShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteShortDateTimeFormatterImpurePipe<D> extends AbsoluteShortDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'relativeLongDate'
})
export class RelativeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({
    name: 'relativeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateFormatterImpurePipe<D> extends RelativeDateFormatterPipe<D> {
    transform(value: string | D): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'relativeLongDateTime'
})
export class RelativeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'relativeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateTimeFormatterImpurePipe<D> extends RelativeDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'relativeShortDate'
})
export class RelativeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({
    name: 'relativeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateFormatterImpurePipe<D> extends RelativeShortDateFormatterPipe<D> {
    transform(value: string | D): string {
        return super.transform(value);
    }
}

@Pipe({
    name: 'relativeShortDateTime'
})
export class RelativeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({
    name: 'relativeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateTimeFormatterImpurePipe<D> extends RelativeShortDateTimeFormatterPipe<D> {
    transform(value: string | D, options?: DateTimeOptions): string {
        return super.transform(value, options);
    }
}

@Pipe({
    name: 'rangeLongDate'
})
export class RangeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDate(date1 as D, date2 as D);
    }
}

@Pipe({
    name: 'rangeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateFormatterImpurePipe<D> extends RangeDateFormatterPipe<D> {
    transform([value1, value2]: D[] | string[]): string {
        return super.transform([value1, value2] as D[] | string[]);
    }
}

@Pipe({
    name: 'rangeShortDate'
})
export class RangeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDate(date1 as D, date2 as D);
    }
}

@Pipe({
    name: 'rangeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateFormatterImpurePipe<D> extends RangeShortDateFormatterPipe<D> {
    transform([value1, value2]: D[] | string[]): string {
        return super.transform([value1, value2] as D[] | string[]);
    }
}

@Pipe({
    name: 'rangeLongDateTime'
})
export class RangeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'rangeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateTimeFormatterImpurePipe<D> extends RangeDateTimeFormatterPipe<D> {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        return super.transform([value1, value2] as D[] | string[], options);
    }
}

@Pipe({
    name: 'rangeMiddleDateTime'
})
export class RangeMiddleDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeMiddleDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'rangeMiddleDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeMiddleDateTimeFormatterImpurePipe<D> extends RangeMiddleDateTimeFormatterPipe<D> {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        return super.transform([value1, value2] as D[] | string[], options);
    }
}

@Pipe({
    name: 'rangeShortDateTime'
})
export class RangeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({
    name: 'rangeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateTimeFormatterImpurePipe<D> extends RangeShortDateTimeFormatterPipe<D> {
    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        return super.transform([value1, value2] as D[] | string[], options);
    }
}
