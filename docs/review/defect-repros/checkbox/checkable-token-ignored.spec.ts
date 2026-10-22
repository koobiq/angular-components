import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_CHECKBOX_CLICK_ACTION, KbqCheckbox, KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KBQ_CHECKABLE_CLICK_ACTION } from '@koobiq/components/core';
import { KbqToggleComponent, KbqToggleModule } from '@koobiq/components/toggle';

@Component({
    imports: [KbqCheckboxModule, KbqToggleModule],
    template: `
        <kbq-checkbox>Checkbox</kbq-checkbox>
        <kbq-toggle>Toggle</kbq-toggle>
    `
})
class CheckboxAndToggle {
    readonly checkbox = viewChild.required(KbqCheckbox);
    readonly toggle = viewChild.required(KbqToggleComponent);
}

const clickBoth = (provide: unknown) => {
    TestBed.configureTestingModule({ providers: [{ provide, useValue: 'noop' }] });

    const fixture = TestBed.createComponent(CheckboxAndToggle);

    fixture.detectChanges();

    fixture.nativeElement.querySelector('kbq-checkbox input').click();
    fixture.nativeElement.querySelector('kbq-toggle input').click();
    fixture.detectChanges();

    return fixture.componentInstance;
};

describe('KbqCheckbox triage: KBQ_CHECKABLE_CLICK_ACTION', () => {
    it('DEFECT: the shared KBQ_CHECKABLE_CLICK_ACTION = noop stops the toggle but the checkbox still toggles', () => {
        const host = clickBoth(KBQ_CHECKABLE_CLICK_ACTION);

        expect(host.toggle().checked).toBe(false);
        expect(host.checkbox().checked).toBe(true);
    });

    it('(context) KBQ_CHECKBOX_CLICK_ACTION = noop stops both, through the toggle fallback', () => {
        const host = clickBoth(KBQ_CHECKBOX_CLICK_ACTION);

        expect(host.toggle().checked).toBe(false);
        expect(host.checkbox().checked).toBe(false);
    });
});
