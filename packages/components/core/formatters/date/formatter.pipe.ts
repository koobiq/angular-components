import { Pipe, PipeTransform } from '@angular/core';
import { DateTimeOptions } from '@koobiq/date-formatter';

import { DateAdapter } from '../../datetime';

import { DateFormatter } from './formatter';


@Pipe({ name: 'absoluteLongDate' })
export class AbsoluteDateFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDate(date, currYear) : '';
    }
}

@Pipe({ name: 'absoluteLongDateTime' })
export class AbsoluteDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteLongDateTime(date, options) : '';
    }
}

@Pipe({ name: 'absoluteShortDate' })
export class AbsoluteDateShortFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string, currYear?: boolean): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDate(date, currYear) : '';
    }
}

@Pipe({ name: 'absoluteShortDateTime' })
export class AbsoluteShortDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.absoluteShortDateTime(date, options) : '';
    }
}

@Pipe({ name: 'relativeLongDate' })
export class RelativeDateFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDate(date) : '';
    }
}

@Pipe({ name: 'relativeLongDateTime' })
export class RelativeDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeLongDateTime(date, options) : '';
    }
}

@Pipe({ name: 'relativeShortDate' })
export class RelativeShortDateFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDate(date) : '';
    }
}

@Pipe({ name: 'relativeShortDateTime' })
export class RelativeShortDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform(value: D | string, options?: DateTimeOptions): string {
        const date = this.adapter.deserialize(value);

        return date ? this.formatter.relativeShortDateTime(date, options) : '';
    }
}

@Pipe({ name: 'rangeLongDate' })
export class RangeDateFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDate(date1 as D, date2 as D);
    }
}

@Pipe({ name: 'rangeShortDate' })
export class RangeShortDateFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform([value1, value2]: D[] | string[]): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDate(date1 as D, date2 as D);
    }
}

@Pipe({ name: 'rangeLongDateTime' })
export class RangeDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeLongDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({ name: 'rangeMiddleDateTime' })
export class RangeMiddleDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeMiddleDateTime(date1 as D, date2 as D, options);
    }
}

@Pipe({ name: 'rangeShortDateTime' })
export class RangeShortDateTimeFormatterPipe<D> implements PipeTransform {
    constructor(
        private adapter: DateAdapter<D>,
        private formatter: DateFormatter<D>
    ) {}

    transform([value1, value2]: D[] | string[], options?: DateTimeOptions): string {
        const date1 = this.adapter.deserialize(value1);
        const date2 = this.adapter.deserialize(value2);

        return this.formatter.rangeShortDateTime(date1 as D, date2 as D, options);
    }
}
