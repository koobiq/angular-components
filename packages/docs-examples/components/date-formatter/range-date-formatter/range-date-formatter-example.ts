/* tslint:disable:no-magic-numbers */
import { Component, Inject } from '@angular/core';
import { DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE, KbqLocaleService } from '@koobiq/components/core';
import { DateTime } from 'luxon';
import { delay } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';


/**
 * @title Basic progress range-date-formatter
 */
@Component({
    selector: 'range-date-formatter-example',
    templateUrl: 'range-date-formatter-example.html',
    styleUrls: ['range-date-formatter-example.css']
})
export class RangeDateFormatterExample {
    formats = {
        range: {
            long: {
                date: {
                    currentMonth: '',
                    notCurrentYear: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
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
                    notCurrentMonthMilliseconds: ''
                }
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
                    endsNotCurrentYearMilliseconds: ''
                }
            },
            short: {
                date: {
                    currentMonth: '',
                    notCurrentYear: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
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
                    endsNotCurrentYearMilliseconds: ''
                }
            }
        },
        openedRange: {
            long: {
                date: {
                    onlyStart: '',
                    onlyStartNotCurrentYear: '',
                    onlyEnd: '',
                    onlyEndNotCurrentYear: ''
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
                    onlyEndNotCurrentYearMilliseconds: ''
                }
            },
            short: {
                date: {
                    onlyStart: '',
                    onlyStartNotCurrentYear: '',
                    onlyEnd: '',
                    onlyEndNotCurrentYear: ''
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
                    onlyEndNotCurrentYearMilliseconds: ''
                }
            }
        }
    };

    constructor(
        private adapter: DateAdapter<DateTime>,
        private dateFormatter: DateFormatter<DateTime>,
        @Inject(KBQ_LOCALE_SERVICE) private localeService: KbqLocaleService
    ) {
        this.localeService.changes
            .pipe(distinctUntilChanged(), delay(0))
            .subscribe(this.onLocaleChange);
    }

    private onLocaleChange = (locale: string) => {
        this.adapter.setLocale(locale);

        this.populateRangeLong(locale);
        this.populateRangeMiddle(locale);
        this.populateRangeShort(locale);
        this.populateOpenedRangeLong(locale);
        this.populateOpenedRangeShort(locale);
    }

    private populateRangeShort(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const short = this.formats.range.short;
        const now = this.adapter.today();

        short.date.currentMonth = this.dateFormatter.rangeShortDate(now.set({ day: 1 }), now.set({ day: 10 }));
        short.date.notCurrentYear = this.dateFormatter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 })
        );
        short.date.startsNotCurrentYear = this.dateFormatter.rangeShortDate(
            now.set({ day: 1, month: 1 }).minus({ years: 1 }),
            now.set({ day: 10, month: 2 })
        );
        short.date.endsNotCurrentYear = this.dateFormatter.rangeShortDate(
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 }).plus({ years: 1 })
        );

        short.dateTime.sameDateCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        );
        short.dateTime.sameDateCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {seconds: true}
        );
        short.dateTime.sameDateCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        short.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        short.dateTime.sameDateNotCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        short.dateTime.sameDateNotCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        short.dateTime.notCurrentMonth = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        short.dateTime.notCurrentMonthSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        short.dateTime.notCurrentMonthMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        short.dateTime.startsNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        short.dateTime.startsNotCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        short.dateTime.startsNotCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        short.dateTime.endsNotCurrentYear = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        short.dateTime.endsNotCurrentYearSeconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        short.dateTime.endsNotCurrentYearMilliseconds = this.dateFormatter.rangeShortDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );
    }

    private populateRangeMiddle(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const middle = this.formats.range.middle;
        const now = this.adapter.today();

        middle.dateTime.currentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 })
        );

        middle.dateTime.currentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
            {seconds: true}
        );

        middle.dateTime.currentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 1 }),
            now.set({ day: 10 }),
            {milliseconds: true}
        );

        middle.dateTime.sameDateCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 })
        );
        middle.dateTime.sameDateCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
            {seconds: true}
        );
        middle.dateTime.sameDateCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 }),
            {milliseconds: true}
        );

        middle.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        middle.dateTime.sameDateNotCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        middle.dateTime.sameDateNotCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        middle.dateTime.notCurrentMonth = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        middle.dateTime.notCurrentMonthSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        middle.dateTime.notCurrentMonthMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        middle.dateTime.startsNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 })
        );
        middle.dateTime.startsNotCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        middle.dateTime.startsNotCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        middle.dateTime.endsNotCurrentYear = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        middle.dateTime.endsNotCurrentYearSeconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        middle.dateTime.endsNotCurrentYearMilliseconds = this.dateFormatter.rangeMiddleDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );
    }

    private populateRangeLong(locale: string) {
        this.dateFormatter.setLocale(locale);
        this.adapter.setLocale(locale);

        const long = this.formats.range.long;
        const now = this.adapter.today();

        long.date.currentMonth = this.dateFormatter.rangeLongDate(now.set({ day: 1 }), now.set({ day: 10 }));
        long.date.notCurrentYear = this.dateFormatter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 })
        );
        long.date.startsNotCurrentYear = this.dateFormatter.rangeLongDate(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }),
            now.set({ month: 2, day: 10 })
        );
        long.date.endsNotCurrentYear = this.dateFormatter.rangeLongDate(
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 }).plus({ years: 1 })
        );
        long.dateTime.sameDateCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        );
        long.dateTime.sameDateCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {seconds: true}
        );
        long.dateTime.sameDateCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        long.dateTime.sameDateNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        long.dateTime.sameDateNotCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        long.dateTime.sameDateNotCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        long.dateTime.notCurrentMonth = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        long.dateTime.notCurrentMonthSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        long.dateTime.notCurrentMonthMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        long.dateTime.startsNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        );
        long.dateTime.startsNotCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {seconds: true}
        );
        long.dateTime.startsNotCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 }),
            {milliseconds: true}
        );

        long.dateTime.endsNotCurrentYear = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        );
        long.dateTime.endsNotCurrentYearSeconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {seconds: true}
        );
        long.dateTime.endsNotCurrentYearMilliseconds = this.dateFormatter.rangeLongDateTime(
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }),
            {milliseconds: true}
        );
    }

    private populateOpenedRangeLong(locale: string) {
        this.dateFormatter.setLocale(locale);

        const longOpenedRange = this.formats.openedRange.long;
        const now = this.adapter.today();
        const formatterTemplate = this.dateFormatter.config.rangeTemplates.openedRange.long;

        longOpenedRange.date.onlyStart = this.dateFormatter.openedRangeDate(now, null, formatterTemplate);
        longOpenedRange.date.onlyEnd = this.dateFormatter.openedRangeDate(null, now, formatterTemplate);
        longOpenedRange.date.onlyStartNotCurrentYear = this.dateFormatter.openedRangeDate(
            now.plus({ years: 1 }),
            null,
            formatterTemplate
        );
        longOpenedRange.date.onlyEndNotCurrentYear = this.dateFormatter.openedRangeDate(
            null,
            now.plus({ years: 1 }),
            formatterTemplate
        );

        longOpenedRange.dateTime.onlyStart = this.dateFormatter.openedRangeDateTime(now, null, formatterTemplate);
        longOpenedRange.dateTime.onlyStartSeconds = this.dateFormatter.openedRangeDateTime(
            now, null, formatterTemplate, true
        );
        longOpenedRange.dateTime.onlyStartMilliseconds = this.dateFormatter.openedRangeDateTime(
            now, null, formatterTemplate, false, true
        );

        longOpenedRange.dateTime.onlyStartNotCurrentYear = this.dateFormatter.openedRangeDateTime(
            now.plus({ years: 1 }), null, formatterTemplate
        );
        longOpenedRange.dateTime.onlyStartNotCurrentYearSeconds = this.dateFormatter.openedRangeDateTime(
            now.plus({ years: 1 }), null, formatterTemplate, true
        );
        longOpenedRange.dateTime.onlyStartNotCurrentYearMilliseconds = this.dateFormatter.openedRangeDateTime(
            now.plus({ years: 1 }), null, formatterTemplate, false, true
        );

        longOpenedRange.dateTime.onlyEnd = this.dateFormatter.openedRangeDateTime(
            null, now, formatterTemplate
        );
        longOpenedRange.dateTime.onlyEndSeconds = this.dateFormatter.openedRangeDateTime(
            null, now, formatterTemplate, true
        );
        longOpenedRange.dateTime.onlyEndMilliseconds = this.dateFormatter.openedRangeDateTime(
            null, now, formatterTemplate, false, true
        );

        longOpenedRange.dateTime.onlyEndNotCurrentYear = this.dateFormatter.openedRangeDateTime(
            null, now.plus({ years: 1 }), formatterTemplate
        );
        longOpenedRange.dateTime.onlyEndNotCurrentYearSeconds = this.dateFormatter.openedRangeDateTime(
            null, now.plus({ years: 1 }), formatterTemplate, true
        );
        longOpenedRange.dateTime.onlyEndNotCurrentYearMilliseconds = this.dateFormatter.openedRangeDateTime(
            null, now.plus({ years: 1 }), formatterTemplate, false, true
        );
    }

    private populateOpenedRangeShort(locale: string) {
        this.dateFormatter.setLocale(locale);

        const shortOpenedRange = this.formats.openedRange.short;
        const now = this.adapter.today();
        const formatterTemplate = this.dateFormatter.config.rangeTemplates.openedRange.short;

        shortOpenedRange.date.onlyStart = this.dateFormatter.openedRangeDate(
            now,
            null,
            formatterTemplate
        );
        shortOpenedRange.date.onlyEnd = this.dateFormatter.openedRangeDate(
            null,
            now,
            formatterTemplate
        );
        shortOpenedRange.date.onlyStartNotCurrentYear = this.dateFormatter.openedRangeDate(
            now.plus({ years: 1 }),
            null,
            formatterTemplate
        );
        shortOpenedRange.date.onlyEndNotCurrentYear = this.dateFormatter.openedRangeDate(
            null,
            now.plus({ years: 1 }),
            formatterTemplate
        );

        shortOpenedRange.dateTime.onlyStart = this.dateFormatter.openedRangeDateTime(
            now, null, formatterTemplate
        );
        shortOpenedRange.dateTime.onlyStartSeconds = this.dateFormatter.openedRangeDateTime(
            now, null, formatterTemplate, true
        );
        shortOpenedRange.dateTime.onlyStartMilliseconds = this.dateFormatter.openedRangeDateTime(
            now, null, formatterTemplate, false, true
        );

        shortOpenedRange.dateTime.onlyStartNotCurrentYear = this.dateFormatter.openedRangeDateTime(
            now.plus({ years: 1 }), null, formatterTemplate
        );
        shortOpenedRange.dateTime.onlyStartNotCurrentYearSeconds = this.dateFormatter.openedRangeDateTime(
            now.plus({ years: 1 }), null, formatterTemplate, true
        );
        shortOpenedRange.dateTime.onlyStartNotCurrentYearMilliseconds = this.dateFormatter.openedRangeDateTime(
            now.plus({ years: 1 }), null, formatterTemplate, false, true
        );

        shortOpenedRange.dateTime.onlyEnd = this.dateFormatter.openedRangeDateTime(
            null, now, formatterTemplate
        );
        shortOpenedRange.dateTime.onlyEndSeconds = this.dateFormatter.openedRangeDateTime(
            null, now, formatterTemplate, true
        );
        shortOpenedRange.dateTime.onlyEndMilliseconds = this.dateFormatter.openedRangeDateTime(
            null, now, formatterTemplate, false, true
        );

        shortOpenedRange.dateTime.onlyEndNotCurrentYear = this.dateFormatter.openedRangeDateTime(
            null, now.plus({ years: 1 }), formatterTemplate
        );
        shortOpenedRange.dateTime.onlyEndNotCurrentYearSeconds = this.dateFormatter.openedRangeDateTime(
            null, now.plus({ years: 1 }), formatterTemplate, true
        );
        shortOpenedRange.dateTime.onlyEndNotCurrentYearMilliseconds = this.dateFormatter.openedRangeDateTime(
            null, now.plus({ years: 1 }), formatterTemplate, false, true
        );
    }
}
