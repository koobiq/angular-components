import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import {
    KbqAutocompleteModule,
    KbqAutocompleteSelectedEvent,
    KbqAutocompleteTrigger
} from '@koobiq/components/autocomplete';
import { KbqLocaleServiceModule, KbqOption } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [kbqAutocomplete]="auto" [formControl]="control" />
        </kbq-form-field>

        <kbq-autocomplete #auto="kbqAutocomplete" [autoActiveFirstOption]="false" (optionSelected)="selected($event)">
            @for (state of states; track state) {
                <kbq-option [value]="state">{{ state }}</kbq-option>
            }
        </kbq-autocomplete>
    `
})
class TestApp {
    readonly control = new UntypedFormControl();
    readonly states = ['Alabama', 'California', 'Florida'];
    readonly selected = vi.fn<(event: KbqAutocompleteSelectedEvent) => void>();
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly options = viewChildren(KbqOption);
}

describe('triage: programmatic selection changes while the panel is open', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule] });
    });

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('DEFECT: a programmatic select() closes the panel, writes the value and emits optionSelected', async () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const { trigger, options, control, selected } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        trigger().open();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(true);

        options()[1].select();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(false);
        expect(control.value).toBe('California');
        expect(input.value).toBe('California');
        expect(selected).toHaveBeenCalledTimes(1);
        expect(selected.mock.calls[0][0].option).toBe(options()[1]);
    });

    it('DEFECT: a programmatic deselect() writes the deselected option value and emits optionSelected for it', async () => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const { trigger, options, control, selected } = fixture.componentInstance;
        const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

        trigger().open();
        fixture.detectChanges();
        await fixture.whenStable();

        TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll<HTMLElement>('kbq-option')[0].click();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(control.value).toBe('Alabama');
        expect(options()[0].selected).toBe(true);

        control.setValue('Flo');
        fixture.detectChanges();
        await fixture.whenStable();

        expect(input.value).toBe('Flo');

        selected.mockClear();
        trigger().open();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(trigger().panelOpen).toBe(true);

        options()[0].deselect();
        fixture.detectChanges();
        await fixture.whenStable();

        expect(options()[0].selected).toBe(false);
        expect(trigger().panelOpen).toBe(false);
        // The value of the option that was just deselected replaces what the field held.
        expect(control.value).toBe('Alabama');
        expect(input.value).toBe('Alabama');
        expect(selected).toHaveBeenCalledTimes(1);
        expect(selected.mock.calls[0][0].option).toBe(options()[0]);
    });
});
