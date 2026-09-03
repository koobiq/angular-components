import { ChangeDetectionStrategy, ChangeDetectorRef, Component, LOCALE_ID, signal } from '@angular/core';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { KbqLuxonDateModule, LuxonDateAdapter, LuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import {
    AbsoluteDateFormatterPipe,
    AbsoluteDateShortFormatterPipe,
    AbsoluteDateTimeFormatterPipe,
    AbsoluteShortDateTimeFormatterPipe,
    DateAdapter,
    DateFormatter,
    DurationLongFormatterImpurePipe,
    DurationLongFormatterPipe,
    DurationShortestFormatterImpurePipe,
    DurationShortestFormatterPipe,
    DurationShortFormatterImpurePipe,
    DurationShortFormatterPipe,
    KBQ_DEFAULT_LOCALE_DATA_FACTORY,
    KBQ_LOCALE_DATA,
    KBQ_LOCALE_ID,
    KBQ_LOCALE_SERVICE,
    KbqAbsoluteLongDatePipe,
    KbqAbsoluteLongDateTimePipe,
    KbqAbsoluteShortDatePipe,
    KbqAbsoluteShortDateTimePipe,
    kbqDateTimezoneProvider,
    KbqDateTimezoneService,
    KbqDurationLongPipe,
    KbqDurationShortestPipe,
    KbqDurationShortPipe,
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
    KbqRelativeShortDateTimePipe,
    RangeDateFormatterPipe,
    RangeDateTimeFormatterPipe,
    RangeMiddleDateTimeFormatterPipe,
    RangeShortDateFormatterPipe,
    RangeShortDateTimeFormatterPipe,
    RelativeDateFormatterPipe,
    RelativeDateTimeFormatterPipe,
    RelativeShortDateFormatterPipe,
    RelativeShortDateTimeFormatterPipe
} from '@koobiq/components/core';
import { DurationUnit } from '@koobiq/date-adapter';
import { DateTime } from 'luxon';

/**
 * Runs a change detection cycle on an OnPush host that nothing else marked dirty, so that impure pipes
 * actually get their `transform` called. Without it, `detectChanges()` refreshes the host view but skips
 * the clean OnPush component view, and any assertion about caching passes vacuously.
 *
 * `fixture.changeDetectorRef` is the host view's ref, which is why the component view's own one — the
 * same one `BaseLocaleAwareFormatterPipe` injects — has to be pulled from the component injector.
 */
const refresh = (fixture: ComponentFixture<unknown>) => {
    fixture.componentRef.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
};

/**
 * What the range and duration pipe hosts bind, matching what the pipes accept: a `[from, to]` tuple whose
 * bounds may be absent or unparseable, or no tuple at all for an input that has not been populated yet.
 */
type RangeValue = (DateTime | string | null)[] | null | undefined;

/**
 * How the formats themselves render is covered in koobiq/date-formatters, where `DateFormatter` and
 * its locale templates actually live. What is left here is a guard on the published package: it is a
 * caret dependency, so a minor release reaches this repo without anyone editing it, and the pipe
 * tests below compare a pipe against the same formatter instance and would agree with it either way.
 * The expectations are the ones the implementation repository snapshots for the same fixtures.
 */
describe('published @koobiq/date-formatter', () => {
    const NBSP = '\u00A0';
    const DASH = '\u2013';

    let adapter: DateAdapter<DateTime>;
    let formatter: DateFormatter<DateTime>;
    let today: DateTime;
    let otherYear: DateTime;

    const configure = (locale: string) => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [LuxonDateModule],
            providers: [
                { provide: DateAdapter, useClass: LuxonDateAdapter },
                { provide: LOCALE_ID, useValue: locale },
                DateFormatter
            ]
        });

        adapter = TestBed.inject(DateAdapter);
        formatter = TestBed.inject(DateFormatter);

        today = adapter.createDateTime(2026, 5, 15, 0, 0, 0, 0);
        adapter.today = () => today;
        otherYear = adapter.createDateTime(2015, 2, 7, 9, 5, 3, 45);
    };

    describe('ru-RU', () => {
        beforeEach(() => configure('ru-RU'));

        it('renders absolute dates', () => {
            expect(formatter.absoluteLongDate(today)).toBe(`15${NBSP}июня`);
            expect(formatter.absoluteLongDate(otherYear)).toBe(`7${NBSP}марта 2015`);
            expect(formatter.absoluteShortDate(otherYear)).toBe(`7${NBSP}мар 2015`);
            expect(formatter.absoluteShortDateTime(today)).toBe(`15${NBSP}июня, 00:00`);
        });

        it('renders relative dates', () => {
            expect(formatter.relativeShortDate(today)).toBe('Сегодня, 00:00');
            expect(formatter.relativeShortDate(adapter.addCalendarDays(today, -1))).toBe('Вчера, 00:00');
        });

        it('renders ranges', () => {
            const minuteOn = adapter.addCalendarUnits(today, { minutes: 1 });

            expect(formatter.rangeShortDateTime(today, minuteOn)).toBe(`00:00${DASH}00:01, 15${NBSP}июня`);
            expect(formatter.rangeShortDate(today)).toBe(`С${NBSP}15${NBSP}июня`);
        });

        it('renders durations', () => {
            const later = adapter.addCalendarUnits(today, { days: 400, hours: 5, minutes: 2, seconds: 25 });

            expect(formatter.durationShortest(today, later)).toBe('9605:02:25');
            expect(formatter.durationLong(today, later)).toBe('1 год и 1 месяц');
        });
    });

    describe('en-US', () => {
        beforeEach(() => configure('en-US'));

        it('renders absolute dates', () => {
            expect(formatter.absoluteLongDate(today)).toBe(`June${NBSP}15`);
            expect(formatter.absoluteLongDate(otherYear)).toBe(`March${NBSP}7, 2015`);
            expect(formatter.absoluteShortDate(otherYear)).toBe(`Mar${NBSP}7, 2015`);
            expect(formatter.absoluteShortDateTime(today)).toBe(`Jun${NBSP}15, 00:00`);
        });

        it('renders relative dates', () => {
            expect(formatter.relativeShortDate(today)).toBe('Today, 00:00');
            expect(formatter.relativeShortDate(adapter.addCalendarDays(today, -1))).toBe('Yesterday, 00:00');
        });

        it('renders ranges', () => {
            const minuteOn = adapter.addCalendarUnits(today, { minutes: 1 });

            expect(formatter.rangeShortDateTime(today, minuteOn)).toBe(`00:00${DASH}00:01, Jun${NBSP}15`);
            expect(formatter.rangeShortDate(today)).toBe(`From${NBSP}Jun${NBSP}15`);
        });

        it('renders durations', () => {
            const later = adapter.addCalendarUnits(today, { days: 400, hours: 5, minutes: 2, seconds: 25 });

            expect(formatter.durationShortest(today, later)).toBe('9605:02:25');
            expect(formatter.durationLong(today, later)).toBe('1 year 1 month');
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
                    { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
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
            refresh(fixture);
            refresh(fixture);

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
            readonly value = signal<DateTime | string | null | undefined>(null);
            readonly range = signal<RangeValue>([]);
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
                    { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
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

        const read = (fixture: ComponentFixture<unknown>, id: string): string =>
            fixture.nativeElement.querySelector(`#${id}`).textContent.trim();

        it('renders every format and recomputes all of them on locale change', () => {
            const fixture = TestBed.createComponent(AllPipesHostComponent);
            const d1 = testAdapter.createDate(2024, 0, 15);
            const d2 = testAdapter.createDate(2024, 5, 20);

            fixture.componentInstance.value.set(d1);
            fixture.componentInstance.range.set([d1, d2]);

            // `dateFormatter` is the same instance the pipes use; it tracks the active locale itself.
            const assertMatchesActiveLocale = () => {
                Object.entries(singleExpect).forEach(([id, fn]) =>
                    expect(read(fixture, id)).toBe(fn(dateFormatter, d1))
                );
                Object.entries(rangeExpect).forEach(([id, fn]) =>
                    expect(read(fixture, id)).toBe(fn(dateFormatter, d1, d2))
                );
            };

            fixture.detectChanges();
            assertMatchesActiveLocale();

            const ruAbsLong = read(fixture, 'absLong');

            localeService.setLocale('en-US');
            fixture.detectChanges();
            assertMatchesActiveLocale();

            expect(read(fixture, 'absLong')).not.toBe(ruAbsLong);
        });

        // The single-value pipes take a not-yet-populated input too, not just the tuple ones.
        const emptyValues: [string, DateTime | string | null | undefined][] = [
            ['null', null],
            ['undefined', undefined],
            ['an unparseable string', 'not-a-date']
        ];

        it.each(emptyValues)('renders an empty string for a value that is %s', (_, value) => {
            const fixture = TestBed.createComponent(AllPipesHostComponent);

            fixture.componentInstance.value.set(value);

            expect(() => fixture.detectChanges()).not.toThrow();

            Object.keys(singleExpect).forEach((id) => expect(read(fixture, id)).toBe(''));
        });
    });

    describe('Duration date pipes', () => {
        @Component({
            selector: 'kbq-duration-pipes-host',
            imports: [KbqDurationShortestPipe, KbqDurationLongPipe, KbqDurationShortPipe],
            template: `
                <span id="shortest">{{ range() | kbqDurationShortest }}</span>
                <span id="shortestNoSeconds">{{ range() | kbqDurationShortest: { seconds: false } }}</span>
                <span id="shortestMs">{{ range() | kbqDurationShortest: { seconds: true, milliseconds: true } }}</span>
                <span id="long">{{ range() | kbqDurationLong }}</span>
                <span id="longUnits">{{ range() | kbqDurationLong: ['hours', 'minutes'] }}</span>
                <span id="longFraction">{{ range() | kbqDurationLong: ['years'] : true }}</span>
                <span id="short">{{ range() | kbqDurationShort }}</span>
                <span id="shortUnits">{{ range() | kbqDurationShort: ['seconds', 'milliseconds'] }}</span>
            `,
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class DurationPipesHostComponent {
            readonly range = signal<RangeValue>([]);
        }

        // The legacy families share the formatting code with the `kbq*` ones but not the locale reactivity:
        // the pure pipe only recomputes when its input changes, the impure one on every change detection cycle.
        @Component({
            selector: 'kbq-legacy-duration-pipes-host',
            imports: [
                DurationShortestFormatterPipe,
                DurationLongFormatterPipe,
                DurationShortFormatterPipe,
                DurationShortestFormatterImpurePipe,
                DurationLongFormatterImpurePipe,
                DurationShortFormatterImpurePipe
            ],
            template: `
                <span id="pureShortest">{{ range() | durationShortest }}</span>
                <span id="pureLong">{{ range() | durationLong }}</span>
                <span id="pureShort">{{ range() | durationShort }}</span>
                <span id="impureShortest">{{ range() | durationShortestImpurePipe }}</span>
                <span id="impureLong">{{ range() | durationLongImpurePipe }}</span>
                <span id="impureShort">{{ range() | durationShortImpurePipe }}</span>
            `,
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class LegacyDurationPipesHostComponent {
            readonly range = signal<RangeValue>([]);
        }

        @Component({
            selector: 'kbq-duration-cache-host',
            imports: [KbqDurationLongPipe],
            template: '{{ range() | kbqDurationLong }}',
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class DurationCacheHostComponent {
            readonly range = signal<DateTime[]>([]);
        }

        let localeService: KbqLocaleService;
        let dateFormatter: DateFormatter<DateTime>;
        let testAdapter: LuxonDateAdapter;
        let start: DateTime;
        let end: DateTime;

        // Each span's expected output equals the matching DateFormatter call in the active locale.
        const durationExpect: Record<string, (f: DateFormatter<DateTime>, d1: DateTime, d2: DateTime) => string> = {
            shortest: (f, d1, d2) => f.durationShortest(d1, d2),
            shortestNoSeconds: (f, d1, d2) => f.durationShortest(d1, d2, false),
            shortestMs: (f, d1, d2) => f.durationShortest(d1, d2, true, true),
            long: (f, d1, d2) => f.durationLong(d1, d2),
            longUnits: (f, d1, d2) => f.durationLong(d1, d2, ['hours', 'minutes']),
            longFraction: (f, d1, d2) => f.durationLong(d1, d2, ['years'], true),
            short: (f, d1, d2) => f.durationShort(d1, d2),
            shortUnits: (f, d1, d2) => f.durationShort(d1, d2, ['seconds', 'milliseconds'])
        };
        const legacyDurationExpect: Record<string, (f: DateFormatter<DateTime>, d1: DateTime, d2: DateTime) => string> =
            {
                pureShortest: (f, d1, d2) => f.durationShortest(d1, d2),
                pureLong: (f, d1, d2) => f.durationLong(d1, d2),
                pureShort: (f, d1, d2) => f.durationShort(d1, d2),
                impureShortest: (f, d1, d2) => f.durationShortest(d1, d2),
                impureLong: (f, d1, d2) => f.durationLong(d1, d2),
                impureShort: (f, d1, d2) => f.durationShort(d1, d2)
            };

        const read = (fixture: ComponentFixture<unknown>, id: string): string =>
            fixture.nativeElement.querySelector(`#${id}`).textContent.trim();

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [
                    DurationPipesHostComponent,
                    LegacyDurationPipesHostComponent,
                    DurationCacheHostComponent,
                    KbqFormattersModule,
                    KbqLuxonDateModule
                ],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
                ]
            });
        });

        beforeEach(inject(
            [DateAdapter, DateFormatter, KBQ_LOCALE_SERVICE],
            (a: LuxonDateAdapter, f: DateFormatter<DateTime>, l: KbqLocaleService) => {
                testAdapter = a;
                dateFormatter = f;
                localeService = l;

                start = testAdapter.createDateTime(2022, 0, 15, 10, 0, 0, 0);
                end = start.plus({ years: 2, months: 6, hours: 5, minutes: 2, seconds: 25, milliseconds: 125 });
            }
        ));

        it('renders every duration format', () => {
            const fixture = TestBed.createComponent(DurationPipesHostComponent);

            fixture.componentInstance.range.set([start, end]);
            fixture.detectChanges();

            Object.entries(durationExpect).forEach(([id, fn]) =>
                expect(read(fixture, id)).toBe(fn(dateFormatter, start, end))
            );
        });

        // `toDurationRange` accepts equal bounds (`compareDateTime(...) <= 0`) — only a reversed range is
        // unformattable, so a zero duration has to render as one instead of falling through to ''.
        it('renders a zero duration for equal bounds', () => {
            const fixture = TestBed.createComponent(DurationPipesHostComponent);

            fixture.componentInstance.range.set([start, start]);
            fixture.detectChanges();

            Object.entries(durationExpect).forEach(([id, fn]) =>
                expect(read(fixture, id)).toBe(fn(dateFormatter, start, start))
            );
            // Not the '' of the unformattable-range guard: the bounds do reach the formatter. Asserted on
            // `shortest` because `durationShortest` without seconds renders a zero duration as '' itself.
            expect(read(fixture, 'shortest')).not.toBe('');
        });

        it('renders the same output through the legacy pure and impure families', () => {
            const fixture = TestBed.createComponent(LegacyDurationPipesHostComponent);

            fixture.componentInstance.range.set([start, end]);
            fixture.detectChanges();

            Object.entries(legacyDurationExpect).forEach(([id, fn]) =>
                expect(read(fixture, id)).toBe(fn(dateFormatter, start, end))
            );
        });

        it('recomputes every format when KbqLocaleService.setLocale changes the active locale', () => {
            const fixture = TestBed.createComponent(DurationPipesHostComponent);

            fixture.componentInstance.range.set([start, end]);
            fixture.detectChanges();

            const ruLong = read(fixture, 'long');

            localeService.setLocale('en-US');
            fixture.detectChanges();

            Object.entries(durationExpect).forEach(([id, fn]) =>
                expect(read(fixture, id)).toBe(fn(dateFormatter, start, end))
            );
            expect(read(fixture, 'long')).not.toBe(ruLong);
        });

        // Neither legacy family marks its host for check, so on locale change they update only once the
        // host is re-checked for some other reason — and then only the impure one picks up the new locale.
        it('leaves the legacy pure family stale on locale change, unlike the impure one', () => {
            const fixture = TestBed.createComponent(LegacyDurationPipesHostComponent);

            fixture.componentInstance.range.set([start, end]);
            fixture.detectChanges();

            const ruPureLong = read(fixture, 'pureLong');

            localeService.setLocale('en-US');
            refresh(fixture);

            expect(read(fixture, 'pureLong')).toBe(ruPureLong);
            expect(read(fixture, 'impureLong')).toBe(dateFormatter.durationLong(start, end));
            expect(read(fixture, 'impureLong')).not.toBe(ruPureLong);
        });

        it('caches the result and does not call the formatter on every CD tick', () => {
            const fixture = TestBed.createComponent(DurationCacheHostComponent);

            fixture.componentInstance.range.set([start, end]);
            fixture.detectChanges();

            const spy = jest.spyOn(dateFormatter, 'durationLong');

            refresh(fixture);
            refresh(fixture);
            refresh(fixture);

            expect(spy).not.toHaveBeenCalled();
        });

        it('recomputes when the input range changes', () => {
            const fixture = TestBed.createComponent(DurationCacheHostComponent);

            fixture.componentInstance.range.set([start, end]);
            fixture.detectChanges();

            const spy = jest.spyOn(dateFormatter, 'durationLong');

            fixture.componentInstance.range.set([start, end.plus({ days: 1 })]);
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledTimes(1);
        });

        // `DateFormatter.duration*` throws on all of these; a throwing pipe would abort the whole view.
        describe('unformattable input', () => {
            // The last two cases are the tuple itself being missing rather than a bound inside it — what a
            // not-yet-populated input actually holds. `toDurationRange` used to destructure it and throw.
            const cases: [string, (d: DateTime) => RangeValue][] = [
                ['an empty tuple', () => []],
                ['a missing start', (d) => [null, d]],
                ['a missing end', (d) => [d, null]],
                ['both bounds missing', () => [null, null]],
                ['an unparseable bound', (d) => ['not-a-date', d]],
                ['a reversed range', (d) => [d.plus({ days: 1 }), d]],
                ['the whole value missing', () => null],
                ['the whole value undefined', () => undefined]
            ];

            it.each(cases)('renders an empty string for %s', (_, makeRange) => {
                const fixture = TestBed.createComponent(DurationPipesHostComponent);
                const legacyFixture = TestBed.createComponent(LegacyDurationPipesHostComponent);

                fixture.componentInstance.range.set(makeRange(start));
                legacyFixture.componentInstance.range.set(makeRange(start));

                expect(() => {
                    fixture.detectChanges();
                    legacyFixture.detectChanges();
                }).not.toThrow();

                Object.keys(durationExpect).forEach((id) => expect(read(fixture, id)).toBe(''));
                Object.keys(legacyDurationExpect).forEach((id) => expect(read(legacyFixture, id)).toBe(''));
            });
        });
    });

    describe('Date range pipes with missing bounds', () => {
        @Component({
            selector: 'kbq-range-bounds-host',
            imports: [
                KbqRangeLongDatePipe,
                KbqRangeLongDateTimePipe,
                KbqRangeMiddleDateTimePipe,
                KbqRangeShortDatePipe,
                KbqRangeShortDateTimePipe,
                RangeDateFormatterPipe,
                RangeDateTimeFormatterPipe,
                RangeMiddleDateTimeFormatterPipe,
                RangeShortDateFormatterPipe,
                RangeShortDateTimeFormatterPipe
            ],
            template: `
                <span id="kbqLong">{{ range() | kbqRangeLongDate }}</span>
                <span id="kbqLongTime">{{ range() | kbqRangeLongDateTime }}</span>
                <span id="kbqMidTime">{{ range() | kbqRangeMiddleDateTime }}</span>
                <span id="kbqShort">{{ range() | kbqRangeShortDate }}</span>
                <span id="kbqShortTime">{{ range() | kbqRangeShortDateTime }}</span>
                <span id="pureLong">{{ range() | rangeLongDate }}</span>
                <span id="pureLongTime">{{ range() | rangeLongDateTime }}</span>
                <span id="pureMidTime">{{ range() | rangeMiddleDateTime }}</span>
                <span id="pureShort">{{ range() | rangeShortDate }}</span>
                <span id="pureShortTime">{{ range() | rangeShortDateTime }}</span>
            `,
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class RangeBoundsHostComponent {
            readonly range = signal<RangeValue>([]);
        }

        let dateFormatter: DateFormatter<DateTime>;
        let testAdapter: LuxonDateAdapter;

        const allIds = [
            'kbqLong',
            'kbqLongTime',
            'kbqMidTime',
            'kbqShort',
            'kbqShortTime',
            'pureLong',
            'pureLongTime',
            'pureMidTime',
            'pureShort',
            'pureShortTime'
        ];

        const read = (fixture: ComponentFixture<unknown>, id: string): string =>
            fixture.nativeElement.querySelector(`#${id}`).textContent.trim();

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [RangeBoundsHostComponent, KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
                ]
            });
        });

        beforeEach(inject([DateAdapter, DateFormatter], (a: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
            testAdapter = a;
            dateFormatter = f;
        }));

        // `openedRangeDate` throws when neither bound is a date, which used to abort the rendering of the
        // whole host view — reachable from a template as soon as a range form control is left empty. The
        // last two cases are the tuple itself being missing rather than a bound inside it, which is what an
        // input that has not been populated yet actually holds.
        const emptyCases: [string, RangeValue][] = [
            ['an empty tuple', []],
            ['both bounds missing', [null, null]],
            ['both bounds unparseable', ['x', 'y']],
            ['the whole value missing', null],
            ['the whole value undefined', undefined]
        ];

        it.each(emptyCases)('renders an empty string for %s', (_, range) => {
            const fixture = TestBed.createComponent(RangeBoundsHostComponent);

            fixture.componentInstance.range.set(range);

            expect(() => fixture.detectChanges()).not.toThrow();

            allIds.forEach((id) => expect(read(fixture, id)).toBe(''));
        });

        it('keeps formatting an opened range when only one bound is set', () => {
            const fixture = TestBed.createComponent(RangeBoundsHostComponent);
            const date = testAdapter.createDate(2024, 0, 15);

            fixture.componentInstance.range.set([date, null]);
            fixture.detectChanges();

            expect(read(fixture, 'kbqLong')).toBe(dateFormatter.rangeLongDate(date, null));
            expect(read(fixture, 'kbqShort')).toBe(dateFormatter.rangeShortDate(date));
            expect(read(fixture, 'pureLong')).toBe(dateFormatter.rangeLongDate(date, null));
            expect(read(fixture, 'pureShort')).toBe(dateFormatter.rangeShortDate(date));
            // `rangeLongDateTime` types its end bound as `D`, not `D | null`, so the pipes pass `undefined`.
            expect(read(fixture, 'kbqLongTime')).toBe(dateFormatter.rangeLongDateTime(date));
            expect(read(fixture, 'kbqShortTime')).toBe(dateFormatter.rangeShortDateTime(date, null));
            expect(read(fixture, 'pureLongTime')).toBe(dateFormatter.rangeLongDateTime(date));
            expect(read(fixture, 'pureShortTime')).toBe(dateFormatter.rangeShortDateTime(date, null));

            // The middle format has no opened-range template, so it renders nothing instead of throwing.
            expect(read(fixture, 'kbqMidTime')).toBe('');
            expect(read(fixture, 'pureMidTime')).toBe('');
        });
    });

    describe('Legacy single-value date pipes with missing values', () => {
        @Component({
            selector: 'kbq-legacy-value-host',
            imports: [
                AbsoluteDateFormatterPipe,
                AbsoluteDateShortFormatterPipe,
                AbsoluteDateTimeFormatterPipe,
                AbsoluteShortDateTimeFormatterPipe,
                RelativeDateFormatterPipe,
                RelativeDateTimeFormatterPipe,
                RelativeShortDateFormatterPipe,
                RelativeShortDateTimeFormatterPipe
            ],
            template: `
                <span id="absLong">{{ value() | absoluteLongDate }}</span>
                <span id="absLongTime">{{ value() | absoluteLongDateTime }}</span>
                <span id="absShort">{{ value() | absoluteShortDate }}</span>
                <span id="absShortTime">{{ value() | absoluteShortDateTime }}</span>
                <span id="relLong">{{ value() | relativeLongDate }}</span>
                <span id="relLongTime">{{ value() | relativeLongDateTime }}</span>
                <span id="relShort">{{ value() | relativeShortDate }}</span>
                <span id="relShortTime">{{ value() | relativeShortDateTime }}</span>
            `,
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class LegacyValueHostComponent {
            readonly value = signal<DateTime | string | null | undefined>(null);
        }

        const allIds = [
            'absLong',
            'absLongTime',
            'absShort',
            'absShortTime',
            'relLong',
            'relLongTime',
            'relShort',
            'relShortTime'
        ];

        const read = (fixture: ComponentFixture<unknown>, id: string): string =>
            fixture.nativeElement.querySelector(`#${id}`).textContent.trim();

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [LegacyValueHostComponent, KbqFormattersModule, KbqLuxonDateModule],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
                ]
            });
        });

        // The `kbq*` family is covered above; these share the guard through `toValidDate`. An unparseable
        // string is the interesting case: `deserialize` answers it with a truthy *invalid* date, which the
        // formatter then refuses to format, so a plain truthiness check used to let it throw.
        const emptyValues: [string, DateTime | string | null | undefined][] = [
            ['null', null],
            ['undefined', undefined],
            ['an empty string', ''],
            ['an unparseable string', 'not-a-date']
        ];

        it.each(emptyValues)('renders an empty string for a value that is %s', (_, value) => {
            const fixture = TestBed.createComponent(LegacyValueHostComponent);

            fixture.componentInstance.value.set(value);

            expect(() => fixture.detectChanges()).not.toThrow();

            allIds.forEach((id) => expect(read(fixture, id)).toBe(''));
        });
    });

    describe('BaseLocaleAwareFormatterPipe caching', () => {
        // A getter rebuilds the tuple on every change detection cycle; an array literal written directly in
        // a template does not, because Angular memoizes it with `ɵɵpureFunction`.
        @Component({
            selector: 'kbq-rebuilt-range-host',
            imports: [KbqDurationLongPipe],
            template: '{{ range | kbqDurationLong }}',
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class RebuiltRangeHostComponent {
            from!: DateTime;
            to!: DateTime;

            get range(): DateTime[] {
                return [this.from, this.to];
            }
        }

        // The same for the arguments rather than the value: the `[from, to]` literal stays memoized while
        // `units` is rebuilt on every access, so only `argsEqual` decides whether the cache is hit.
        @Component({
            selector: 'kbq-rebuilt-units-host',
            imports: [KbqDurationLongPipe],
            template: '{{ [from, to] | kbqDurationLong: units }}',
            changeDetection: ChangeDetectionStrategy.OnPush
        })
        class RebuiltUnitsHostComponent {
            from!: DateTime;
            to!: DateTime;
            unitList: DurationUnit[] = ['hours', 'minutes'];

            get units(): DurationUnit[] {
                return [...this.unitList];
            }
        }

        let dateFormatter: DateFormatter<DateTime>;
        let testAdapter: LuxonDateAdapter;

        beforeEach(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [
                    RebuiltRangeHostComponent,
                    RebuiltUnitsHostComponent,
                    KbqFormattersModule,
                    KbqLuxonDateModule
                ],
                providers: [
                    { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                    { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }
                ]
            });
        });

        beforeEach(inject([DateAdapter, DateFormatter], (a: LuxonDateAdapter, f: DateFormatter<DateTime>) => {
            testAdapter = a;
            dateFormatter = f;
        }));

        it('hits the cache for a tuple rebuilt on every CD tick', () => {
            const fixture = TestBed.createComponent(RebuiltRangeHostComponent);

            fixture.componentInstance.from = testAdapter.createDateTime(2024, 0, 15, 10, 0, 0, 0);
            fixture.componentInstance.to = fixture.componentInstance.from.plus({ days: 2, hours: 4 });
            fixture.detectChanges();

            const spy = jest.spyOn(dateFormatter, 'durationLong');

            refresh(fixture);
            refresh(fixture);
            refresh(fixture);

            expect(spy).not.toHaveBeenCalled();
        });

        it('recomputes when an element of the rebuilt tuple changes', () => {
            const fixture = TestBed.createComponent(RebuiltRangeHostComponent);

            fixture.componentInstance.from = testAdapter.createDateTime(2024, 0, 15, 10, 0, 0, 0);
            fixture.componentInstance.to = fixture.componentInstance.from.plus({ days: 2, hours: 4 });
            fixture.detectChanges();

            const rendered = fixture.nativeElement.textContent.trim();

            fixture.componentInstance.to = fixture.componentInstance.from.plus({ days: 9 });
            refresh(fixture);

            expect(fixture.nativeElement.textContent.trim()).not.toBe(rendered);
        });

        it('hits the cache for a units array rebuilt on every CD tick', () => {
            const fixture = TestBed.createComponent(RebuiltUnitsHostComponent);

            fixture.componentInstance.from = testAdapter.createDateTime(2024, 0, 15, 10, 0, 0, 0);
            fixture.componentInstance.to = fixture.componentInstance.from.plus({ days: 2, hours: 4 });
            fixture.detectChanges();

            const spy = jest.spyOn(dateFormatter, 'durationLong');

            refresh(fixture);
            refresh(fixture);
            refresh(fixture);

            expect(spy).not.toHaveBeenCalled();
        });

        it('recomputes when an element of the rebuilt units array changes', () => {
            const fixture = TestBed.createComponent(RebuiltUnitsHostComponent);

            fixture.componentInstance.from = testAdapter.createDateTime(2024, 0, 15, 10, 0, 0, 0);
            fixture.componentInstance.to = fixture.componentInstance.from.plus({ days: 2, hours: 4 });
            fixture.detectChanges();

            const rendered = fixture.nativeElement.textContent.trim();

            // Same length as the initial units, so only an element-wise comparison can tell them apart.
            fixture.componentInstance.unitList = ['days', 'hours'];
            refresh(fixture);

            expect(fixture.nativeElement.textContent.trim()).not.toBe(rendered);
        });
    });
});

describe('Date pipes with KBQ_DATE_TIMEZONE', () => {
    /** 15:30 in Kolkata, 10:00 in UTC. */
    const instant = '2026-03-05T10:00:00Z';

    @Component({
        selector: 'timezone-pipe-host',
        imports: [KbqAbsoluteShortDateTimePipe, AbsoluteShortDateTimeFormatterPipe],
        template: `
            <span class="impure">{{ value | kbqAbsoluteShortDateTime }}</span>
            <span class="pure">{{ value | absoluteShortDateTime }}</span>
        `,
        changeDetection: ChangeDetectionStrategy.OnPush
    })
    class HostComponent {
        readonly value = instant;
    }

    let fixture: ComponentFixture<HostComponent>;

    const textOf = (selector: string): string => fixture.nativeElement.querySelector(selector).textContent.trim();

    beforeEach(() => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HostComponent, KbqFormattersModule, KbqLuxonDateModule],
            providers: [
                { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                kbqDateTimezoneProvider('Asia/Kolkata')
            ]
        });

        fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
    });

    it('renders dates in the configured time zone', () => {
        expect(textOf('.impure')).toContain('15:30');
        expect(textOf('.pure')).toContain('15:30');
    });

    it('re-renders the impure pipe when the time zone changes at runtime', () => {
        TestBed.inject(KbqDateTimezoneService).setTimezone('utc');
        fixture.detectChanges();

        expect(textOf('.impure')).toContain('10:00');
    });

    it('leaves the pure pipe in the zone it first rendered in', () => {
        TestBed.inject(KbqDateTimezoneService).setTimezone('utc');
        fixture.detectChanges();

        expect(textOf('.pure')).toContain('15:30');
    });
});

describe('Date pipes with a component-scoped KBQ_DATE_TIMEZONE', () => {
    const instant = '2026-03-05T10:00:00Z';

    @Component({
        selector: 'scoped-timezone-host',
        imports: [KbqAbsoluteShortDateTimePipe],
        template: '{{ value | kbqAbsoluteShortDateTime }}',
        providers: [
            kbqDateTimezoneProvider('utc'),
            { provide: DateAdapter, useClass: LuxonDateAdapter },
            DateFormatter
        ],
        changeDetection: ChangeDetectionStrategy.OnPush
    })
    class ScopedComponent {
        readonly value = instant;
    }

    @Component({
        selector: 'timezone-app-host',
        imports: [KbqAbsoluteShortDateTimePipe, ScopedComponent],
        template: `
            <span class="application">{{ value | kbqAbsoluteShortDateTime }}</span>
            <scoped-timezone-host />
        `,
        changeDetection: ChangeDetectionStrategy.OnPush
    })
    class HostComponent {
        readonly value = instant;
    }

    it('renders the scoped subtree in its own zone', () => {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({
            imports: [HostComponent, KbqFormattersModule, KbqLuxonDateModule],
            providers: [
                { provide: KBQ_LOCALE_ID, useValue: 'ru-RU' },
                { provide: KBQ_LOCALE_DATA, useValue: KBQ_DEFAULT_LOCALE_DATA_FACTORY() },
                { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                kbqDateTimezoneProvider('Asia/Kolkata')
            ]
        });

        const fixture = TestBed.createComponent(HostComponent);

        fixture.detectChanges();

        expect(fixture.nativeElement.querySelector('.application').textContent).toContain('15:30');
        expect(fixture.nativeElement.querySelector('scoped-timezone-host').textContent).toContain('10:00');
    });
});
