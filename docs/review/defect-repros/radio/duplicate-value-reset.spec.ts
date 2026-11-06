import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { KbqRadioButton, KbqRadioGroup, KbqRadioModule } from '@koobiq/components/radio';

@Component({
    imports: [KbqRadioModule, ReactiveFormsModule],
    template: `
        <kbq-radio-group aria-label="Pokemon" [formControl]="control">
            <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button [value]="'water'">Squirtle</kbq-radio-button>
            <kbq-radio-button [value]="'water'">Wartortle</kbq-radio-button>
        </kbq-radio-group>
    `
})
class GroupWithDuplicateValues {
    readonly control = new FormControl<string | null>(null);
}

describe('triage: two buttons with the same value in one group', () => {
    it('DEFECT: writing the shared value ends with no button checked and the group value reset to null, the control unaware', () => {
        const fixture = TestBed.createComponent(GroupWithDuplicateValues);

        fixture.detectChanges();

        const radios = fixture.debugElement
            .queryAll(By.directive(KbqRadioButton))
            .map((debugEl) => debugEl.componentInstance as KbqRadioButton);
        const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

        fixture.componentInstance.control.setValue('water');
        fixture.detectChanges();

        expect(fixture.componentInstance.control.value).toBe('water');
        expect(group.value).toBeNull();
        expect(group.selected).toBeNull();
        expect(radios.map((radio) => radio.checked)).toEqual([false, false, false]);
    });
});
