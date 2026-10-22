import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { DateAdapter, KbqFormattersModule } from '@koobiq/components/core';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeTitle } from '@koobiq/components/time-range';

const fromNow = (units: { hours?: number; minutes?: number }): string => {
    const adapter = inject<DateAdapter<unknown>>(DateAdapter);

    return adapter.toIso8601(adapter.addCalendarUnits(adapter.today(), units));
};

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class StaleStartApp {
    // `lastHour` restored with the start it was applied with three hours ago.
    readonly control = new FormControl<KbqTimeRangeRange>(
        { type: 'lastHour', startDateTime: fromNow({ hours: -3 }) },
        { nonNullable: true }
    );
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class FutureStartApp {
    // A start a minute ahead, e.g. written by a machine whose clock runs fast.
    readonly control = new FormControl<KbqTimeRangeRange>(
        { type: 'lastHour', startDateTime: fromNow({ minutes: 1 }) },
        { nonNullable: true }
    );
}

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range [formControl]="control" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class UnparseableStartApp {
    readonly control = new FormControl<KbqTimeRangeRange>(
        { type: 'lastHour', startDateTime: 'not-a-date' },
        { nonNullable: true }
    );
}

describe('triage: the built-in label of a duration preset is computed from the stored start', () => {
    const configure = (component: unknown): void => {
        TestBed.configureTestingModule({
            imports: [component as never, KbqLuxonDateModule, KbqFormattersModule]
        });
    };

    beforeEach(() => vi.useFakeTimers());

    afterEach(() => vi.useRealTimers());

    it('DEFECT: a stale lastHour start makes the trigger read "last 3 hours"', () => {
        configure(StaleStartApp);
        const fixture = TestBed.createComponent(StaleStartApp);

        fixture.detectChanges();

        const trigger = fixture.debugElement.query(By.directive(KbqTimeRangeTitle)).nativeElement as HTMLElement;
        const timeRange = fixture.debugElement.query(By.directive(KbqTimeRange))
            .componentInstance as KbqTimeRange<unknown>;

        expect(timeRange.value()?.type).toBe('lastHour');
        expect(trigger.textContent!.trim()).toBe('последние 3 часа');
    });

    it('DEFECT: a start in the future makes the trigger throw while rendering', () => {
        configure(FutureStartApp);
        const fixture = TestBed.createComponent(FutureStartApp);

        expect(() => fixture.detectChanges()).toThrow('Invalid date');
    });

    it('DEFECT: an unparseable start makes the trigger throw while rendering', () => {
        configure(UnparseableStartApp);
        const fixture = TestBed.createComponent(UnparseableStartApp);

        expect(() => fixture.detectChanges()).toThrow('Invalid date');
    });
});
