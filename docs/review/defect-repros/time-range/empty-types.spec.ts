import { ChangeDetectionStrategy, Component, Type } from '@angular/core';
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
class EmptyTypesApp {
    readonly types: KbqTimeRangeType[] = [];
    readonly control = new FormControl<KbqTimeRangeRange>({ type: 'last24Hours' }, { nonNullable: true });
    readonly corrections: KbqTimeRangeRange[] = [];
}

@Component({
    imports: [KbqTimeRange],
    template: `
        <kbq-time-range [availableTimeRangeTypes]="types" [showRangeAsDefault]="false" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class EmptyTypesNoRangeApp {
    readonly types: KbqTimeRangeType[] = [];
}

describe('triage: time-range with an empty availableTimeRangeTypes', () => {
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

    const open = async (): Promise<void> => {
        fixture.debugElement.query(By.directive(KbqTimeRangeTitle)).nativeElement.click();
        await settle();
    };

    const editorForm = (): FormGroup =>
        (
            fixture.debugElement.query(By.directive(KbqTimeRangeEditor)).componentInstance as unknown as {
                form: FormGroup;
            }
        ).form;

    beforeEach(() => vi.useFakeTimers());

    afterEach(() => vi.useRealTimers());

    it('DEFECT: the one-time switch to range reaches the control as a user change and is not reported', async () => {
        const { componentInstance: host } = await create(EmptyTypesApp);

        expect(host.control.value.type).toBe('range');
        expect(host.control.dirty).toBe(true);
        expect(host.corrections.some(({ type }) => type === 'range')).toBe(false);
    });

    it('DEFECT: a preset written after init is kept and the editor offers no way to the range fields', async () => {
        const { componentInstance: host, debugElement } = await create(EmptyTypesApp);

        host.control.setValue({ type: 'lastHour' });
        fixture.detectChanges();

        const timeRange = debugElement.query(By.directive(KbqTimeRange)).componentInstance as KbqTimeRange<unknown>;

        expect(timeRange.value()?.type).toBe('lastHour');

        await open();

        const form = editorForm();

        expect(form.controls['type'].value).toBe('lastHour');
        expect(form.controls['fromDate'].disabled).toBe(true);
        expect(form.controls['toTime'].disabled).toBe(true);
        expect(document.querySelector('.kbq-time-range__editor kbq-radio-group')).toBeNull();
        expect(document.querySelectorAll('.kbq-time-range__editor input[type="radio"]').length).toBe(0);
        expect(document.querySelector('.kbq-time-range-editor__range')).toBeTruthy();
    });

    it('DEFECT: with showRangeAsDefault=false the editor renders nothing', async () => {
        await create(EmptyTypesNoRangeApp);
        await open();

        const editor = document.querySelector('.kbq-time-range__editor')!;

        expect(editor).toBeTruthy();
        expect(editor.querySelectorAll('input').length).toBe(0);
        expect(editor.querySelector('.kbq-time-range-editor__container')!.children.length).toBe(0);
    });
});
