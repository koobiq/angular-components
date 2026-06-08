import { ChangeDetectionStrategy, Component, LOCALE_ID, signal } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule, LuxonDateAdapter, LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    DateAdapter,
    DateFormatter,
    KBQ_DEFAULT_LOCALE_DATA_FACTORY,
    KBQ_LOCALE_DATA,
    KBQ_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqAbsoluteLongDatePipe,
    KbqAbsoluteLongDateTimePipe,
    KbqAbsoluteShortDatePipe,
    KbqAbsoluteShortDateTimePipe,
    KbqFormattersModule,
    KbqLocaleService,
    KbqRangeLongDatePipe,
    KbqRangeLongDateTimePipe,
    KbqRangeMiddleDateTimePipe,
    KbqRangeShortDatePipe,
    KbqRangeShortDateTimePipe,
    KbqRelativeLongDatePipe,
    KbqRelativeLongDateTimePipe,
    KbqRelativeShortDatePipe,
    KbqRelativeShortDateTimePipe
} from '@koobiq/components/core';
import { DateTime, DateTimeUnit } from 'luxon';

describe('Date formatter', () => {
    let adapter: LuxonDateAdapter;
    let formatter: DateFormatter<DateTime>;
    let currentDate: DateTime;

    const mockAdapterAndFormatterForRelativeTests = () => {
        adapter.today = (): DateTime => currentDate;

        formatter['hasSame'] = (startDate: DateTime, _: DateTime, unit: DateTimeUnit): string => {
            return adapter.hasSame(startDate, currentDate, unit) ? 'yes' : 'no';
        };
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [LuxonDateModule, KbqFormattersModule],
            providers: [
                { provide: DateAdapter, useClass: LuxonDateAdapter },
                { provide: LOCALE_ID, useValue: 'ru-RU' },
                DateFormatter
            ]
        }).compileComponents();
    });

    beforeEach(inject([DateAdapter, DateFormatter], (d: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
        adapter = d;
        formatter = f;

        currentDate = adapter.createDateTime(adapter.today().year, 5, 15, 0, 0, 0, 0);
    }));

    const YEAR = 'yyyy';
    const MONTH = 'MMMM';
    const SHORT_MONTH = 'MMM';
    const DAY = 'd';
    const TIME = 'HH:mm';
    const SECONDS = 'ss';

    const DASH = '\u2013';
    const NBSP = '\u00A0';

    // todo tests repeated twice for ru and then for en
    describe('ru (default)', () => {
        beforeEach(() => {
            adapter.setLocale('ru-RU');
            formatter.setLocale('ru-RU');
        });

        const MILLISECONDS = ',SSS';

        const LONG_DASH = '\u202F\u2014\u2009';

        const FROM = 'С';
        const UNTIL = 'По';

        const DAY_MONTH = `${DAY}${NBSP}${MONTH}`;
        const DAY_SHORT_MONTH = `${DAY}${NBSP}${SHORT_MONTH}`;

        describe('relative formats', () => {
            describe('Relative short (relativeShortDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = adapter.createDate(2015).minus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH} ${YEAR}`)
                    );
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`)
                    );

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 1 }).startOf('day');

                    expect(formatter.relativeShortDate(date)).toBe(`Вчера, ${date.toFormat(TIME)}`);

                    date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeShortDate(date)).toBe(`Вчера, ${date.toFormat(TIME)}`);

                    date = currentDate.minus({ days: 1 }).endOf('day');

                    expect(formatter.relativeShortDate(date)).toBe(`Вчера, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    let date = adapter.today().startOf('day');

                    expect(formatter.relativeShortDate(date)).toBe(`Сегодня, ${date.toFormat(TIME)}`);

                    date = adapter.today();

                    expect(formatter.relativeShortDate(date)).toBe(`Сегодня, ${date.toFormat(TIME)}`);

                    date = adapter.today().endOf('day');

                    expect(formatter.relativeShortDate(date)).toBe(`Сегодня, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 1 }).startOf('day');

                    expect(formatter.relativeShortDate(date)).toBe(`Завтра, ${date.toFormat(TIME)}`);

                    date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeShortDate(date)).toBe(`Завтра, ${date.toFormat(TIME)}`);

                    date = currentDate.plus({ days: 1 }).endOf('day');

                    expect(formatter.relativeShortDate(date)).toBe(`Завтра, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`)
                    );

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('after tomorrow (other year)', () => {
                    const date = currentDate.plus({ years: 1 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${DAY}${NBSP}${SHORT_MONTH} ${YEAR}`)
                    );
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { milliseconds: true })).toBe(
                        date.toFormat(`Сегодня, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { seconds: true })).toBe(
                        adapter.format(date, `Сегодня, ${TIME}:${SECONDS}`)
                    );
                });
            });

            describe('Relative long (relativeLongDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = currentDate.minus({ years: 1 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH} ${YEAR}`));
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 1 }).startOf('day');

                    expect(formatter.relativeLongDate(date)).toBe(`Вчера, ${date.toFormat(TIME)}`);

                    date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeLongDate(date)).toBe(`Вчера, ${date.toFormat(TIME)}`);

                    date = currentDate.minus({ days: 1 }).endOf('day');

                    expect(formatter.relativeLongDate(date)).toBe(`Вчера, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    let date = adapter.today().startOf('day');

                    expect(formatter.relativeLongDate(date)).toBe(`Сегодня, ${date.toFormat(TIME)}`);

                    date = adapter.today();

                    expect(formatter.relativeLongDate(date)).toBe(`Сегодня, ${date.toFormat(TIME)}`);

                    date = adapter.today().endOf('day');

                    expect(formatter.relativeLongDate(date)).toBe(`Сегодня, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 1 }).startOf('day');

                    expect(formatter.relativeLongDate(date)).toBe(`Завтра, ${date.toFormat(TIME)}`);

                    date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeLongDate(date)).toBe(`Завтра, ${date.toFormat(TIME)}`);

                    date = currentDate.plus({ days: 1 }).endOf('day');

                    expect(formatter.relativeLongDate(date)).toBe(`Завтра, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('after tomorrow (other year)', () => {
                    const date = currentDate.plus({ years: 1 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH} ${YEAR}`));
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { milliseconds: true })).toBe(
                        date.toFormat(`Сегодня, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { seconds: true })).toBe(
                        adapter.format(date, `Сегодня, ${TIME}:${SECONDS}`)
                    );
                });
            });
        });

        describe('absolute formats', () => {
            describe('Absolute short (absoluteShortDate/Time method)', () => {
                it('absoluteShortDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDate(date)).toBe(adapter.format(date, DAY_SHORT_MONTH));
                });

                it('absoluteShortDate (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDate(date, true)).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}`)
                    );
                });

                it('absoluteShortDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDate(date)).toBe(adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}`));
                });

                it('absoluteShortDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date)).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { currYear: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDateTime(date)).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { milliseconds: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteShortDateTime with milliseconds (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { milliseconds: true, currYear: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteShortDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { seconds: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`)
                    );
                });

                it('absoluteShortDateTime with seconds (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { seconds: true, currYear: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}:${SECONDS}`)
                    );
                });
            });

            describe('Absolute long (absoluteLongDate/Time method)', () => {
                it('absoluteLongDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDate(date)).toBe(date.toFormat(`${DAY_MONTH}`));
                });

                it('absoluteLongDate (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDate(date, true)).toBe(date.toFormat(`${DAY_MONTH} ${YEAR}`));
                });

                it('absoluteLongDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDate(date)).toBe(date.toFormat(`${DAY_MONTH} ${YEAR}`));
                });

                it('absoluteLongDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date)).toBe(date.toFormat(`${DAY_MONTH}, ${TIME}`));
                });

                it('absoluteLongDateTime (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { currYear: true })).toBe(
                        date.toFormat(`${DAY_MONTH} ${YEAR}, ${TIME}`)
                    );
                });

                it('absoluteLongDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDateTime(date)).toBe(date.toFormat(`${DAY_MONTH} ${YEAR}, ${TIME}`));
                });

                it('absoluteLongDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { milliseconds: true })).toBe(
                        date.toFormat(`${DAY_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteLongDateTime with milliseconds (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { milliseconds: true, currYear: true })).toBe(
                        date.toFormat(`${DAY_MONTH} ${YEAR}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteLongDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { seconds: true })).toBe(
                        adapter.format(date, `${DAY_MONTH}, ${TIME}:${SECONDS}`)
                    );
                });

                it('absoluteLongDateTime with seconds (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { seconds: true, currYear: true })).toBe(
                        adapter.format(date, `${DAY_MONTH} ${YEAR}, ${TIME}:${SECONDS}`)
                    );
                });
            });
        });

        describe('range formats', () => {
            let startDateFormat: any;
            let endDateFormat: any;

            describe('closed range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_SHORT_MONTH;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeShortDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY}`);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeShortDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH} ${YEAR}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (with seconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate, { seconds: true })).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(
                            startDate,
                            `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`
                        );
                        const endString = adapter.format(
                            endDate,
                            `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`
                        );

                        expect(formatter.rangeShortDateTime(startDate, endDate, { milliseconds: true })).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY}`);
                        const endString = adapter.format(endDate, `${endDateFormat}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeLongDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, `${endDateFormat}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`
                        );
                    });

                    it('rangeLongDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(
                            startDate,
                            `${DAY_MONTH}, ${FROM.toLocaleLowerCase()}${NBSP}${TIME}`
                        );
                        const endString = adapter.format(endDate, `${UNTIL.toLocaleLowerCase()}${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(
                            startDate,
                            `${DAY_MONTH} ${YEAR}, ${FROM.toLocaleLowerCase()}${NBSP}${TIME}`
                        );
                        const endString = adapter.format(endDate, `${UNTIL.toLocaleLowerCase()}${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`
                        );
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`
                        );
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM}${NBSP}${startString} ${UNTIL.toLocaleLowerCase()}${NBSP}${endString}`
                        );
                    });
                });

                describe('Range middle (rangeMiddleDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeMiddleDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH} ${YEAR}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });
            });

            describe('opened range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_SHORT_MONTH;
                        endDateFormat = DAY_SHORT_MONTH;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDate(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeShortDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDateTime(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeShortDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (with seconds)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, { seconds: true })).toBe(
                            `${FROM}${NBSP}${startString}`
                        );
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}${MILLISECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, { milliseconds: true })).toBe(
                            `${FROM}${NBSP}${startString}`
                        );
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}`;
                        endDateFormat = `${DAY_MONTH}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDate(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeLongDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDateTime(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeLongDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });
            });
        });
    });

    describe('en-US', () => {
        beforeEach(() => {
            adapter.setLocale('en-US');
            formatter.setLocale('en-US');
        });

        const MILLISECONDS = '.SSS';

        const LONG_DASH = '\u202F\u2013\u2009';

        const FROM = 'From';
        const UNTIL = 'Until';

        const DAY_MONTH = `${MONTH}${NBSP}${DAY}`;
        const DAY_SHORT_MONTH = `${SHORT_MONTH}${NBSP}${DAY}`;

        describe('relative formats', () => {
            describe('Relative short (relativeShortDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = adapter.createDate(2015).minus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${YEAR}`)
                    );
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`)
                    );

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`)
                    );
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeShortDate(date)).toBe(`Yesterday, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDate(date)).toBe(`Today, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeShortDate(date)).toBe(`Tomorrow, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`)
                    );

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${TIME}`)
                    );
                });

                it('after tomorrow (other year)', () => {
                    const date = adapter.createDate(2015).plus({ days: 3 });

                    expect(formatter.relativeShortDate(date)).toBe(
                        adapter.format(date, `${SHORT_MONTH}${NBSP}${DAY}, ${YEAR}`)
                    );
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { milliseconds: true })).toBe(
                        `Today, ${date.toFormat(`${TIME}:${SECONDS}${MILLISECONDS}`)}`
                    );
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeShortDateTime(date, { seconds: true })).toBe(
                        `Today, ${date.toFormat(`${TIME}:${SECONDS}`)}`
                    );
                });
            });

            describe('Relative long (relativeLongDate method)', () => {
                it('before yesterday (other year)', () => {
                    const date = adapter.createDate(2015).minus({ days: 3 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${YEAR}`));
                });

                it('before yesterday, more than 2 days ago', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.minus({ days: 3 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.minus({ days: 5 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('yesterday', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.minus({ days: 1 });

                    expect(formatter.relativeLongDate(date)).toBe(`Yesterday, ${date.toFormat(TIME)}`);
                });

                it('today', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDate(date)).toBe(`Today, ${date.toFormat(TIME)}`);
                });

                it('tomorrow', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    const date = currentDate.plus({ days: 1 });

                    expect(formatter.relativeLongDate(date)).toBe(`Tomorrow, ${date.toFormat(TIME)}`);
                });

                it('after tomorrow (current year)', () => {
                    mockAdapterAndFormatterForRelativeTests();

                    let date = currentDate.plus({ days: 3 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));

                    date = currentDate.plus({ days: 5 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${TIME}`));
                });

                it('after tomorrow (other year)', () => {
                    const date = adapter.createDate(2015).plus({ days: 3 });

                    expect(formatter.relativeLongDate(date)).toBe(adapter.format(date, `${DAY_MONTH}, ${YEAR}`));
                });

                it('with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDateTime(date, { milliseconds: true })).toBe(
                        `Today, ${date.toFormat(`${TIME}:${SECONDS}${MILLISECONDS}`)}`
                    );
                });

                it('with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.relativeLongDateTime(date, { seconds: true })).toBe(
                        `Today, ${date.toFormat(`${TIME}:${SECONDS}`)}`
                    );
                });
            });
        });

        describe('absolute formats', () => {
            describe('Absolute short (absoluteShortDate/Time method)', () => {
                it('absoluteShortDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDate(date)).toBe(adapter.format(date, DAY_SHORT_MONTH));
                });

                it('absoluteShortDate (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDate(date, true)).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}`)
                    );
                });

                it('absoluteShortDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDate(date)).toBe(adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}`));
                });

                it('absoluteShortDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date)).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { currYear: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteShortDateTime(date)).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`)
                    );
                });

                it('absoluteShortDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { milliseconds: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteShortDateTime with milliseconds (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { milliseconds: true, currYear: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteShortDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { seconds: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`)
                    );
                });

                it('absoluteShortDateTime with seconds (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteShortDateTime(date, { seconds: true, currYear: true })).toBe(
                        adapter.format(date, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}:${SECONDS}`)
                    );
                });
            });

            describe('Absolute long (absoluteLongDate/Time method)', () => {
                it('absoluteLongDate', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDate(date)).toBe(date.toFormat(`${DAY_MONTH}`));
                });
                it('absoluteLongDate  (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDate(date, true)).toBe(date.toFormat(`${DAY_MONTH}, ${YEAR}`));
                });

                it('absoluteLongDate (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDate(date)).toBe(date.toFormat(`${DAY_MONTH}, ${YEAR}`));
                });

                it('absoluteLongDateTime', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date)).toBe(date.toFormat(`${DAY_MONTH}, ${TIME}`));
                });

                it('absoluteLongDateTime  (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { currYear: true })).toBe(
                        date.toFormat(`${DAY_MONTH}, ${YEAR}, ${TIME}`)
                    );
                });

                it('absoluteLongDateTime (other year)', () => {
                    const date = adapter.createDate(2015);

                    expect(formatter.absoluteLongDateTime(date)).toBe(date.toFormat(`${DAY_MONTH}, ${YEAR}, ${TIME}`));
                });

                it('absoluteLongDateTime with milliseconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { milliseconds: true })).toBe(
                        date.toFormat(`${DAY_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteLongDateTime with milliseconds  (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { milliseconds: true, currYear: true })).toBe(
                        date.toFormat(`${DAY_MONTH}, ${YEAR}, ${TIME}:${SECONDS}${MILLISECONDS}`)
                    );
                });

                it('absoluteLongDateTime with seconds', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { seconds: true })).toBe(
                        adapter.format(date, `${DAY_MONTH}, ${TIME}:${SECONDS}`)
                    );
                });

                it('absoluteLongDateTime with seconds  (current year forced shown)', () => {
                    const date = adapter.today();

                    expect(formatter.absoluteLongDateTime(date, { seconds: true, currYear: true })).toBe(
                        adapter.format(date, `${DAY_MONTH}, ${YEAR}, ${TIME}:${SECONDS}`)
                    );
                });
            });
        });

        describe('range formats', () => {
            let startDateFormat: any;
            let endDateFormat: any;

            describe('closed range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        endDateFormat = DAY_SHORT_MONTH;
                        startDateFormat = endDateFormat;
                    });

                    it('rangeShortDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, `${DAY}`);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeShortDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeShortDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_SHORT_MONTH}, ${YEAR}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (with seconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, endDate, { seconds: true })).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(
                            startDate,
                            `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`
                        );
                        const endString = adapter.format(
                            endDate,
                            `${DAY_SHORT_MONTH}, ${TIME}:${SECONDS}${MILLISECONDS}`
                        );

                        expect(formatter.rangeShortDateTime(startDate, endDate, { milliseconds: true })).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_MONTH;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDate', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, DAY);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(`${startString}${DASH}${endString}`);
                    });

                    it('rangeLongDate (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, `${endDateFormat}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${startDateFormat}, ${YEAR}`);
                        const endString = adapter.format(endDate, `${endDateFormat}, ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeLongDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM} ${startString} to${NBSP}${endString}`
                        );
                    });

                    it('rangeLongDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, 'from'${NBSP}${TIME}`);
                        const endString = adapter.format(endDate, `'to'${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, 'from'${NBSP}${TIME}`);
                        const endString = adapter.format(endDate, `'to'${NBSP}${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(`${startString} ${endString}`);
                    });

                    it('rangeLongDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM} ${startString} to${NBSP}${endString}`
                        );
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM} ${startString} to${NBSP}${endString}`
                        );
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate, endDate)).toBe(
                            `${FROM} ${startString} to${NBSP}${endString}`
                        );
                    });
                });

                describe('Range middle (rangeMiddleDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = startDateFormat;
                    });

                    it('rangeMiddleDateTime', () => {
                        const startDate = adapter.today().set({ day: 1 });
                        const endDate = startDate.plus({ days: 10 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (same day)', () => {
                        const startDate = adapter.today();
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (same day, other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = startDate.plus({ minutes: 1 });

                        const startString = adapter.format(startDate, `${TIME}`);
                        const endString = adapter.format(endDate, `${TIME}, ${DAY_MONTH}, ${YEAR}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (other month)', () => {
                        const startDate = adapter.today().set({ month: 1 });
                        const endDate = startDate.plus({ months: 1 });

                        const startString = adapter.format(startDate, startDateFormat);
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const endDate = adapter.today();

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });

                    it('rangeMiddleDateTime (endDate is other year)', () => {
                        const startDate = adapter.createDate(2015);
                        const endDate = startDate.plus({ years: 1 });

                        const startString = adapter.format(startDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);
                        const endString = adapter.format(endDate, `${DAY_MONTH}, ${YEAR}, ${TIME}`);

                        expect(formatter.rangeMiddleDateTime(startDate, endDate)).toBe(
                            `${startString}${LONG_DASH}${endString}`
                        );
                    });
                });
            });

            describe('opened range', () => {
                describe('Range short (rangeShortDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = DAY_SHORT_MONTH;
                        endDateFormat = DAY_SHORT_MONTH;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDate(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeShortDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeShortDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range short (rangeShortDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_SHORT_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeShortDateTime(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeShortDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeShortDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeShortDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeShortDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_SHORT_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeShortDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeShortDateTime (with seconds)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, { seconds: true })).toBe(
                            `${FROM}${NBSP}${startString}`
                        );
                    });

                    it('rangeShortDateTime (with milliseconds)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, `${startDateFormat}:${SECONDS}${MILLISECONDS}`);

                        expect(formatter.rangeShortDateTime(startDate, null, { milliseconds: true })).toBe(
                            `${FROM}${NBSP}${startString}`
                        );
                    });
                });

                describe('Range long (rangeLongDate method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}`;
                        endDateFormat = `${DAY_MONTH}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDate(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeLongDate (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDate (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${startDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDate (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${endDateFormat} ${YEAR}`);

                        expect(formatter.rangeLongDate(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });

                describe('Range long (rangeLongDateTime method)', () => {
                    beforeEach(() => {
                        startDateFormat = `${DAY_MONTH}, ${TIME}`;
                        endDateFormat = `${DAY_MONTH}, ${TIME}`;
                    });

                    it('throw Error', () => {
                        const wrapper = () => formatter.rangeLongDateTime(null);

                        expect(wrapper).toThrow('Invalid date');
                    });

                    it('rangeLongDateTime (only startDate)', () => {
                        const startDate = adapter.today();
                        const startString = adapter.format(startDate, startDateFormat);

                        expect(formatter.rangeLongDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (only endDate)', () => {
                        const endDate = adapter.today();
                        const endString = adapter.format(endDate, endDateFormat);

                        expect(formatter.rangeLongDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });

                    it('rangeLongDateTime (startDate is other year)', () => {
                        const startDate = adapter.today().minus({ years: 1 });
                        const startString = adapter.format(startDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(startDate)).toBe(`${FROM}${NBSP}${startString}`);
                    });

                    it('rangeLongDateTime (endDate is other year)', () => {
                        const endDate = adapter.today().plus({ years: 1 });
                        const endString = adapter.format(endDate, `${DAY_MONTH} ${YEAR}, ${TIME}`);

                        expect(formatter.rangeLongDateTime(null, endDate)).toBe(`${UNTIL}${NBSP}${endString}`);
                    });
                });
            });
        });
    });

    describe('Time duration', () => {
        let endDate;
        let year;
        let month;
        let week;
        let day;
        let hour;
        let minute;
        let second;
        let millisecond;
        let pr;

        describe('Number format', () => {
            beforeEach(() => {
                endDate = adapter.parse('2023-10-10T15:00:00.000+03:00');
                minute = 2;
                second = 25;
                millisecond = 125;
            });

            it('seconds', () => {
                const startDate = endDate.minus({ second, millisecond });

                expect(formatter.durationShortest(startDate, endDate)).toBe(`0:${second}`);
            });

            it('seconds and milliseconds', () => {
                const startDate = endDate.minus({ second, millisecond });

                expect(formatter.durationShortest(startDate, endDate, true, true)).toBe(`0:${second},${millisecond}`);
            });

            it('minutes and seconds', () => {
                const startDate = endDate.minus({ minute, second, millisecond });

                expect(formatter.durationShortest(startDate, endDate)).toBe(`${minute}:${second}`);
            });

            it('only minutes < 10 min', () => {
                const startDate = endDate.minus({ minute, second, millisecond });

                expect(formatter.durationShortest(startDate, endDate, false)).toBe(
                    `0:${String(minute).padStart(2, '0')}`
                );
            });

            it('only minutes > 10 min', () => {
                const minutes = 35;
                const startDate = endDate.minus({ minute: minutes, second, millisecond });

                expect(formatter.durationShortest(startDate, endDate, false)).toBe(`0:${minutes}`);
            });

            it('minutes, seconds and milliseconds', () => {
                const startDate = endDate.minus({ minute, second, millisecond });

                expect(formatter.durationShortest(startDate, endDate, true, true)).toBe(
                    `${minute}:${second},${millisecond}`
                );
            });

            it('hours, minutes and seconds', () => {
                hour = 5;
                const startDate = endDate.minus({ hour, minute, second, millisecond });

                expect(formatter.durationShortest(startDate, endDate)).toBe(
                    `${hour}:${String(minute).padStart(2, '0')}:${second}`
                );
            });
        });

        const testTextFormat = (locale, formatterName, plurals, separator) => {
            const testPluralUnits = (value, unit) => {
                it(`plural unit: ${value} ${unit}`, () => {
                    const startDate = endDate.minus({ [unit]: value });

                    expect(formatter[formatterName](startDate, endDate, [unit])).toBe(
                        `${value} ${plurals[unit][pr.select(value)]}`
                    );
                });
            };

            const unitValues = [1, 2, 5, 21, 33, 45, 120, 365];

            unitValues.forEach((value) => {
                testPluralUnits(value, 'year');
                testPluralUnits(value, 'month');
                testPluralUnits(value, 'week');
                testPluralUnits(value, 'day');
                testPluralUnits(value, 'hour');
                testPluralUnits(value, 'minute');
                testPluralUnits(value, 'second');
            });

            it('minutes and seconds', () => {
                const startDate = endDate.minus({ minute, second });
                const firstValue = `${minute} ${plurals.minute[pr.select(minute)]}`;
                const secondValue = `${second} ${plurals.second[pr.select(second)]}`;

                expect(formatter[formatterName](startDate, endDate)).toBe(`${firstValue}${separator}${secondValue}`);
            });

            it('hours and minutes', () => {
                const startDate = endDate.minus({ hour, minute });
                const firstValue = `${hour} ${plurals.hour[pr.select(hour)]}`;
                const secondValue = `${minute} ${plurals.minute[pr.select(minute)]}`;

                expect(formatter[formatterName](startDate, endDate)).toBe(`${firstValue}${separator}${secondValue}`);
            });

            it('hours and minutes (more then 24 hours)', () => {
                hour = 32;
                const startDate = endDate.minus({ hour, minute });
                const firstValue = `${hour} ${plurals.hour[pr.select(hour)]}`;
                const secondValue = `${minute} ${plurals.minute[pr.select(minute)]}`;

                expect(formatter[formatterName](startDate, endDate, ['hours', 'minutes'])).toBe(
                    `${firstValue}${separator}${secondValue}`
                );
            });

            it('days and hours', () => {
                const startDate = endDate.minus({ day, hour });
                const firstValue = `${day} ${plurals.day[pr.select(day)]}`;
                const secondValue = `${hour} ${plurals.hour[pr.select(hour)]}`;

                expect(formatter[formatterName](startDate, endDate)).toBe(`${firstValue}${separator}${secondValue}`);
            });

            it('days and hours (more than 1 week)', () => {
                day = 10;
                const startDate = endDate.minus({ day, hour });
                const firstValue = `${day} ${plurals.day[pr.select(day)]}`;
                const secondValue = `${hour} ${plurals.hour[pr.select(hour)]}`;

                expect(formatter[formatterName](startDate, endDate, ['days', 'hours'])).toBe(
                    `${firstValue}${separator}${secondValue}`
                );
            });

            it('weeks and days', () => {
                const startDate = endDate.minus({ week, day });
                const firstValue = `${week} ${plurals.week[pr.select(week)]}`;
                const secondValue = `${day} ${plurals.day[pr.select(day)]}`;

                expect(formatter[formatterName](startDate, endDate)).toBe(`${firstValue}${separator}${secondValue}`);
            });

            it('weeks and days (more than 1 month)', () => {
                week = 6;
                const startDate = endDate.minus({ week, day });
                const firstValue = `${week} ${plurals.week[pr.select(week)]}`;
                const secondValue = `${day} ${plurals.day[pr.select(day)]}`;

                expect(formatter[formatterName](startDate, endDate, ['weeks', 'days'])).toBe(
                    `${firstValue}${separator}${secondValue}`
                );
            });

            it('months and weeks', () => {
                const startDate = endDate.minus({ month, week });
                const firstValue = `${month} ${plurals.month[pr.select(month)]}`;
                const secondValue = `${week} ${plurals.week[pr.select(week)]}`;

                expect(formatter[formatterName](startDate, endDate)).toBe(`${firstValue}${separator}${secondValue}`);
            });

            it('years and months', () => {
                const startDate = endDate.minus({ year, month });
                const firstValue = `${year} ${plurals.year[pr.select(year)]}`;
                const secondValue = `${month} ${plurals.month[pr.select(month)]}`;

                expect(formatter[formatterName](startDate, endDate)).toBe(`${firstValue}${separator}${secondValue}`);
            });

            const testFractions = (unit, startDateOpts, intPart, expectedValue) => {
                it(`units with fractions: ${unit}: ${expectedValue}`, () => {
                    const startDate = endDate.minus(startDateOpts);
                    const expectedValueFormatted = new Intl.NumberFormat(locale).format(expectedValue);

                    expect(formatter[formatterName](startDate, endDate, [unit], true)).toBe(
                        `${expectedValueFormatted} ${intPart === 1 ? plurals[unit].few || plurals[unit].other : plurals[unit][pr.select(intPart)]}`
                    );
                });
            };

            testFractions('month', { month: 1, week: 1 }, 1, 1);
            testFractions('month', { month: 1, week: 3 }, 1, 1.5);
            testFractions('month', { month: 2, week: 3 }, 2, 2.5);
            testFractions('month', { month: 5, week: 3 }, 5, 5.5);
            testFractions('month', { month: 11, week: 3 }, 11, 11.5);
            testFractions('month', { month: 21, days: 16 }, 21, 21.5);

            testFractions('year', { year: 1, months: 5 }, 1, 1);
            testFractions('year', { year: 1, months: 6 }, 1, 1.5);
            testFractions('year', { year: 2, months: 7 }, 2, 2.5);
            testFractions('year', { year: 5, months: 8 }, 5, 5.5);
            testFractions('year', { year: 11, months: 9 }, 11, 11.5);
            testFractions('year', { year: 21, months: 10 }, 21, 21.5);
        };

        describe('Text long format', () => {
            describe('ru locale', () => {
                const separator = ' и ';
                const plurals = {
                    year: { one: 'год', few: 'года', many: 'лет' },
                    month: { one: 'месяц', few: 'месяца', many: 'месяцев' },
                    week: { one: 'неделя', few: 'недели', many: 'недель' },
                    day: { one: 'день', few: 'дня', many: 'дней' },
                    hour: { one: 'час', few: 'часа', many: 'часов' },
                    minute: { one: 'минута', few: 'минуты', many: 'минут' },
                    second: { one: 'секунда', few: 'секунды', many: 'секунд' }
                };

                beforeEach(() => {
                    pr = new Intl.PluralRules('ru-RU');
                    adapter.setLocale('ru-RU');
                    formatter.setLocale('ru-RU');
                    endDate = adapter.parse('2023-10-10T15:00:00.000+03:00');
                    year = 1;
                    month = 7;
                    week = 3;
                    day = 2;
                    hour = 4;
                    minute = 10;
                    second = 23;
                    millisecond = 478;
                });

                testTextFormat('ru-RU', 'durationLong', plurals, separator);
            });

            describe('en locale', () => {
                const separator = ' ';
                const plurals = {
                    year: { one: 'year', other: 'years' },
                    month: { one: 'month', other: 'months' },
                    week: { one: 'week', other: 'weeks' },
                    day: { one: 'day', other: 'days' },
                    hour: { one: 'hour', other: 'hours' },
                    minute: { one: 'minute', other: 'minutes' },
                    second: { one: 'second', other: 'seconds' }
                };

                beforeEach(() => {
                    pr = new Intl.PluralRules('en-US');
                    adapter.setLocale('en-US');
                    formatter.setLocale('en-US');
                    endDate = adapter.parse('2023-10-10T15:00:00.000+03:00');
                    year = 6;
                    month = 5;
                    week = 3;
                    day = 4;
                    hour = 2;
                    minute = 20;
                    second = 45;
                    millisecond = 563;
                });

                testTextFormat('en-US', 'durationLong', plurals, separator);
            });
        });

        describe('Text short format', () => {
            describe('ru locale', () => {
                const separator = ' ';
                const plurals = {
                    year: { one: 'г', few: 'г', many: 'л' },
                    month: { one: 'мес', few: 'мес', many: 'мес' },
                    week: { one: 'нед', few: 'нед', many: 'нед' },
                    day: { one: 'д', few: 'д', many: 'д' },
                    hour: { one: 'ч', few: 'ч', many: 'ч' },
                    minute: { one: 'мин', few: 'мин', many: 'мин' },
                    second: { one: 'с', few: 'с', many: 'с' }
                };

                beforeEach(() => {
                    pr = new Intl.PluralRules('ru-RU');
                    adapter.setLocale('ru-RU');
                    formatter.setLocale('ru-RU');
                    endDate = adapter.parse('2023-10-10T15:00:00.000+03:00')!.startOf('day');
                    year = 1;
                    month = 2;
                    week = 1;
                    day = 5;
                    hour = 6;
                    minute = 11;
                    second = 42;
                    millisecond = 111;
                });

                it('seconds and milliseconds', () => {
                    const startDate = endDate.minus({ second, millisecond });

                    expect(formatter.durationShort(startDate, endDate, ['seconds', 'milliseconds'])).toBe(
                        `${second},${millisecond} ${plurals.second[pr.select(second)]}`
                    );
                });

                testTextFormat('ru-RU', 'durationShort', plurals, separator);
            });

            describe('en locale', () => {
                const separator = ' ';
                const plurals = {
                    year: { one: 'y', other: 'y' },
                    month: { one: 'mo', other: 'mo' },
                    week: { one: 'w', other: 'w' },
                    day: { one: 'd', other: 'd' },
                    hour: { one: 'h', other: 'h' },
                    minute: { one: 'min', other: 'min' },
                    second: { one: 's', other: 's' }
                };

                beforeEach(() => {
                    pr = new Intl.PluralRules('en-US');
                    adapter.setLocale('en-US');
                    formatter.setLocale('en-US');
                    endDate = adapter.parse('2023-10-10T15:00:00.000+03:00')!.startOf('day');
                    year = 10;
                    month = 3;
                    week = 2;
                    day = 3;
                    hour = 21;
                    minute = 21;
                    second = 5;
                    millisecond = 45;
                });

                it('seconds and milliseconds', () => {
                    const startDate = endDate.minus({ second, millisecond });

                    const millisecondsViewValue = millisecond < 100 ? `0${millisecond.toString()}` : millisecond;

                    expect(formatter.durationShort(startDate, endDate, ['seconds', 'milliseconds'])).toBe(
                        `${second}.${millisecondsViewValue} ${plurals.second[pr.select(second)]}`
                    );
                });

                testTextFormat('en-US', 'durationShort', plurals, separator);
            });
        });
    });
});

describe('Date formatter (imports and providing)', () => {
    describe('default (no providers)', () => {
        let adapter: LuxonDateAdapter;
        let formatter: DateFormatter<DateTime>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqFormattersModule, KbqLuxonDateModule]
            }).compileComponents();
        });

        beforeEach(inject([DateAdapter, DateFormatter], (d: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
            adapter = d;
            formatter = f;
        }));

        it('Should set default locale to ru-RU and create localeService', () => {
            expect(adapter.config.name).toBe('ru-RU');
            expect(formatter.adapter.config.name).toBe('ru-RU');
            expect(adapter['localeService']).toBeDefined();
        });
    });

    describe('Provide KBQ_LOCALE_ID', () => {
        let adapter: LuxonDateAdapter;
        let formatter: DateFormatter<DateTime>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'en-US' }
                ]
            }).compileComponents();
        });

        beforeEach(inject([DateAdapter, DateFormatter], (d: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
            adapter = d;
            formatter = f;
        }));

        it('Should set locale from KBQ_LOCALE_ID', () => {
            expect(adapter.config.name).toBe('en-US');
            expect(formatter.adapter.config.name).toBe('en-US');
            expect(adapter['localeService']).toBeDefined();
        });
    });

    describe('Provide KBQ_LOCALE_SERVICE', () => {
        let adapter: LuxonDateAdapter;
        let formatter: DateFormatter<DateTime>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'pt-BR' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
                ]
            }).compileComponents();
        });

        beforeEach(inject([DateAdapter, DateFormatter], (d: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
            adapter = d;
            formatter = f;
        }));

        it('Should set locale from factory of KbqLocaleService', () => {
            expect(adapter.config.name).toBe('pt-BR');
            expect(formatter.adapter.config.name).toBe('pt-BR');
            expect(adapter['localeService']).toBeDefined();
        });
    });

    describe('Provide KBQ_LOCALE_SERVICE and KBQ_LOCALE_ID', () => {
        let adapter: LuxonDateAdapter;
        let formatter: DateFormatter<DateTime>;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'en-US' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
                ]
            }).compileComponents();
        });

        beforeEach(inject([DateAdapter, DateFormatter], (d: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
            adapter = d;
            formatter = f;
        }));

        it('Should set locale from KBQ_LOCALE_ID', () => {
            expect(adapter.config.name).toBe('en-US');
            expect(formatter.adapter.config.name).toBe('en-US');
            expect(adapter['localeService']).toBeDefined();
        });
    });

    describe('KbqAbsoluteLongDatePipe (locale-aware)', () => {
        @Component({
            selector: 'kbq-pipe-host',
            imports: [KbqAbsoluteLongDatePipe],
            template: '{{ value() | kbqAbsoluteLongDate }}',
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class HostComponent {
            readonly value = signal<DateTime | null>(null);
        }

        let localeService: KbqLocaleService;
        let dateFormatter: DateFormatter<DateTime>;
        let testAdapter: LuxonDateAdapter;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [HostComponent, KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    {
                        provide: KBQ_LOCALE_SERVICE,
                        useFactory: () => new KbqLocaleService('ru-RU', KBQ_DEFAULT_LOCALE_DATA_FACTORY())
                    }
                ]
            });
        });

        beforeEach(inject(
            [DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE],
            (a: LuxonDateAdapter, f: DateFormatter<DateTime>, l: KbqLocaleService) => {
                testAdapter = a;
                dateFormatter = f;
                localeService = l;
            }
        ));

        it('renders date in active locale (ru-RU)', () => {
            const fixture = TestBed.createComponent(HostComponent);

            fixture.componentInstance.value.set(testAdapter.createDate(2024, 0, 15));
            fixture.detectChanges();

            expect(fixture.nativeElement.textContent.trim()).toBe(
                dateFormatter.absoluteLongDate(testAdapter.createDate(2024, 0, 15))
            );
        });

        it('recomputes when KbqLocaleService.setLocale changes the active locale', () => {
            const fixture = TestBed.createComponent(HostComponent);
            const date = testAdapter.createDate(2024, 0, 15);

            fixture.componentInstance.value.set(date);
            fixture.detectChanges();

            const ruRendered = fixture.nativeElement.textContent.trim();
            const ruExpected = dateFormatter.absoluteLongDate(date);

            expect(ruRendered).toBe(ruExpected);

            localeService.setLocale('en-US');
            fixture.detectChanges();

            const enRendered = fixture.nativeElement.textContent.trim();
            const enExpected = dateFormatter.absoluteLongDate(date);

            expect(enRendered).toBe(enExpected);
            expect(enRendered).not.toBe(ruRendered);
        });

        it('caches the result and does not call the formatter on every CD tick', () => {
            const fixture = TestBed.createComponent(HostComponent);
            const date = testAdapter.createDate(2024, 0, 15);

            fixture.componentInstance.value.set(date);

            const spy = jest.spyOn(dateFormatter, 'absoluteLongDate');

            fixture.detectChanges();
            fixture.detectChanges();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it('recomputes when the input value changes', () => {
            const fixture = TestBed.createComponent(HostComponent);

            fixture.componentInstance.value.set(testAdapter.createDate(2024, 0, 15));
            fixture.detectChanges();

            const spy = jest.spyOn(dateFormatter, 'absoluteLongDate');

            fixture.componentInstance.value.set(testAdapter.createDate(2024, 5, 20));
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('Kbq* locale-aware date pipes (all formats)', () => {
        @Component({
            selector: 'kbq-all-pipes-host',
            imports: [
                KbqAbsoluteLongDatePipe,
                KbqAbsoluteLongDateTimePipe,
                KbqAbsoluteShortDatePipe,
                KbqAbsoluteShortDateTimePipe,
                KbqRelativeLongDatePipe,
                KbqRelativeLongDateTimePipe,
                KbqRelativeShortDatePipe,
                KbqRelativeShortDateTimePipe,
                KbqRangeLongDatePipe,
                KbqRangeLongDateTimePipe,
                KbqRangeMiddleDateTimePipe,
                KbqRangeShortDatePipe,
                KbqRangeShortDateTimePipe
            ],
            template: `
                <span id="absLong">{{ value() | kbqAbsoluteLongDate }}</span>
                <span id="absLongTime">{{ value() | kbqAbsoluteLongDateTime }}</span>
                <span id="absShort">{{ value() | kbqAbsoluteShortDate }}</span>
                <span id="absShortTime">{{ value() | kbqAbsoluteShortDateTime }}</span>
                <span id="relLong">{{ value() | kbqRelativeLongDate }}</span>
                <span id="relLongTime">{{ value() | kbqRelativeLongDateTime }}</span>
                <span id="relShort">{{ value() | kbqRelativeShortDate }}</span>
                <span id="relShortTime">{{ value() | kbqRelativeShortDateTime }}</span>
                <span id="rangeLong">{{ range() | kbqRangeLongDate }}</span>
                <span id="rangeLongTime">{{ range() | kbqRangeLongDateTime }}</span>
                <span id="rangeMidTime">{{ range() | kbqRangeMiddleDateTime }}</span>
                <span id="rangeShort">{{ range() | kbqRangeShortDate }}</span>
                <span id="rangeShortTime">{{ range() | kbqRangeShortDateTime }}</span>
            `,
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class AllPipesHostComponent {
            readonly value = signal<DateTime | null>(null);
            readonly range = signal<DateTime[]>([]);
        }

        let localeService: KbqLocaleService;
        let dateFormatter: DateFormatter<DateTime>;
        let testAdapter: LuxonDateAdapter;

        // Each pipe's expected output equals the matching DateFormatter call in the active locale.
        const singleExpect: Record<string, (f: DateFormatter<DateTime>, d: DateTime) => string> = {
            absLong: (f, d) => f.absoluteLongDate(d),
            absLongTime: (f, d) => f.absoluteLongDateTime(d),
            absShort: (f, d) => f.absoluteShortDate(d),
            absShortTime: (f, d) => f.absoluteShortDateTime(d),
            relLong: (f, d) => f.relativeLongDate(d),
            relLongTime: (f, d) => f.relativeLongDateTime(d),
            relShort: (f, d) => f.relativeShortDate(d),
            relShortTime: (f, d) => f.relativeShortDateTime(d)
        };
        const rangeExpect: Record<string, (f: DateFormatter<DateTime>, d1: DateTime, d2: DateTime) => string> = {
            rangeLong: (f, d1, d2) => f.rangeLongDate(d1, d2),
            rangeLongTime: (f, d1, d2) => f.rangeLongDateTime(d1, d2),
            rangeMidTime: (f, d1, d2) => f.rangeMiddleDateTime(d1, d2),
            rangeShort: (f, d1, d2) => f.rangeShortDate(d1, d2),
            rangeShortTime: (f, d1, d2) => f.rangeShortDateTime(d1, d2)
        };

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [AllPipesHostComponent, KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    {
                        provide: KBQ_LOCALE_SERVICE,
                        useFactory: () => new KbqLocaleService('ru-RU', KBQ_DEFAULT_LOCALE_DATA_FACTORY())
                    }
                ]
            });
        });

        beforeEach(inject(
            [DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE],
            (a: LuxonDateAdapter, f: DateFormatter<DateTime>, l: KbqLocaleService) => {
                testAdapter = a;
                dateFormatter = f;
                localeService = l;
            }
        ));

        it('renders every format and recomputes all of them on locale change', () => {
            const fixture = TestBed.createComponent(AllPipesHostComponent);
            const d1 = testAdapter.createDate(2024, 0, 15);
            const d2 = testAdapter.createDate(2024, 5, 20);

            fixture.componentInstance.value.set(d1);
            fixture.componentInstance.range.set([d1, d2]);

            const read = (id: string): string => fixture.nativeElement.querySelector(`#${id}`).textContent.trim();

            // `dateFormatter` is the same instance the pipes use; it tracks the active locale itself.
            const assertMatchesActiveLocale = () => {
                Object.entries(singleExpect).forEach(([id, fn]) => expect(read(id)).toBe(fn(dateFormatter, d1)));
                Object.entries(rangeExpect).forEach(([id, fn]) => expect(read(id)).toBe(fn(dateFormatter, d1, d2)));
            };

            fixture.detectChanges();
            assertMatchesActiveLocale();

            const ruAbsLong = read('absLong');

            localeService.setLocale('en-US');
            fixture.detectChanges();
            assertMatchesActiveLocale();

            expect(read('absLong')).not.toBe(ruAbsLong);
        });
    });
});
