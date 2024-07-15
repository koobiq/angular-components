/* tslint:disable:no-magic-numbers */
import { Component, Inject } from '@angular/core';
import { LuxonDateAdapter } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
} from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @title Basic progress duration-date-formatter
 */
@Component({
    selector: 'duration-date-formatter-example',
    templateUrl: 'duration-date-formatter-example.html',
    styleUrls: ['duration-date-formatter-example.css'],
    providers: [
        { provide: KBQ_DATE_LOCALE, useValue: 'ru-RU' },
        { provide: DateAdapter, useClass: LuxonDateAdapter },
        { provide: DateFormatter, deps: [DateAdapter, KBQ_DATE_LOCALE] },
    ],
})
export class DurationDateFormatterExample {
    formats = {
        duration: {
            shortest: {
                withSeconds: {
                    seconds: '',
                    minutesSeconds: '',
                    withMilliseconds: '',
                    hoursMinutesSeconds: '',
                    hoursMinutes: '',
                },
                onlyMinutes: {
                    seconds: '',
                    minutesSeconds: '',
                    withMilliseconds: '',
                    hoursMinutesSeconds: '',
                    hoursMinutes: '',
                },
            },
            long: {
                seconds: '',

                minutesSeconds: '',
                minutes: '',
                minutesMoreThanHour: '',

                hoursMinutes: '',
                hoursMinutesMoreThanDay: '',
                hours: '',

                daysHours: '',
                days: '',
                daysMoreThanWeek: '',

                weeksDays: '',
                weeks: '',

                monthsWeeks: '',
                months: '',
                monthsWithFract: '',

                yearsMonth: '',
                years: '',
                yearsWithFract: '',
            },
            short: {
                secondsMilliseconds: '',
                seconds: '',

                minutesSeconds: '',
                minutes: '',
                minutesMoreThanHour: '',

                hoursMinutes: '',
                hoursMinutesMoreThanDay: '',
                hours: '',

                daysHours: '',
                days: '',
                daysMoreThanWeek: '',

                weeksDays: '',
                weeks: '',

                monthsWeeks: '',
                months: '',
                monthsWithFract: '',

                yearsMonth: '',
                years: '',
                yearsWithFract: '',
            },
        },
    };

    constructor(
        private adapter: DateAdapter<DateTime>,
        private formatter: DateFormatter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService,
    ) {
        this.localeService.changes.pipe(distinctUntilChanged(), delay(0)).subscribe(this.onLocaleChange);
    }

    private onLocaleChange = (locale: string) => {
        this.adapter.setLocale(locale);

        this.populateDurationShortest(locale);
        this.populateDurationLong(locale);
        this.populateDurationShort(locale);
    };

    private populateDurationShortest(locale: string) {
        this.formatter.setLocale(locale);

        const shortest = this.formats.duration.shortest;
        const now = this.adapter.today();
        const start = now.set({ day: 10, hour: 10, minute: 0, second: 0, millisecond: 0 });

        let end = now.set({ day: 10, hour: 10, minute: 0, second: 25 });
        shortest.withSeconds.seconds = this.formatter.durationShortest(start, end);
        shortest.onlyMinutes.seconds = this.formatter.durationShortest(start, end, false);

        end = now.set({ day: 10, hour: 10, minute: 0, second: 25, millisecond: 125 });
        shortest.withSeconds.withMilliseconds = this.formatter.durationShortest(start, end, true, true);
        shortest.onlyMinutes.withMilliseconds = this.formatter.durationShortest(start, end, false, true);

        end = now.set({ day: 10, hour: 10, minute: 2, second: 25 });
        shortest.withSeconds.minutesSeconds = this.formatter.durationShortest(start, end);
        shortest.onlyMinutes.minutesSeconds = this.formatter.durationShortest(start, end, false);

        end = now.set({ day: 12, hour: 10, minute: 2, second: 25 });
        shortest.withSeconds.hoursMinutesSeconds = this.formatter.durationShortest(start, end);
        shortest.onlyMinutes.hoursMinutesSeconds = this.formatter.durationShortest(start, end, false);
    }

    private populateDurationLong(locale: string) {
        this.formatter.setLocale(locale);

        const long = this.formats.duration.long;
        const now = this.adapter.today();
        const start = now.set({ day: 10, hour: 0, minute: 0, second: 0, millisecond: 0 });

        long.seconds = this.formatter.durationLong(start, start.plus({ second: 21 }));

        long.minutesSeconds = this.formatter.durationLong(start, start.plus({ minute: 1, second: 25 }));
        long.minutes = this.formatter.durationLong(start, start.plus({ minute: 22 }));
        long.minutesMoreThanHour = this.formatter.durationLong(start, start.plus({ hour: 2 }), ['minutes']);

        long.hoursMinutes = this.formatter.durationLong(start, start.plus({ hour: 1, minute: 21 }));
        long.hoursMinutesMoreThanDay = this.formatter.durationLong(start, start.plus({ day: 1, hour: 8, minute: 20 }), [
            'hours',
            'minutes',
        ]);
        long.hours = this.formatter.durationLong(start, start.plus({ day: 1, hour: 8, minute: 20 }), ['hours']);

        long.daysHours = this.formatter.durationLong(start, start.plus({ day: 1, hour: 8, minute: 25 }));
        long.days = this.formatter.durationLong(start, start.plus({ day: 2, hour: 8 }), ['days']);
        long.daysMoreThanWeek = this.formatter.durationLong(start, start.plus({ day: 21 }), ['days']);

        long.weeksDays = this.formatter.durationLong(start, start.plus({ day: 15 }));
        long.weeks = this.formatter.durationLong(start, start.plus({ day: 15 }), ['weeks']);

        long.monthsWeeks = this.formatter.durationLong(start, start.plus({ month: 1, day: 25 }));
        long.months = this.formatter.durationLong(start, start.plus({ month: 2 }), ['months']);
        long.monthsWithFract = this.formatter.durationLong(start, start.plus({ month: 1, day: 16 }), ['months'], true);

        long.yearsMonth = this.formatter.durationLong(start, start.plus({ year: 3, month: 11 }));
        long.years = this.formatter.durationLong(start, start.plus({ year: 5, month: 9 }), ['years']);
        long.yearsWithFract = this.formatter.durationLong(start, start.plus({ year: 5, month: 9 }), ['years'], true);
    }

    private populateDurationShort(locale: string) {
        this.formatter.setLocale(locale);

        const short = this.formats.duration.short;
        const now = this.adapter.today();
        const start = now.set({ day: 10, hour: 0, minute: 0, second: 0, millisecond: 0 });

        short.secondsMilliseconds = this.formatter.durationShort(start, start.plus({ second: 21, millisecond: 365 }), [
            'seconds',
            'milliseconds',
        ]);
        short.seconds = this.formatter.durationShort(start, start.plus({ second: 21, millisecond: 365 }));

        short.minutesSeconds = this.formatter.durationShort(start, start.plus({ minute: 1, second: 25 }));
        short.minutes = this.formatter.durationShort(start, start.plus({ minute: 22 }));
        short.minutesMoreThanHour = this.formatter.durationShort(start, start.plus({ hour: 2 }), ['minutes']);

        short.hoursMinutes = this.formatter.durationShort(start, start.plus({ hour: 1, minute: 21 }));
        short.hoursMinutesMoreThanDay = this.formatter.durationShort(
            start,
            start.plus({ day: 1, hour: 8, minute: 20 }),
            ['hours', 'minutes'],
        );
        short.hours = this.formatter.durationShort(start, start.plus({ day: 1, hour: 8, minute: 20 }), ['hours']);

        short.daysHours = this.formatter.durationShort(start, start.plus({ day: 1, hour: 8 }));
        short.days = this.formatter.durationShort(start, start.plus({ day: 2, hour: 8 }), ['days']);
        short.daysMoreThanWeek = this.formatter.durationShort(start, start.plus({ day: 15 }), ['days']);

        short.weeksDays = this.formatter.durationShort(start, start.plus({ day: 15 }));
        short.weeks = this.formatter.durationShort(start, start.plus({ day: 15 }), ['weeks']);

        short.monthsWeeks = this.formatter.durationShort(start, start.plus({ month: 1, day: 25 }));
        short.months = this.formatter.durationShort(start, start.plus({ month: 2 }), ['months']);
        short.monthsWithFract = this.formatter.durationShort(
            start,
            start.plus({ month: 2, day: 16 }),
            ['months'],
            true,
        );

        short.yearsMonth = this.formatter.durationShort(start, start.plus({ year: 3, month: 11 }));
        short.years = this.formatter.durationShort(start, start.plus({ year: 5, month: 9 }), ['years']);
        short.yearsWithFract = this.formatter.durationShort(start, start.plus({ year: 5, month: 9 }), ['years'], true);
    }
}
