// tslint:disable:no-console
// tslint:disable:no-magic-numbers
import { ChangeDetectorRef, Component, Inject, NgModule, ViewEncapsulation } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
    KBQ_LUXON_DATE_ADAPTER_OPTIONS,
    KBQ_LUXON_DATE_FORMATS,
    LuxonDateAdapter,
} from '@koobiq/angular-luxon-adapter/adapter';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    DateAdapter,
    DateFormatter,
    KBQ_DATE_FORMATS,
    KBQ_DATE_LOCALE,
    KBQ_LOCALE_SERVICE,
    KbqFormattersModule,
    KbqLocaleService,
    KbqLocaleServiceModule,
} from '@koobiq/components/core';
import { KbqRadioChange, KbqRadioModule } from '@koobiq/components/radio';
import { DateTime } from 'luxon';
import { delay, distinctUntilChanged } from 'rxjs';

@Component({
    selector: 'app',
    templateUrl: 'template.html',
    styleUrls: ['../main.scss', 'styles.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class DemoComponent {
    lang = {
        absolute: {
            long: {
                date: {
                    currentYear: '',
                    currentYearForced: '',
                    notCurrentYear: '',
                },
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearSecondsForced: '',
                    currentYearMilliseconds: '',

                    notCurrentYear: '',
                    notCurrentYearSeconds: '',
                    notCurrentYearMilliseconds: '',
                },
            },
            short: {
                date: {
                    currentYear: '',
                    currentYearForced: '',
                    notCurrentYear: '',
                },
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearSecondsForced: '',
                    currentYearMilliseconds: '',

                    notCurrentYear: '',
                    notCurrentYearSeconds: '',
                    notCurrentYearMilliseconds: '',
                },
            },
        },
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

                afterTomorrowNotCurrentYear: '',
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

                afterTomorrowNotCurrentYear: '',
            },
        },
        closedRange: {
            long: {
                date: {
                    currentMonth: '',
                    currentMonthNotCurrentYear: '',
                    notCurrentYear: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: '',
                },
                dateTime: {
                    startsNotCurrentYear: '',
                    startsNotCurrentYearSeconds: '',
                    startsNotCurrentYearMilliseconds: '',

                    endsNotCurrentYear: '',
                    endsNotCurrentYearSeconds: '',
                    endsNotCurrentYearMilliseconds: '',

                    sameDateCurrentYear: '',
                    sameDateCurrentYearSeconds: '',
                    sameDateCurrentYearMilliseconds: '',

                    sameDateNotCurrentYear: '',
                    sameDateNotCurrentYearSeconds: '',
                    sameDateNotCurrentYearMilliseconds: '',

                    notCurrentMonth: '',
                    notCurrentMonthSeconds: '',
                    notCurrentMonthMilliseconds: '',
                },
            },
            middle: {
                dateTime: {
                    currentYear: '',
                    currentYearSeconds: '',
                    currentYearMilliseconds: '',

                    sameDateCurrentYear: '',
                    sameDateCurrentYearSeconds: '',
                    sameDateCurrentYearMilliseconds: '',

                    sameDateNotCurrentYear: '',
                    sameDateNotCurrentYearSeconds: '',
                    sameDateNotCurrentYearMilliseconds: '',

                    notCurrentMonth: '',
                    notCurrentMonthSeconds: '',
                    notCurrentMonthMilliseconds: '',

                    startsNotCurrentYear: '',
                    startsNotCurrentYearSeconds: '',
                    startsNotCurrentYearMilliseconds: '',

                    endsNotCurrentYear: '',
                    endsNotCurrentYearSeconds: '',
                    endsNotCurrentYearMilliseconds: '',
                },
            },
            short: {
                date: {
                    currentMonth: '',
                    currentMonthNotCurrentYear: '',
                    notCurrentYear: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: '',
                },
                dateTime: {
                    sameDateCurrentYear: '',
                    sameDateCurrentYearSeconds: '',
                    sameDateCurrentYearMilliseconds: '',

                    sameDateNotCurrentYear: '',
                    sameDateNotCurrentYearSeconds: '',
                    sameDateNotCurrentYearMilliseconds: '',

                    notCurrentMonth: '',
                    notCurrentMonthSeconds: '',
                    notCurrentMonthMilliseconds: '',

                    startsNotCurrentYear: '',
                    startsNotCurrentYearSeconds: '',
                    startsNotCurrentYearMilliseconds: '',

                    endsNotCurrentYear: '',
                    endsNotCurrentYearSeconds: '',
                    endsNotCurrentYearMilliseconds: '',
                },
            },
        },
        openedRange: {
            long: {
                date: {
                    onlyStart: '',
                    onlyStartNotCurrentYear: '',
                    onlyEnd: '',
                    onlyEndNotCurrentYear: '',
                },
                dateTime: {
                    onlyStart: '',
                    onlyStartSeconds: '',
                    onlyStartMilliseconds: '',

                    onlyStartNotCurrentYear: '',
                    onlyStartNotCurrentYearSeconds: '',
                    onlyStartNotCurrentYearMilliseconds: '',

                    onlyEnd: '',
                    onlyEndSeconds: '',
                    onlyEndMilliseconds: '',

                    onlyEndNotCurrentYear: '',
                    onlyEndNotCurrentYearSeconds: '',
                    onlyEndNotCurrentYearMilliseconds: '',
                },
            },
            short: {
                date: {
                    onlyStart: '',
                    onlyStartNotCurrentYear: '',
                    onlyEnd: '',
                    onlyEndNotCurrentYear: '',
                },
                dateTime: {
                    onlyStart: '',
                    onlyStartSeconds: '',
                    onlyStartMilliseconds: '',

                    onlyStartNotCurrentYear: '',
                    onlyStartNotCurrentYearSeconds: '',
                    onlyStartNotCurrentYearMilliseconds: '',

                    onlyEnd: '',
                    onlyEndSeconds: '',
                    onlyEndMilliseconds: '',

                    onlyEndNotCurrentYear: '',
                    onlyEndNotCurrentYearSeconds: '',
                    onlyEndNotCurrentYearMilliseconds: '',
                },
            },
        },
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

    languageList: { id: string; name: string }[];
    selectedLanguage!: { id: string; name: string };

    constructor(
        private cdr: ChangeDetectorRef,
        public formatter: DateFormatter<DateTime>,
        public adapter: DateAdapter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) public localeService: KbqLocaleService,
    ) {
        this.languageList = this.localeService.locales.items;
        this.selectedLanguage =
            this.languageList.find(({ id }) => id === this.localeService.id) || this.languageList[0];

        this.localeService.changes.pipe(distinctUntilChanged(), delay(0)).subscribe(this.onLocaleChange);
    }

    setLocale($event: KbqRadioChange) {
        this.selectedLanguage = this.languageList.find(({ id }) => id === $event.value.id) || this.languageList[0];
        this.localeService.setLocale($event.value.id);
    }

    private onLocaleChange = (locale: string) => {
        this.populateAbsoluteLong(locale);
        this.populateAbsoluteShort(locale);
        this.populateRelativeLong(locale);
        this.populateRelativeShort(locale);
        this.populateRangeLong(locale);
        this.populateRangeMiddle(locale);
        this.populateRangeShort(locale);
        this.populateOpenedRangeLong(locale);
        this.populateOpenedRangeShort(locale);

        this.populateDurationNumbers(locale);
        this.populateDurationTextLong(locale);
        this.populateDurationTextShort(locale);

        this.cdr.markForCheck();
    };

    private populateRangeShort(locale: string) {
        this.formatter.setLocale(locale);

        const shortRange = this.lang.closedRange.short;
        const now = this.adapter.today();

        shortRange.date.currentMonth = this.formatter.rangeShortDate(now.set({ day: 1 }), now.set({ day: 10 }));
        shortRange.date.currentMonthNotCurrentYear = this.formatter.rangeShortDate(
            now.set({ day: 1 }).plus({ years: 1 }),
            now.set({ day: 10 }).plus({ years: 1 }),
        );
        shortRange.date.notCurrentYear = this.formatter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 }),
        );
        shortRange.date.startsNotCurrentYear = this.formatter.rangeShortDate(
            now.set({ day: 1, month: 1 }).minus({ years: 1 }),
            now.set({ day: 10, month: 2 }),
        );
        shortRange.date.endsNotCurrentYear = this.formatter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 }).plus({ years: 1 }),
        );

        shortRange.dateTime.sameDateCurrentYear = this.formatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
        );
        shortRange.dateTime.sameDateCurrentYearSeconds = this.formatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            { seconds: true },
        );
        shortRange.dateTime.sameDateCurrentYearMilliseconds = this.formatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        shortRange.dateTime.sameDateNotCurrentYear = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
        );
        shortRange.dateTime.sameDateNotCurrentYearSeconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { seconds: true },
        );
        shortRange.dateTime.sameDateNotCurrentYearMilliseconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        shortRange.dateTime.notCurrentMonth = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
        );
        shortRange.dateTime.notCurrentMonthSeconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { seconds: true },
        );
        shortRange.dateTime.notCurrentMonthMilliseconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        shortRange.dateTime.startsNotCurrentYear = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
        );
        shortRange.dateTime.startsNotCurrentYearSeconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { seconds: true },
        );
        shortRange.dateTime.startsNotCurrentYearMilliseconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        shortRange.dateTime.endsNotCurrentYear = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
        );
        shortRange.dateTime.endsNotCurrentYearSeconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { seconds: true },
        );
        shortRange.dateTime.endsNotCurrentYearMilliseconds = this.formatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { milliseconds: true },
        );
    }

    private populateOpenedRangeLong(locale: string) {
        this.formatter.setLocale(locale);

        const longOpenedRange = this.lang.openedRange.long;
        const now = this.adapter.today();
        const formatterTemplate = this.formatter.config.rangeTemplates.openedRange.long;

        longOpenedRange.date.onlyStart = this.formatter.openedRangeDate(now, null, formatterTemplate);
        longOpenedRange.date.onlyEnd = this.formatter.openedRangeDate(null, now, formatterTemplate);
        longOpenedRange.date.onlyStartNotCurrentYear = this.formatter.openedRangeDate(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
        );
        longOpenedRange.date.onlyEndNotCurrentYear = this.formatter.openedRangeDate(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
        );

        longOpenedRange.dateTime.onlyStart = this.formatter.openedRangeDateTime(now, null, formatterTemplate);
        longOpenedRange.dateTime.onlyStartSeconds = this.formatter.openedRangeDateTime(
            now,
            null,
            formatterTemplate,
            true,
        );
        longOpenedRange.dateTime.onlyStartMilliseconds = this.formatter.openedRangeDateTime(
            now,
            null,
            formatterTemplate,
            false,
            true,
        );

        longOpenedRange.dateTime.onlyStartNotCurrentYear = this.formatter.openedRangeDateTime(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
        );
        longOpenedRange.dateTime.onlyStartNotCurrentYearSeconds = this.formatter.openedRangeDateTime(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
            true,
        );
        longOpenedRange.dateTime.onlyStartNotCurrentYearMilliseconds = this.formatter.openedRangeDateTime(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
            false,
            true,
        );

        longOpenedRange.dateTime.onlyEnd = this.formatter.openedRangeDateTime(null, now, formatterTemplate);
        longOpenedRange.dateTime.onlyEndSeconds = this.formatter.openedRangeDateTime(
            null,
            now,
            formatterTemplate,
            true,
        );
        longOpenedRange.dateTime.onlyEndMilliseconds = this.formatter.openedRangeDateTime(
            null,
            now,
            formatterTemplate,
            false,
            true,
        );

        longOpenedRange.dateTime.onlyEndNotCurrentYear = this.formatter.openedRangeDateTime(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
        );
        longOpenedRange.dateTime.onlyEndNotCurrentYearSeconds = this.formatter.openedRangeDateTime(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
            true,
        );
        longOpenedRange.dateTime.onlyEndNotCurrentYearMilliseconds = this.formatter.openedRangeDateTime(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
            false,
            true,
        );
    }

    private populateOpenedRangeShort(locale: string) {
        this.formatter.setLocale(locale);

        const shortOpenedRange = this.lang.openedRange.short;
        const now = this.adapter.today();
        const formatterTemplate = this.formatter.config.rangeTemplates.openedRange.short;

        shortOpenedRange.date.onlyStart = this.formatter.openedRangeDate(now, null, formatterTemplate);
        shortOpenedRange.date.onlyEnd = this.formatter.openedRangeDate(null, now, formatterTemplate);
        shortOpenedRange.date.onlyStartNotCurrentYear = this.formatter.openedRangeDate(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
        );
        shortOpenedRange.date.onlyEndNotCurrentYear = this.formatter.openedRangeDate(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
        );

        shortOpenedRange.dateTime.onlyStart = this.formatter.openedRangeDateTime(now, null, formatterTemplate);
        shortOpenedRange.dateTime.onlyStartSeconds = this.formatter.openedRangeDateTime(
            now,
            null,
            formatterTemplate,
            true,
        );
        shortOpenedRange.dateTime.onlyStartMilliseconds = this.formatter.openedRangeDateTime(
            now,
            null,
            formatterTemplate,
            false,
            true,
        );

        shortOpenedRange.dateTime.onlyStartNotCurrentYear = this.formatter.openedRangeDateTime(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
        );
        shortOpenedRange.dateTime.onlyStartNotCurrentYearSeconds = this.formatter.openedRangeDateTime(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
            true,
        );
        shortOpenedRange.dateTime.onlyStartNotCurrentYearMilliseconds = this.formatter.openedRangeDateTime(
            now.plus({ years: 1 }),
            null,
            formatterTemplate,
            false,
            true,
        );

        shortOpenedRange.dateTime.onlyEnd = this.formatter.openedRangeDateTime(null, now, formatterTemplate);
        shortOpenedRange.dateTime.onlyEndSeconds = this.formatter.openedRangeDateTime(
            null,
            now,
            formatterTemplate,
            true,
        );
        shortOpenedRange.dateTime.onlyEndMilliseconds = this.formatter.openedRangeDateTime(
            null,
            now,
            formatterTemplate,
            false,
            true,
        );

        shortOpenedRange.dateTime.onlyEndNotCurrentYear = this.formatter.openedRangeDateTime(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
        );
        shortOpenedRange.dateTime.onlyEndNotCurrentYearSeconds = this.formatter.openedRangeDateTime(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
            true,
        );
        shortOpenedRange.dateTime.onlyEndNotCurrentYearMilliseconds = this.formatter.openedRangeDateTime(
            null,
            now.plus({ years: 1 }),
            formatterTemplate,
            false,
            true,
        );
    }

    private populateRangeMiddle(locale: string) {
        this.formatter.setLocale(locale);

        const middleRange = this.lang.closedRange.middle;
        const now = this.adapter.today();

        middleRange.dateTime.currentYear = this.formatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
        );

        middleRange.dateTime.currentYearSeconds = this.formatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
            { seconds: true },
        );

        middleRange.dateTime.currentYearMilliseconds = this.formatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
            { milliseconds: true },
        );

        middleRange.dateTime.sameDateCurrentYear = this.formatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
        );
        middleRange.dateTime.sameDateCurrentYearSeconds = this.formatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
            { seconds: true },
        );
        middleRange.dateTime.sameDateCurrentYearMilliseconds = this.formatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
            { milliseconds: true },
        );

        middleRange.dateTime.sameDateNotCurrentYear = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
        );
        middleRange.dateTime.sameDateNotCurrentYearSeconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { seconds: true },
        );
        middleRange.dateTime.sameDateNotCurrentYearMilliseconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        middleRange.dateTime.notCurrentMonth = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
        );
        middleRange.dateTime.notCurrentMonthSeconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { seconds: true },
        );
        middleRange.dateTime.notCurrentMonthMilliseconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        middleRange.dateTime.startsNotCurrentYear = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
        );
        middleRange.dateTime.startsNotCurrentYearSeconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
            { seconds: true },
        );
        middleRange.dateTime.startsNotCurrentYearMilliseconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        middleRange.dateTime.endsNotCurrentYear = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
        );
        middleRange.dateTime.endsNotCurrentYearSeconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { seconds: true },
        );
        middleRange.dateTime.endsNotCurrentYearMilliseconds = this.formatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { milliseconds: true },
        );
    }

    private populateRangeLong(locale: string) {
        this.formatter.setLocale(locale);

        const longRange = this.lang.closedRange.long;
        const now = this.adapter.today();

        longRange.date.currentMonth = this.formatter.rangeLongDate(now.set({ day: 1 }), now.set({ day: 10 }));
        longRange.date.currentMonthNotCurrentYear = this.formatter.rangeLongDate(
            now.set({ day: 1 }).plus({ years: 1 }),
            now.set({ day: 10 }).plus({ years: 1 }),
        );
        longRange.date.notCurrentYear = this.formatter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 }),
        );
        longRange.date.startsNotCurrentYear = this.formatter.rangeLongDate(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }),
            now.set({ month: 2, day: 10 }),
        );
        longRange.date.endsNotCurrentYear = this.formatter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 }).plus({ years: 1 }),
        );
        longRange.dateTime.sameDateCurrentYear = this.formatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
        );
        longRange.dateTime.sameDateCurrentYearSeconds = this.formatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            { seconds: true },
        );
        longRange.dateTime.sameDateCurrentYearMilliseconds = this.formatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        longRange.dateTime.sameDateNotCurrentYear = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
        );
        longRange.dateTime.sameDateNotCurrentYearSeconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { seconds: true },
        );
        longRange.dateTime.sameDateNotCurrentYearMilliseconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        longRange.dateTime.notCurrentMonth = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
        );
        longRange.dateTime.notCurrentMonthSeconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { seconds: true },
        );
        longRange.dateTime.notCurrentMonthMilliseconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        longRange.dateTime.startsNotCurrentYear = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
        );
        longRange.dateTime.startsNotCurrentYearSeconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { seconds: true },
        );
        longRange.dateTime.startsNotCurrentYearMilliseconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            { milliseconds: true },
        );

        longRange.dateTime.endsNotCurrentYear = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
        );
        longRange.dateTime.endsNotCurrentYearSeconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { seconds: true },
        );
        longRange.dateTime.endsNotCurrentYearMilliseconds = this.formatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            { milliseconds: true },
        );
    }

    private populateRelativeShort(locale: string) {
        this.formatter.setLocale(locale);

        const relativeShort = this.lang.relative.short;
        const now = this.adapter.today();

        relativeShort.beforeYesterdayNotCurrentYear = this.formatter.relativeShortDate(
            now.minus({ years: 1, days: 2 }),
        );
        relativeShort.beforeYesterdayCurrentYear = this.formatter.relativeShortDate(now.minus({ days: 2 }));
        relativeShort.beforeYesterdayCurrentYearSeconds = this.formatter.relativeShortDateTime(now.minus({ days: 2 }), {
            seconds: true,
        });
        relativeShort.beforeYesterdayCurrentYearMilliseconds = this.formatter.relativeShortDateTime(
            now.minus({ days: 2 }),
            { milliseconds: true },
        );

        relativeShort.yesterday = this.formatter.relativeShortDate(now.minus({ days: 1 }));
        relativeShort.yesterdaySeconds = this.formatter.relativeShortDateTime(now.minus({ days: 1 }), {
            seconds: true,
        });
        relativeShort.yesterdayMilliseconds = this.formatter.relativeShortDateTime(now.minus({ days: 1 }), {
            milliseconds: true,
        });

        relativeShort.today = this.formatter.relativeShortDate(now.minus({ hours: 1 }));
        relativeShort.todaySeconds = this.formatter.relativeShortDateTime(now.minus({ hours: 1 }), { seconds: true });
        relativeShort.todayMilliseconds = this.formatter.relativeShortDateTime(now.minus({ hours: 1 }), {
            milliseconds: true,
        });

        relativeShort.tomorrow = this.formatter.relativeShortDate(now.plus({ days: 1, hours: 1 }));
        relativeShort.tomorrowSeconds = this.formatter.relativeShortDateTime(now.plus({ days: 1, hours: 1 }), {
            seconds: true,
        });
        relativeShort.tomorrowMilliseconds = this.formatter.relativeShortDateTime(now.plus({ days: 1, hours: 1 }), {
            milliseconds: true,
        });

        relativeShort.afterTomorrowCurrentYear = this.formatter.relativeShortDate(now.plus({ days: 2 }));
        relativeShort.afterTomorrowCurrentYearSeconds = this.formatter.relativeShortDateTime(now.plus({ days: 2 }), {
            seconds: true,
        });
        relativeShort.afterTomorrowCurrentYearMilliseconds = this.formatter.relativeShortDateTime(
            now.plus({ days: 2 }),
            { milliseconds: true },
        );

        relativeShort.afterTomorrowNotCurrentYear = this.formatter.relativeShortDate(now.plus({ years: 1, days: 2 }));
    }

    private populateRelativeLong(locale: string) {
        this.formatter.setLocale(locale);

        const relativeLong = this.lang.relative.long;
        const now = this.adapter.today();

        relativeLong.beforeYesterdayNotCurrentYear = this.formatter.relativeLongDate(now.minus({ years: 1, days: 2 }));
        relativeLong.beforeYesterdayCurrentYear = this.formatter.relativeLongDate(now.minus({ days: 2 }));
        relativeLong.beforeYesterdayCurrentYearSeconds = this.formatter.relativeLongDateTime(now.minus({ days: 2 }), {
            seconds: true,
        });
        relativeLong.beforeYesterdayCurrentYearMilliseconds = this.formatter.relativeLongDateTime(
            now.minus({ days: 2 }),
            { milliseconds: true },
        );

        relativeLong.yesterday = this.formatter.relativeLongDate(now.minus({ days: 1 }));
        relativeLong.yesterdaySeconds = this.formatter.relativeLongDateTime(now.minus({ days: 1 }), { seconds: true });
        relativeLong.yesterdayMilliseconds = this.formatter.relativeLongDateTime(now.minus({ days: 1 }), {
            milliseconds: true,
        });

        relativeLong.today = this.formatter.relativeLongDate(now.minus({ hours: 1 }));
        relativeLong.todaySeconds = this.formatter.relativeLongDateTime(now.minus({ hours: 1 }), { seconds: true });
        relativeLong.todayMilliseconds = this.formatter.relativeLongDateTime(now.minus({ hours: 1 }), {
            milliseconds: true,
        });

        relativeLong.tomorrow = this.formatter.relativeLongDate(now.plus({ days: 1, hours: 1 }));
        relativeLong.tomorrowSeconds = this.formatter.relativeLongDateTime(now.plus({ days: 1, hours: 1 }), {
            seconds: true,
        });
        relativeLong.tomorrowMilliseconds = this.formatter.relativeLongDateTime(now.plus({ days: 1, hours: 1 }), {
            milliseconds: true,
        });

        relativeLong.afterTomorrowCurrentYear = this.formatter.relativeLongDate(now.plus({ days: 2 }));
        relativeLong.afterTomorrowCurrentYearSeconds = this.formatter.relativeLongDateTime(now.plus({ days: 2 }), {
            seconds: true,
        });
        relativeLong.afterTomorrowCurrentYearMilliseconds = this.formatter.relativeLongDateTime(now.plus({ days: 2 }), {
            milliseconds: true,
        });

        relativeLong.afterTomorrowNotCurrentYear = this.formatter.relativeLongDate(now.plus({ years: 1, days: 2 }));
    }

    private populateAbsoluteShort(locale: string) {
        this.formatter.setLocale(locale);

        const absoluteShort = this.lang.absolute.short;
        const now = this.adapter.today();

        absoluteShort.date.currentYear = this.formatter.absoluteShortDate(now);
        absoluteShort.date.currentYearForced = this.formatter.absoluteShortDate(now, true);
        absoluteShort.date.notCurrentYear = this.formatter.absoluteShortDate(now.minus({ years: 1 }));

        absoluteShort.dateTime.currentYear = this.formatter.absoluteShortDateTime(now);
        absoluteShort.dateTime.currentYearSeconds = this.formatter.absoluteShortDateTime(now, { seconds: true });
        absoluteShort.dateTime.currentYearSecondsForced = this.formatter.absoluteShortDateTime(now, {
            seconds: true,
            currYear: true,
        });
        absoluteShort.dateTime.currentYearMilliseconds = this.formatter.absoluteShortDateTime(now, {
            milliseconds: true,
        });

        absoluteShort.dateTime.notCurrentYear = this.formatter.absoluteShortDateTime(now.minus({ years: 1 }));
        absoluteShort.dateTime.notCurrentYearSeconds = this.formatter.absoluteShortDateTime(now.minus({ years: 1 }), {
            seconds: true,
        });
        absoluteShort.dateTime.notCurrentYearMilliseconds = this.formatter.absoluteShortDateTime(
            now.minus({ years: 1 }),
            { milliseconds: true },
        );
    }

    private populateAbsoluteLong(locale: string) {
        this.formatter.setLocale(locale);

        const absoluteLong = this.lang.absolute.long;
        const now = this.adapter.today();

        absoluteLong.date.currentYear = this.formatter.absoluteLongDate(now);
        absoluteLong.date.currentYearForced = this.formatter.absoluteLongDate(now, true);
        absoluteLong.date.notCurrentYear = this.formatter.absoluteLongDate(now.minus({ years: 1 }));

        absoluteLong.dateTime.currentYear = this.formatter.absoluteLongDateTime(now);
        absoluteLong.dateTime.currentYearSeconds = this.formatter.absoluteLongDateTime(now, { seconds: true });
        absoluteLong.dateTime.currentYearSecondsForced = this.formatter.absoluteLongDateTime(now, {
            seconds: true,
            currYear: true,
        });
        absoluteLong.dateTime.currentYearMilliseconds = this.formatter.absoluteLongDateTime(now, {
            milliseconds: true,
        });

        absoluteLong.dateTime.notCurrentYear = this.formatter.absoluteLongDateTime(now.minus({ years: 1 }));
        absoluteLong.dateTime.notCurrentYearSeconds = this.formatter.absoluteLongDateTime(now.minus({ years: 1 }), {
            seconds: true,
        });
        absoluteLong.dateTime.notCurrentYearMilliseconds = this.formatter.absoluteLongDateTime(
            now.minus({ years: 1 }),
            { milliseconds: true },
        );
    }

    private populateDurationNumbers(locale: string) {
        this.formatter.setLocale(locale);

        const durationNumbers = this.lang.duration.shortest;
        const now = this.adapter.today();
        const start = now.set({ day: 10, hour: 10, minute: 0, second: 0, millisecond: 0 });

        let end = now.set({ day: 10, hour: 10, minute: 0, second: 25 });
        durationNumbers.withSeconds.seconds = this.formatter.durationShortest(start, end);
        durationNumbers.onlyMinutes.seconds = this.formatter.durationShortest(start, end, false);

        end = now.set({ day: 10, hour: 10, minute: 0, second: 25, millisecond: 125 });
        durationNumbers.withSeconds.withMilliseconds = this.formatter.durationShortest(start, end, true, true);
        durationNumbers.onlyMinutes.withMilliseconds = this.formatter.durationShortest(start, end, false, true);

        end = now.set({ day: 10, hour: 10, minute: 2, second: 25 });
        durationNumbers.withSeconds.minutesSeconds = this.formatter.durationShortest(start, end);
        durationNumbers.onlyMinutes.minutesSeconds = this.formatter.durationShortest(start, end, false);

        end = now.set({ day: 12, hour: 10, minute: 2, second: 25 });
        durationNumbers.withSeconds.hoursMinutesSeconds = this.formatter.durationShortest(start, end);
        durationNumbers.onlyMinutes.hoursMinutesSeconds = this.formatter.durationShortest(start, end, false);
    }

    private populateDurationTextLong(locale: string) {
        this.formatter.setLocale(locale);

        const duration = this.lang.duration.long;
        const now = this.adapter.today();
        const start = now.set({ day: 10, hour: 0, minute: 0, second: 0, millisecond: 0 });

        duration.seconds = this.formatter.durationLong(start, start.plus({ second: 21 }));

        duration.minutesSeconds = this.formatter.durationLong(start, start.plus({ minute: 1, second: 25 }));
        duration.minutes = this.formatter.durationLong(start, start.plus({ minute: 22 }));
        duration.minutesMoreThanHour = this.formatter.durationLong(start, start.plus({ hour: 2 }), ['minutes']);

        duration.hoursMinutes = this.formatter.durationLong(start, start.plus({ hour: 1, minute: 21 }));
        duration.hoursMinutesMoreThanDay = this.formatter.durationLong(
            start,
            start.plus({ day: 1, hour: 8, minute: 20 }),
            ['hours', 'minutes'],
        );
        duration.hours = this.formatter.durationLong(start, start.plus({ day: 1, hour: 8, minute: 20 }), ['hours']);

        duration.daysHours = this.formatter.durationLong(start, start.plus({ day: 1, hour: 8, minute: 25 }));
        duration.days = this.formatter.durationLong(start, start.plus({ day: 2, hour: 8 }), ['days']);
        duration.daysMoreThanWeek = this.formatter.durationLong(start, start.plus({ day: 21 }), ['days']);

        duration.weeksDays = this.formatter.durationLong(start, start.plus({ day: 15 }));
        duration.weeks = this.formatter.durationLong(start, start.plus({ day: 15 }), ['weeks']);

        duration.monthsWeeks = this.formatter.durationLong(start, start.plus({ month: 1, day: 25 }));
        duration.months = this.formatter.durationLong(start, start.plus({ month: 2 }), ['months']);
        duration.monthsWithFract = this.formatter.durationLong(
            start,
            start.plus({ month: 2, day: 16 }),
            ['months'],
            true,
        );

        duration.yearsMonth = this.formatter.durationLong(start, start.plus({ year: 3, month: 11 }));
        duration.years = this.formatter.durationLong(start, start.plus({ year: 5, month: 9 }), ['years']);
        duration.yearsWithFract = this.formatter.durationLong(
            start,
            start.plus({ year: 5, month: 9 }),
            ['years'],
            true,
        );
    }

    private populateDurationTextShort(locale: string) {
        this.formatter.setLocale(locale);

        const duration = this.lang.duration.short;
        const now = this.adapter.today();
        const start = now.set({ day: 10, hour: 0, minute: 0, second: 0, millisecond: 0 });

        duration.secondsMilliseconds = this.formatter.durationShort(
            start,
            start.plus({ second: 21, millisecond: 365 }),
            ['seconds', 'milliseconds'],
        );
        duration.seconds = this.formatter.durationShort(start, start.plus({ second: 21, millisecond: 365 }));

        duration.minutesSeconds = this.formatter.durationShort(start, start.plus({ minute: 1, second: 25 }));
        duration.minutes = this.formatter.durationShort(start, start.plus({ minute: 22 }));
        duration.minutesMoreThanHour = this.formatter.durationShort(start, start.plus({ hour: 2 }), ['minutes']);

        duration.hoursMinutes = this.formatter.durationShort(start, start.plus({ hour: 1, minute: 21 }));
        duration.hoursMinutesMoreThanDay = this.formatter.durationShort(
            start,
            start.plus({ day: 1, hour: 8, minute: 20 }),
            ['hours', 'minutes'],
        );
        duration.hours = this.formatter.durationShort(start, start.plus({ day: 1, hour: 8, minute: 20 }), ['hours']);

        duration.daysHours = this.formatter.durationShort(start, start.plus({ day: 1, hour: 8 }));
        duration.days = this.formatter.durationShort(start, start.plus({ day: 2, hour: 8 }), ['days']);
        duration.daysMoreThanWeek = this.formatter.durationShort(start, start.plus({ day: 15 }), ['days']);

        duration.weeksDays = this.formatter.durationShort(start, start.plus({ day: 15 }));
        duration.weeks = this.formatter.durationShort(start, start.plus({ day: 15 }), ['weeks']);

        duration.monthsWeeks = this.formatter.durationShort(start, start.plus({ month: 1, day: 25 }));
        duration.months = this.formatter.durationShort(start, start.plus({ month: 2 }), ['months']);
        duration.monthsWithFract = this.formatter.durationShort(
            start,
            start.plus({ month: 2, day: 16 }),
            ['months'],
            true,
        );

        duration.yearsMonth = this.formatter.durationShort(start, start.plus({ year: 3, month: 11 }));
        duration.years = this.formatter.durationShort(start, start.plus({ year: 1 }), ['years']);
        duration.yearsWithFract = this.formatter.durationShort(
            start,
            start.plus({ year: 5, month: 9 }),
            ['years'],
            true,
        );
    }
}

@NgModule({
    declarations: [DemoComponent],
    imports: [
        BrowserModule,
        KbqLocaleServiceModule,
        KbqFormattersModule,
        KbqButtonModule,
        KbqRadioModule,
    ],
    bootstrap: [DemoComponent],
    providers: [
        { provide: KBQ_DATE_FORMATS, useValue: KBQ_LUXON_DATE_FORMATS },
        {
            provide: DateAdapter,
            useClass: LuxonDateAdapter,
            deps: [KBQ_DATE_LOCALE, KBQ_LUXON_DATE_ADAPTER_OPTIONS, KBQ_LOCALE_SERVICE],
        },
        // { provide: KBQ_LOCALE_ID, useValue: 'en-US' },
        // { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' }
        // {
        //     provide: KBQ_LOCALE_SERVICE,
        //     useFactory: (locale: string) => {
        //         return new KbqLocaleService(locale, KBQ_DEFAULT_LOCALE_DATA_FACTORY());
        //     },
        //     deps: [KBQ_LOCALE_ID]
        // },
        // {
        //     provide: KBQ_LOCALE_SERVICE,
        //     useFactory: () => {
        //         return new KbqLocaleService('en-US', KBQ_DEFAULT_LOCALE_DATA_FACTORY());
        //     }
        // }
    ],
})
export class DemoModule {}
