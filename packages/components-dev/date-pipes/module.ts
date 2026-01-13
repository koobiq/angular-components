import { ChangeDetectionStrategy, Component, inject, ViewEncapsulation } from '@angular/core';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, DateFormatter, KbqFormattersModule, KbqLocaleService } from '@koobiq/components/core';
import { DateTime } from 'luxon';

@Component({
    selector: 'dev-app',
    imports: [KbqLuxonDateModule, KbqFormattersModule],
    templateUrl: 'template.html',
    styleUrls: ['styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {
    protected readonly dateAdapter: DateAdapter<DateTime> = inject(DateAdapter<DateTime>);
    protected readonly formatter: DateFormatter<DateTime> = inject(DateFormatter<DateTime>);
    protected readonly localeService: KbqLocaleService = inject(KbqLocaleService);

    obj: any = {
        absolute: {
            long: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    notCurrentYear: ''
                }
            },
            short: {
                date: {
                    currentYear: '',
                    notCurrentYear: ''
                },
                dateTime: {
                    currentYear: '',
                    notCurrentYear: ''
                }
            }
        },
        relative: {
            long: {
                beforeYesterdayNotCurrentYear: '',
                beforeYesterdayCurrentYear: '',
                yesterday: '',
                today: '',
                tomorrow: '',
                afterTomorrowCurrentYear: '',
                afterTomorrowNotCurrentYear: ''
            },
            short: {
                beforeYesterdayNotCurrentYear: '',
                beforeYesterdayCurrentYear: '',
                yesterday: '',
                today: '',
                tomorrow: '',
                afterTomorrowCurrentYear: '',
                afterTomorrowNotCurrentYear: ''
            }
        },
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
                    endsNotCurrentYear: '',
                    sameDateCurrentYear: '',
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: ''
                }
            },
            middle: {
                dateTime: {
                    currentYear: '',
                    sameDateCurrentYear: '',
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
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
                    sameDateNotCurrentYear: '',
                    notCurrentMonth: '',
                    startsNotCurrentYear: '',
                    endsNotCurrentYear: ''
                }
            }
        }
    };

    iso = JSON.parse(JSON.stringify(this.obj));
    publishedAt = '2022-02-02 10:04:08.049306';

    constructor() {
        this.populateAbsoluteLong();
        this.populateAbsoluteShort();
        this.populateRelativeLong();
        this.populateRelativeShort();
        this.populateRangeLong();
        this.populateRangeMiddle();
        this.populateRangeShort();
    }

    populateRangeShort() {
        const now = this.dateAdapter.today();

        this.obj.range.short.date.currentMonth = [
            now.set({ day: 1 }),
            now.set({ day: 10 })
        ];
        this.obj.range.short.date.notCurrentYear = [
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 })
        ];
        this.obj.range.short.date.startsNotCurrentYear = [
            now.set({ day: 1, month: 1 }).minus({ years: 1 }),
            now.set({ day: 10, month: 2 })
        ];
        this.obj.range.short.date.endsNotCurrentYear = [
            now.set({ day: 1, month: 1 }),
            now.set({ day: 10, month: 2 }).plus({ years: 1 })
        ];
        this.obj.range.short.dateTime.sameDateCurrentYear = [
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        ];
        this.obj.range.short.dateTime.sameDateNotCurrentYear = [
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        ];
        this.obj.range.short.dateTime.notCurrentMonth = [
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        ];
        this.obj.range.short.dateTime.startsNotCurrentYear = [
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        ];
        this.obj.range.short.dateTime.endsNotCurrentYear = [
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        ];

        this.iso.range.short.date.currentMonth = [
            this.dateAdapter.toIso8601(now.set({ day: 1 })),
            this.dateAdapter.toIso8601(now.set({ day: 10 }))
        ];
        this.iso.range.short.date.notCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 1, month: 1 })),
            this.dateAdapter.toIso8601(now.set({ day: 10, month: 2 }))
        ];
        this.iso.range.short.date.startsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 1, month: 1 }).minus({ years: 1 })),
            this.dateAdapter.toIso8601(now.set({ day: 10, month: 2 }))
        ];
        this.iso.range.short.date.endsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 1, month: 1 })),
            this.dateAdapter.toIso8601(now.set({ day: 10, month: 2 }).plus({ years: 1 }))
        ];
        this.iso.range.short.dateTime.sameDateCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 10, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ day: 10, hour: 11, minute: 28 }))
        ];
        this.iso.range.short.dateTime.sameDateNotCurrentYear = [
            this.dateAdapter.toIso8601(
                now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 })
            ),
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }))
        ];
        this.iso.range.short.dateTime.notCurrentMonth = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 1, hour: 11, minute: 28 }))
        ];
        this.iso.range.short.dateTime.startsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 1, hour: 11, minute: 28 }))
        ];
        this.iso.range.short.dateTime.endsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ day: 1, month: 2 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }))
        ];

        console.log('populateRangeShort: ');
    }

    populateRangeMiddle() {
        const now = this.dateAdapter.today();

        this.obj.range.middle.dateTime.currentYear = [
            now.set({ day: 1 }),
            now.set({ day: 10 })
        ];
        this.obj.range.middle.dateTime.sameDateCurrentYear = [
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 10, minute: 28 })
        ];
        this.obj.range.middle.dateTime.sameDateNotCurrentYear = [
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        ];
        this.obj.range.middle.dateTime.notCurrentMonth = [
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        ];
        this.obj.range.middle.dateTime.startsNotCurrentYear = [
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1, hour: 11, minute: 28 })
        ];
        this.obj.range.middle.dateTime.endsNotCurrentYear = [
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 })
        ];

        this.iso.range.middle.dateTime.currentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 1 })),
            this.dateAdapter.toIso8601(now.set({ day: 10 }))
        ];
        this.iso.range.middle.dateTime.sameDateCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 10, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ day: 10, hour: 10, minute: 28 }))
        ];
        this.iso.range.middle.dateTime.sameDateNotCurrentYear = [
            this.dateAdapter.toIso8601(
                now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 })
            ),
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }))
        ];
        this.iso.range.middle.dateTime.notCurrentMonth = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 1, hour: 11, minute: 28 }))
        ];
        this.iso.range.middle.dateTime.startsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 11, minute: 28 }))
        ];
        this.iso.range.middle.dateTime.endsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 }).plus({ years: 1 }).set({ hour: 11, minute: 28 }))
        ];
    }

    populateRangeLong() {
        const now = this.dateAdapter.today();

        this.obj.range.long.date.currentMonth = [now.set({ day: 1 }), now.set({ day: 10 })];
        this.obj.range.long.date.notCurrentYear = [
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 })
        ];
        this.obj.range.long.date.startsNotCurrentYear = [
            now.set({ month: 1, day: 1 }).minus({ years: 1 }),
            now.set({ month: 2, day: 10 })
        ];
        this.obj.range.long.date.endsNotCurrentYear = [
            now.set({ month: 1, day: 1 }),
            now.set({ month: 2, day: 10 }).plus({ years: 1 })
        ];
        this.obj.range.long.dateTime.sameDateCurrentYear = [
            now.set({ day: 10, hour: 10, minute: 14 }),
            now.set({ day: 10, hour: 11, minute: 28 })
        ];
        this.obj.range.long.dateTime.sameDateNotCurrentYear = [
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        ];
        this.obj.range.long.dateTime.notCurrentMonth = [
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        ];
        this.obj.range.long.dateTime.startsNotCurrentYear = [
            now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1, hour: 11, minute: 28 })
        ];
        this.obj.range.long.dateTime.endsNotCurrentYear = [
            now.set({ month: 1, day: 1, hour: 10, minute: 14 }),
            now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 })
        ];

        this.iso.range.long.date.currentMonth = [
            this.dateAdapter.toIso8601(now.set({ day: 1 })),
            this.dateAdapter.toIso8601(now.set({ day: 10 }))
        ];
        this.iso.range.long.date.notCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 10 }))
        ];
        this.iso.range.long.date.startsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 }).minus({ years: 1 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 10 }))
        ];
        this.iso.range.long.date.endsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 10 }).plus({ years: 1 }))
        ];
        this.iso.range.long.dateTime.sameDateCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ day: 10, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ day: 10, hour: 11, minute: 28 }))
        ];
        this.iso.range.long.dateTime.sameDateNotCurrentYear = [
            this.dateAdapter.toIso8601(
                now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 10, minute: 14 })
            ),
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 11 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }))
        ];
        this.iso.range.long.dateTime.notCurrentMonth = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 1, hour: 11, minute: 28 }))
        ];
        this.iso.range.long.dateTime.startsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1 }).minus({ years: 1 }).set({ hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 1, hour: 11, minute: 28 }))
        ];
        this.iso.range.long.dateTime.endsNotCurrentYear = [
            this.dateAdapter.toIso8601(now.set({ month: 1, day: 1, hour: 10, minute: 14 })),
            this.dateAdapter.toIso8601(now.set({ month: 2, day: 1 }).minus({ years: 1 }).set({ hour: 11, minute: 28 }))
        ];
    }

    populateRelativeShort() {
        const now = this.dateAdapter.today();

        this.obj.relative.short.beforeYesterdayNotCurrentYear = now.minus({ years: 1, days: 2 });
        this.obj.relative.short.beforeYesterdayCurrentYear = now.minus({ days: 2 });
        this.obj.relative.short.yesterday = now.minus({ days: 1 });
        this.obj.relative.short.today = now.minus({ hours: 1 });
        this.obj.relative.short.tomorrow = now.plus({ days: 1, hours: 1 });
        this.obj.relative.short.afterTomorrowCurrentYear = now.plus({ days: 2 });
        this.obj.relative.short.afterTomorrowNotCurrentYear = now.plus({ years: 1, days: 2 });

        this.iso.relative.short.beforeYesterdayNotCurrentYear = this.dateAdapter.toIso8601(
            now.minus({ years: 1, days: 2 })
        );
        this.iso.relative.short.beforeYesterdayCurrentYear = this.dateAdapter.toIso8601(now.minus({ days: 2 }));
        this.iso.relative.short.yesterday = this.dateAdapter.toIso8601(now.minus({ days: 1 }));
        this.iso.relative.short.today = this.dateAdapter.toIso8601(now.minus({ hours: 1 }));
        this.iso.relative.short.tomorrow = this.dateAdapter.toIso8601(now.plus({ days: 1, hours: 1 }));
        this.iso.relative.short.afterTomorrowCurrentYear = this.dateAdapter.toIso8601(now.plus({ days: 2 }));
        this.iso.relative.short.afterTomorrowNotCurrentYear = this.dateAdapter.toIso8601(
            now.plus({ years: 1, days: 2 })
        );
    }

    populateRelativeLong() {
        const now = this.dateAdapter.today();

        this.obj.relative.long.beforeYesterdayNotCurrentYear = now.minus({ years: 1, days: 2 });
        this.obj.relative.long.beforeYesterdayCurrentYear = now.minus({ days: 2 });
        this.obj.relative.long.yesterday = now.minus({ days: 1 });
        this.obj.relative.long.today = now.minus({ hours: 1 });
        this.obj.relative.long.tomorrow = now.plus({ days: 1, hours: 1 });
        this.obj.relative.long.afterTomorrowCurrentYear = now.plus({ days: 2 });
        this.obj.relative.long.afterTomorrowNotCurrentYear = now.plus({ years: 1, days: 2 });

        this.iso.relative.long.beforeYesterdayNotCurrentYear = this.dateAdapter.toIso8601(
            now.minus({ years: 1, days: 2 })
        );
        this.iso.relative.long.beforeYesterdayCurrentYear = this.dateAdapter.toIso8601(now.minus({ days: 2 }));
        this.iso.relative.long.yesterday = this.dateAdapter.toIso8601(now.minus({ days: 1 }));
        this.iso.relative.long.today = this.dateAdapter.toIso8601(now.minus({ hours: 1 }));
        this.iso.relative.long.tomorrow = this.dateAdapter.toIso8601(now.plus({ days: 1, hours: 1 }));
        this.iso.relative.long.afterTomorrowCurrentYear = this.dateAdapter.toIso8601(now.plus({ days: 2 }));
        this.iso.relative.long.afterTomorrowNotCurrentYear = this.dateAdapter.toIso8601(
            now.plus({ years: 1, days: 2 })
        );
    }

    populateAbsoluteShort() {
        const now = this.dateAdapter.today();

        this.obj.absolute.short.date.currentYear = now;
        this.obj.absolute.short.date.notCurrentYear = now.minus({ years: 1 });
        this.obj.absolute.short.dateTime.currentYear = now;
        this.obj.absolute.short.dateTime.notCurrentYear = now.minus({ years: 1 });

        this.iso.absolute.short.date.currentYear = this.dateAdapter.toIso8601(now);
        this.iso.absolute.short.date.notCurrentYear = this.dateAdapter.toIso8601(now.minus({ years: 1 }));
        this.iso.absolute.short.dateTime.currentYear = this.dateAdapter.toIso8601(now);
        this.iso.absolute.short.dateTime.notCurrentYear = this.dateAdapter.toIso8601(now.minus({ years: 1 }));
    }

    populateAbsoluteLong() {
        const now = this.dateAdapter.today();

        this.obj.absolute.long.date.currentYear = now;
        this.obj.absolute.long.date.notCurrentYear = now.minus({ years: 1 });
        this.obj.absolute.long.dateTime.currentYear = now;
        this.obj.absolute.long.dateTime.notCurrentYear = now.minus({ years: 1 });

        this.iso.absolute.long.date.currentYear = this.dateAdapter.toIso8601(now);
        this.iso.absolute.long.date.notCurrentYear = this.dateAdapter.toIso8601(now.minus({ years: 1 }));
        this.iso.absolute.long.dateTime.currentYear = this.dateAdapter.toIso8601(now);
        this.iso.absolute.long.dateTime.notCurrentYear = this.dateAdapter.toIso8601(now.minus({ years: 1 }));
    }
}
