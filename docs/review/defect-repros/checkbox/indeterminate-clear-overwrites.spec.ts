import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqCheckbox, KbqCheckboxModule } from '@koobiq/components/checkbox';

@Component({
    imports: [KbqCheckboxModule],
    template: `
        <kbq-checkbox (change)="onChange()" (indeterminateChange)="emitted.push($event)">Select all</kbq-checkbox>
    `
})
class CheckboxSettingIndeterminateOnChange {
    readonly checkbox = viewChild.required(KbqCheckbox);
    readonly emitted: boolean[] = [];
    indeterminateOnChange = true;

    onChange(): void {
        this.checkbox().indeterminate = this.indeterminateOnChange;
    }
}

const setup = (indeterminateOnChange: boolean) => {
    const fixture = TestBed.createComponent(CheckboxSettingIndeterminateOnChange);
    const host = fixture.componentInstance;

    host.indeterminateOnChange = indeterminateOnChange;
    fixture.detectChanges();

    host.checkbox().indeterminate = true;
    fixture.detectChanges();
    host.emitted.length = 0;

    return { fixture, host };
};

describe('KbqCheckbox triage: deferred indeterminate clear', () => {
    it('DEFECT: indeterminate set to true by a change handler is overwritten by the deferred clear', async () => {
        const { fixture, host } = setup(true);

        fixture.nativeElement.querySelector('input').click();

        // Inside the handler the write is a no-op: the clear has not happened yet.
        expect(host.checkbox().indeterminate).toBe(true);
        expect(host.emitted).toEqual([]);

        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.checkbox().checked).toBe(true);
        expect(host.checkbox().indeterminate).toBe(false);
        expect(host.emitted).toEqual([false]);
        expect(fixture.nativeElement.querySelector('kbq-checkbox').classList).not.toContain('kbq-indeterminate');
    });

    it('DEFECT: indeterminateChange(false) is emitted twice when a change handler already cleared it', async () => {
        const { fixture, host } = setup(false);

        fixture.nativeElement.querySelector('input').click();

        expect(host.emitted).toEqual([false]);

        await fixture.whenStable();
        fixture.detectChanges();

        expect(host.checkbox().indeterminate).toBe(false);
        expect(host.emitted).toEqual([false, false]);
    });
});
