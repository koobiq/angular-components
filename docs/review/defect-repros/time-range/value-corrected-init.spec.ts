import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import { KbqTimeRange, KbqTimeRangeRange, KbqTimeRangeType } from '@koobiq/components/time-range';

@Component({
    imports: [KbqTimeRange, ReactiveFormsModule],
    template: `
        <kbq-time-range
            [formControl]="control"
            [availableTimeRangeTypes]="types"
            (valueCorrected)="corrections.push($event)"
        />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ReactiveApp {
    readonly types: KbqTimeRangeType[] = ['lastHour', 'last24Hours', 'range'];
    // Not in the list, so it has to be corrected once.
    readonly control = new FormControl<KbqTimeRangeRange>({ type: 'currentYear' }, { nonNullable: true });
    readonly corrections: KbqTimeRangeRange[] = [];
}

@Component({
    imports: [KbqTimeRange, FormsModule],
    template: `
        <kbq-time-range [(ngModel)]="model" (valueCorrected)="corrections.push($event)" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class NgModelApp {
    // Valid as is: listed by default and carrying its start.
    model: KbqTimeRangeRange = { type: 'last24Hours', startDateTime: '2024-01-01T00:00:00.000Z' };
    readonly corrections: KbqTimeRangeRange[] = [];
}

describe('triage: valueCorrected at initialization', () => {
    let fixture: ComponentFixture<unknown>;

    const settle = async (): Promise<void> => {
        for (let i = 0; i < 3; i++) {
            await vi.advanceTimersByTimeAsync(100);
            fixture.detectChanges();
        }
    };

    const create = async <T>(component: Type<T>): Promise<ComponentFixture<T>> => {
        TestBed.configureTestingModule({ imports: [component, KbqLuxonDateModule, KbqFormattersModule] });
        const created = TestBed.createComponent(component);

        fixture = created;
        created.autoDetectChanges();
        await settle();

        return created;
    };

    beforeEach(() => vi.useFakeTimers());

    afterEach(() => vi.useRealTimers());

    it('DEFECT: an initial value that needs correction is reported twice', async () => {
        const { componentInstance: host } = await create(ReactiveApp);

        expect(host.corrections.map(({ type }) => type)).toEqual(['lastHour', 'lastHour']);
    });

    it('DEFECT: under ngModel a correction of null is reported although the model value is valid', async () => {
        const { componentInstance: host, debugElement } = await create(NgModelApp);
        const timeRange = debugElement.query(By.directive(KbqTimeRange)).componentInstance as KbqTimeRange<unknown>;

        // The model's own value did arrive and was accepted as is.
        expect(timeRange.value()).toEqual(host.model);
        // Yet the host was told its value had been corrected to the default.
        expect(host.corrections.length).toBeGreaterThan(0);
        expect(host.corrections.every(({ type }) => type === 'lastHour')).toBe(true);
    });
});
