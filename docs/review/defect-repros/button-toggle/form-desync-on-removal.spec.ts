import { Component, viewChild, viewChildren } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KbqButtonToggle, KbqButtonToggleGroup, KbqButtonToggleModule } from '@koobiq/components/button-toggle';

@Component({
    imports: [KbqButtonToggleModule, ReactiveFormsModule],
    template: `
        <kbq-button-toggle-group [formControl]="control">
            @if (renderRed) {
                <kbq-button-toggle [value]="'red'">Red</kbq-button-toggle>
            }
            <kbq-button-toggle [value]="'green'">Green</kbq-button-toggle>
        </kbq-button-toggle-group>
    `
})
class GroupWithRemovableToggle {
    readonly group = viewChild.required(KbqButtonToggleGroup);
    readonly toggles = viewChildren(KbqButtonToggle);
    readonly control = new FormControl<string | null>('red');
    renderRed = true;
}

describe('triage: button-toggle form control after the selected toggle is removed', () => {
    it('DEFECT: the form keeps a value the group dropped, and a re-rendered toggle with it is not reselected', async () => {
        TestBed.configureTestingModule({ imports: [GroupWithRemovableToggle] });

        const fixture = TestBed.createComponent(GroupWithRemovableToggle);
        const host = fixture.componentInstance;

        fixture.detectChanges();

        expect(host.group().value).toBe('red');
        expect(host.toggles()[0].checked).toBe(true);

        host.renderRed = false;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        // The group has dropped the value, the form model has not heard of it.
        expect(host.group().value).toBeUndefined();
        expect(host.control.value).toBe('red');

        host.renderRed = true;
        fixture.detectChanges();
        await fixture.whenStable();

        // The control still says 'red', yet the 'red' toggle is back unselected.
        expect(host.control.value).toBe('red');
        expect(host.toggles().map((toggle) => [toggle.value, toggle.checked])).toEqual([
            ['red', false],
            ['green', false]
        ]);
        expect(host.group().value).toBeUndefined();
    });
});
