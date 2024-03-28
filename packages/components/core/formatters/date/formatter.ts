import { Inject, Injectable } from '@angular/core';
import { DateAdapter } from '@koobiq/date-adapter';
import { DateFormatter as BaseDateFormatter } from '@koobiq/date-formatter';

import { KBQ_DATE_LOCALE } from '../../datetime';


@Injectable()
export class DateFormatter<D> extends BaseDateFormatter<D> {
    constructor(
        override readonly adapter: DateAdapter<D>,
        @Inject(KBQ_DATE_LOCALE) locale: string
    ) {
        super(adapter, locale);
    }
}
