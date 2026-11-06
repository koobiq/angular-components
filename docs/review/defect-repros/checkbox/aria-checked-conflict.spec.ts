import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_CHECKBOX_CLICK_ACTION, KbqCheckboxModule } from '@koobiq/components/checkbox';
import axe from 'axe-core';

@Component({
    imports: [KbqCheckboxModule],
    template: `
        <kbq-checkbox checked indeterminate>Select all</kbq-checkbox>
    `
})
class CheckedAndIndeterminate {}

@Component({
    imports: [KbqCheckboxModule],
    template: `
        <kbq-checkbox indeterminate>Select all</kbq-checkbox>
    `
})
class IndeterminateOnly {}

const conflictingAriaChecked = async (element: Element) => {
    const { violations } = await axe.run(element, { runOnly: { type: 'rule', values: ['aria-conditional-attr'] } });

    return violations.find(({ id }) => id === 'aria-conditional-attr');
};

describe('KbqCheckbox triage: aria-checked contradicts the native mixed state', () => {
    it('DEFECT: checked + indeterminate renders aria-checked="true" on a natively indeterminate input', async () => {
        const fixture = TestBed.createComponent(CheckedAndIndeterminate);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-checkbox');
        const input: HTMLInputElement = host.querySelector('input')!;

        // The mixed mark is shown (`.kbq-indeterminate` wins over `.kbq-checked` in checkbox.scss)
        // and the native input is indeterminate...
        expect(host.classList).toContain('kbq-checked');
        expect(host.classList).toContain('kbq-indeterminate');
        expect(input.checked).toBe(true);
        expect(input.indeterminate).toBe(true);
        // ...but ARIA says "checked".
        expect(input.getAttribute('aria-checked')).toBe('true');

        const violation = await conflictingAriaChecked(fixture.nativeElement);

        expect(violation).toBeDefined();
        expect(violation!.nodes[0].html.startsWith('<input')).toBe(true);
    });

    it('RELATED (not in the list): with the `check` click action a click clears the native indeterminate while the component keeps it', async () => {
        TestBed.configureTestingModule({ providers: [{ provide: KBQ_CHECKBOX_CLICK_ACTION, useValue: 'check' }] });

        const fixture = TestBed.createComponent(IndeterminateOnly);

        fixture.detectChanges();

        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-checkbox');
        const input: HTMLInputElement = host.querySelector('input')!;

        expect(input.indeterminate).toBe(true);
        expect(input.getAttribute('aria-checked')).toBe('mixed');

        input.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // The click's own activation behaviour cleared the native flag; the `[indeterminate]` binding
        // did not change, so nothing writes it back.
        expect(input.indeterminate).toBe(false);
        expect(input.checked).toBe(true);
        expect(host.classList).toContain('kbq-indeterminate');
        expect(input.getAttribute('aria-checked')).toBe('true');
        expect(await conflictingAriaChecked(fixture.nativeElement)).toBeUndefined();
    });
});
