import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Type, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, UntypedFormControl } from '@angular/forms';
import { KbqAutocompleteModule, KbqAutocompleteTrigger } from '@koobiq/components/autocomplete';
import { KbqLocaleServiceModule, KbqOption, typeInElement } from '@koobiq/components/core';
import { KbqInputModule } from '@koobiq/components/input';

@Component({
    imports: [KbqInputModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [kbqAutocomplete]="insideAuto" [formControl]="control" />

            <kbq-autocomplete #insideAuto="kbqAutocomplete" [autoActiveFirstOption]="false">
                @for (state of states; track state) {
                    <kbq-option [value]="state">{{ state }}</kbq-option>
                }
            </kbq-autocomplete>
        </kbq-form-field>
    `
})
class PanelInsideFormField {
    readonly control = new UntypedFormControl();
    readonly states = ['Alabama', 'California'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly options = viewChildren(KbqOption);
}

@Component({
    imports: [KbqInputModule, KbqAutocompleteModule, ReactiveFormsModule],
    template: `
        <kbq-form-field>
            <input kbqInput [kbqAutocomplete]="outsideAuto" [formControl]="control" />
        </kbq-form-field>

        <kbq-autocomplete #outsideAuto="kbqAutocomplete" [autoActiveFirstOption]="false">
            @for (state of states; track state) {
                <kbq-option [value]="state">{{ state }}</kbq-option>
            }
        </kbq-autocomplete>
    `
})
class PanelOutsideFormField {
    readonly control = new UntypedFormControl();
    readonly states = ['Alabama', 'California'];
    readonly trigger = viewChild.required(KbqAutocompleteTrigger);
    readonly options = viewChildren(KbqOption);
}

/** Chooses the first option with a click, clears the field and reports whether that option is still selected. */
async function chooseThenClear(component: Type<PanelInsideFormField | PanelOutsideFormField>): Promise<boolean> {
    const fixture = TestBed.createComponent(component);

    fixture.detectChanges();
    await fixture.whenStable();

    const { trigger, options, control } = fixture.componentInstance;
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    trigger().open();
    fixture.detectChanges();
    await fixture.whenStable();

    TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll<HTMLElement>('kbq-option')[0].click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(control.value).toBe('Alabama');
    expect(options()[0].selected).toBe(true);

    typeInElement('', input);
    fixture.detectChanges();
    // The panel deselects a task after the empty value, through an RxJS `delay(0)`.
    await new Promise((resolve) => setTimeout(resolve, 20));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(control.value).toBe('');

    const stillSelected = options()[0].selected;

    trigger().closePanel();
    fixture.destroy();

    return stillSelected;
}

describe('triage: clearing the field and the selected option', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [KbqLocaleServiceModule] });
    });

    afterEach(() => TestBed.inject(OverlayContainer).ngOnDestroy());

    it('control: with kbq-autocomplete inside the kbq-form-field, clearing the field deselects the option', async () => {
        expect(await chooseThenClear(PanelInsideFormField)).toBe(false);
    });

    it('DEFECT: with kbq-autocomplete outside the kbq-form-field, a cleared field leaves the old option selected', async () => {
        expect(await chooseThenClear(PanelOutsideFormField)).toBe(true);
    });
});
