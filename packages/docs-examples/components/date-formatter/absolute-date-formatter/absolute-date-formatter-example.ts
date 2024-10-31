import { Component, Inject } from '@angular/core';
import { DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Absolute date-formatter
 */
@Component({
    standalone: true,
    selector: 'absolute-date-formatter-example',
    templateUrl: 'absolute-date-formatter-example.html',
    styleUrl: 'absolute-date-formatter-example.css'
})
export class AbsoluteDateFormatterExample {
    formats = {
        absolute: {
            long: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearMilliseconds: '',

                    notCurrentYear: '',
                    notCurrentYearSeconds: '',
                    notCurrentYearMilliseconds: ''
                }
            },
            short: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearMilliseconds: '',

                    notCurrentYear: '',
                    notCurrentYearSeconds: '',
                    notCurrentYearMilliseconds: ''
                }
            }
        }
    };

    constructor(
        private adapter: DateAdapter<DateTime>,
        private dateFormatter: DateFormatter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService
    ) {
        this.localeService.changes.pipe(distinctUntilChanged(), delay(0)).subscribe(this.onLocaleChange);
    }

    private onLocaleChange = (locale: string) => {
        this.dateFormatter.setLocale(locale);

        this.populateAbsoluteLong();
        this.populateAbsoluteShort();
    };

    private populateAbsoluteShort() {
        const now = this.adapter.today();

        const short = this.formats.absolute.short;

        short.date.currentYear = this.dateFormatter.absoluteShortDate(now);
        short.date.notCurrentYear = this.dateFormatter.absoluteShortDate(now.minus({ years: 1 }));

        short.dateTime.currentYear = this.dateFormatter.absoluteShortDateTime(now);
        short.dateTime.currentYearSeconds = this.dateFormatter.absoluteShortDateTime(now, { seconds: true });
        short.dateTime.currentYearMilliseconds = this.dateFormatter.absoluteShortDateTime(now, { milliseconds: true });

        short.dateTime.notCurrentYear = this.dateFormatter.absoluteShortDateTime(now.minus({ years: 1 }));
        short.dateTime.notCurrentYearSeconds = this.dateFormatter.absoluteShortDateTime(now.minus({ years: 1 }), {
            seconds: true
        });
        short.dateTime.notCurrentYearMilliseconds = this.dateFormatter.absoluteShortDateTime(now.minus({ years: 1 }), {
            milliseconds: true
        });
    }

    private populateAbsoluteLong() {
        const now = this.adapter.today();

        const long = this.formats.absolute.long;

        long.date.currentYear = this.dateFormatter.absoluteLongDate(now);
        long.date.notCurrentYear = this.dateFormatter.absoluteLongDate(now.minus({ years: 1 }));

        long.dateTime.currentYear = this.dateFormatter.absoluteLongDateTime(now);
        long.dateTime.currentYearSeconds = this.dateFormatter.absoluteLongDateTime(now, { seconds: true });
        long.dateTime.currentYearMilliseconds = this.dateFormatter.absoluteLongDateTime(now, { milliseconds: true });

        long.dateTime.notCurrentYear = this.dateFormatter.absoluteLongDateTime(now.minus({ years: 1 }));
        long.dateTime.notCurrentYearSeconds = this.dateFormatter.absoluteLongDateTime(now.minus({ years: 1 }), {
            seconds: true
        });
        long.dateTime.notCurrentYearMilliseconds = this.dateFormatter.absoluteLongDateTime(now.minus({ years: 1 }), {
            milliseconds: true
        });
    }
}
