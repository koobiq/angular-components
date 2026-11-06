import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqLuxonDateModule } from '@koobiq/angular-luxon-adapter/adapter';
import { KbqFormattersModule } from '@koobiq/components/core';
import {
    KbqTimeRange,
    KbqTimeRangeEditor,
    KbqTimeRangeRange,
    KbqTimeRangeTitle,
    KbqTimeRangeType
} from '@koobiq/components/time-range';

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
class TestApp {
    // `range` is not listed; `showRangeAsDefault` is left at its default `true`.
    readonly types: KbqTimeRangeType[] = ['lastHour', 'last24Hours'];
    readonly control = new FormControl<KbqTimeRangeRange>({ type: 'lastHour' }, { nonNullable: true });
    readonly corrections: KbqTimeRangeRange[] = [];
}

describe('triage: a manual range applied while `range` is not listed does not survive a write-back', () => {
    let fixture: ComponentFixture<TestApp>;

    const settle = async (): Promise<void> => {
        for (let i = 0; i < 3; i++) {
            await vi.advanceTimersByTimeAsync(100);
            fixture.detectChanges();
        }
    };

    beforeEach(() => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({ imports: [TestApp, KbqLuxonDateModule, KbqFormattersModule] });
        fixture = TestBed.createComponent(TestApp);
        fixture.autoDetectChanges();
    });

    afterEach(() => vi.useRealTimers());

    it('DEFECT: writing back the range the user applied replaces it with the first listed type', async () => {
        const { componentInstance: host, debugElement } = fixture;

        debugElement.query(By.directive(KbqTimeRangeTitle)).nativeElement.click();
        await settle();

        // The range option is offered although `range` is not in the list.
        expect(document.querySelector('.kbq-time-range-editor__range-option')).toBeTruthy();

        const editor = debugElement.query(By.directive(KbqTimeRangeEditor)).componentInstance as unknown as {
            form: FormGroup;
        };

        editor.form.controls['type'].setValue('range');
        fixture.detectChanges();

        document.querySelector<HTMLButtonElement>('.kbq-time-range__buttons button')!.click();
        await settle();

        const applied = host.control.value;

        expect(applied.type).toBe('range');
        expect(applied.startDateTime).toBeTruthy();
        expect(applied.endDateTime).toBeTruthy();

        host.corrections.length = 0;
        // The same value written back, e.g. restored from a URL.
        host.control.setValue({ ...applied });
        fixture.detectChanges();

        const timeRange = debugElement.query(By.directive(KbqTimeRange)).componentInstance as KbqTimeRange<unknown>;

        expect(timeRange.value()?.type).toBe('lastHour');
        expect(host.corrections.map(({ type }) => type)).toEqual(['lastHour']);
        // The bound control keeps the range while the component shows the first type.
        expect(host.control.value.type).toBe('range');
    });
});
