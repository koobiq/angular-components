import { Component, Inject } from '@angular/core';
import { DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Basic progress relative-date-formatter
 */
@Component({
    selector: 'relative-date-formatter-example',
    templateUrl: 'relative-date-formatter-example.html',
    styleUrls: ['relative-date-formatter-example.css']
})
export class RelativeDateFormatterExample {
    formats = {
        relative: {
            long: {
                beforeYesterdayNotCurrentYear: '',

                beforeYesterdayCurrentYear: '',
                beforeYesterdayCurrentYearSeconds: '',
                beforeYesterdayCurrentYearMilliseconds: '',

                yesterday: '',
                yesterdaySeconds: '',
                yesterdayMilliseconds: '',

                today: '',
                todaySeconds: '',
                todayMilliseconds: '',

                tomorrow: '',
                tomorrowSeconds: '',
                tomorrowMilliseconds: '',

                afterTomorrowCurrentYear: '',
                afterTomorrowCurrentYearSeconds: '',
                afterTomorrowCurrentYearMilliseconds: '',

                afterTomorrowNotCurrentYear: ''
            },
            short: {
                beforeYesterdayNotCurrentYear: '',

                beforeYesterdayCurrentYear: '',
                beforeYesterdayCurrentYearSeconds: '',
                beforeYesterdayCurrentYearMilliseconds: '',

                yesterday: '',
                yesterdaySeconds: '',
                yesterdayMilliseconds: '',

                today: '',
                todaySeconds: '',
                todayMilliseconds: '',

                tomorrow: '',
                tomorrowSeconds: '',
                tomorrowMilliseconds: '',

                afterTomorrowCurrentYear: '',
                afterTomorrowCurrentYearSeconds: '',
                afterTomorrowCurrentYearMilliseconds: '',

                afterTomorrowNotCurrentYear: ''
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
        this.adapter.setLocale(locale);

        this.populateRelativeLong(locale);
        this.populateRelativeShort(locale);
    };

    private populateRelativeShort(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const short = this.formats.relative.short;
        const now = this.adapter.today();

        short.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeShortDate(now.minus({ years: 1, days: 2 }));
        short.beforeYesterdayCurrentYear = this.dateFormatter.relativeShortDate(now.minus({ days: 2 }));
        short.beforeYesterdayCurrentYearSeconds = this.dateFormatter.relativeShortDateTime(now.minus({ days: 2 }), {
            seconds: true
        });
        short.beforeYesterdayCurrentYearMilliseconds = this.dateFormatter.relativeShortDateTime(
            now.minus({ days: 2 }),
            { milliseconds: true }
        );

        short.yesterday = this.dateFormatter.relativeShortDate(now.minus({ days: 1 }));
        short.yesterdaySeconds = this.dateFormatter.relativeShortDateTime(now.minus({ days: 1 }), { seconds: true });
        short.yesterdayMilliseconds = this.dateFormatter.relativeShortDateTime(now.minus({ days: 1 }), {
            milliseconds: true
        });

        short.today = this.dateFormatter.relativeShortDate(now.minus({ hours: 1 }));
        short.todaySeconds = this.dateFormatter.relativeShortDateTime(now.minus({ hours: 1 }), { seconds: true });
        short.todayMilliseconds = this.dateFormatter.relativeShortDateTime(now.minus({ hours: 1 }), {
            milliseconds: true
        });

        short.tomorrow = this.dateFormatter.relativeShortDate(now.plus({ days: 1, hours: 1 }));
        short.tomorrowSeconds = this.dateFormatter.relativeShortDateTime(now.plus({ days: 1, hours: 1 }), {
            seconds: true
        });
        short.tomorrowMilliseconds = this.dateFormatter.relativeShortDateTime(now.plus({ days: 1, hours: 1 }), {
            milliseconds: true
        });

        short.afterTomorrowCurrentYear = this.dateFormatter.relativeShortDate(now.plus({ days: 2 }));
        short.afterTomorrowCurrentYearSeconds = this.dateFormatter.relativeShortDateTime(now.plus({ days: 2 }), {
            seconds: true
        });
        short.afterTomorrowCurrentYearMilliseconds = this.dateFormatter.relativeShortDateTime(now.plus({ days: 2 }), {
            milliseconds: true
        });

        short.afterTomorrowNotCurrentYear = this.dateFormatter.relativeShortDate(now.plus({ years: 1, days: 2 }));
    }

    private populateRelativeLong(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const long = this.formats.relative.long;
        const now = this.adapter.today();

        long.beforeYesterdayNotCurrentYear = this.dateFormatter.relativeLongDate(now.minus({ years: 1, days: 2 }));
        long.beforeYesterdayCurrentYear = this.dateFormatter.relativeLongDate(now.minus({ days: 2 }));
        long.beforeYesterdayCurrentYearSeconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 2 }), {
            seconds: true
        });
        long.beforeYesterdayCurrentYearMilliseconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 2 }), {
            milliseconds: true
        });

        long.yesterday = this.dateFormatter.relativeLongDate(now.minus({ days: 1 }));
        long.yesterdaySeconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 1 }), { seconds: true });
        long.yesterdayMilliseconds = this.dateFormatter.relativeLongDateTime(now.minus({ days: 1 }), {
            milliseconds: true
        });

        long.today = this.dateFormatter.relativeLongDate(now.minus({ hours: 1 }));
        long.todaySeconds = this.dateFormatter.relativeLongDateTime(now.minus({ hours: 1 }), { seconds: true });
        long.todayMilliseconds = this.dateFormatter.relativeLongDateTime(now.minus({ hours: 1 }), {
            milliseconds: true
        });

        long.tomorrow = this.dateFormatter.relativeLongDate(now.plus({ days: 1, hours: 1 }));
        long.tomorrowSeconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 1, hours: 1 }), {
            seconds: true
        });
        long.tomorrowMilliseconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 1, hours: 1 }), {
            milliseconds: true
        });

        long.afterTomorrowCurrentYear = this.dateFormatter.relativeLongDate(now.plus({ days: 2 }));
        long.afterTomorrowCurrentYearSeconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 2 }), {
            seconds: true
        });
        long.afterTomorrowCurrentYearMilliseconds = this.dateFormatter.relativeLongDateTime(now.plus({ days: 2 }), {
            milliseconds: true
        });

        long.afterTomorrowNotCurrentYear = this.dateFormatter.relativeLongDate(now.plus({ years: 1, days: 2 }));
    }
}
