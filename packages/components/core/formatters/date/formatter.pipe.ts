import { inject, Pipe, PipeTransform } from '@angular/core';
import { DateTimeOptions } from '@koobiq/date-formatter';
import { DateAdapter } from '../../datetime';
import { DateFormatter } from './formatter';

export class BaseFormatterPipe<D> {
    protected readonly adapter: DateAdapter<D> = inject(DateAdapter<D>);
    protected readonly formatter: DateFormatter<D> = inject(DateFormatter<D>);
}

@Pipe({
    standalone: true,
    name: 'absoluteLongDate'
})
export class AbsoluteDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'absoluteLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateFormatterImpurePipe<D> extends AbsoluteDateFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'absoluteLongDateTime'
})
export class AbsoluteDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'absoluteLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateTimeFormatterImpurePipe<D> extends AbsoluteDateTimeFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'absoluteShortDate'
})
export class AbsoluteDateShortFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'absoluteShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteDateShortFormatterImpurePipe<D> extends AbsoluteDateShortFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'absoluteShortDateTime'
})
export class AbsoluteShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'absoluteShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class AbsoluteShortDateTimeFormatterImpurePipe<D> extends AbsoluteShortDateTimeFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'relativeLongDate'
})
export class RelativeDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'relativeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateFormatterImpurePipe<D> extends RelativeDateFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'relativeLongDateTime'
})
export class RelativeDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'relativeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeDateTimeFormatterImpurePipe<D> extends RelativeDateTimeFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'relativeShortDate'
})
export class RelativeShortDateFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'relativeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateFormatterImpurePipe<D> extends RelativeShortDateFormatterPipe<D> {}

@Pipe({
    standalone: true,
    name: 'relativeShortDateTime'
})
export class RelativeShortDateTimeFormatterPipe<D> extends BaseFormatterPipe<D> implements PipeTransform {
    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({
    standalone: true,
    name: 'relativeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RelativeShortDateTimeFormatterImpurePipe<D> extends RelativeShortDateTimeFormatterPipe<D> {}

@Pipe({
    standalone: true,
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
    standalone: true,
    name: 'rangeLongDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateFormatterImpurePipe<D> extends RangeDateFormatterPipe<D> {}

@Pipe({
    standalone: true,
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
    standalone: true,
    name: 'rangeShortDateImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateFormatterImpurePipe<D> extends RangeShortDateFormatterPipe<D> {}

@Pipe({
    standalone: true,
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
    standalone: true,
    name: 'rangeLongDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeDateTimeFormatterImpurePipe<D> extends RangeDateTimeFormatterPipe<D> {}

@Pipe({
    standalone: true,
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
    standalone: true,
    name: 'rangeMiddleDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeMiddleDateTimeFormatterImpurePipe<D> extends RangeMiddleDateTimeFormatterPipe<D> {}

@Pipe({
    standalone: true,
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
    standalone: true,
    name: 'rangeShortDateTimeImpurePipe',
    pure: false
})
// eslint-disable-next-line @angular-eslint/use-pipe-transform-interface
export class RangeShortDateTimeFormatterImpurePipe<D> extends RangeShortDateTimeFormatterPipe<D> {}
