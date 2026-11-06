import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqRadioButton, KbqRadioChange, KbqRadioGroup, KbqRadioModule } from '@koobiq/components/radio';

@Component({
    imports: [KbqRadioModule],
    template: `
        <kbq-radio-group aria-label="Pokemon" (change)="onChange($event)">
            <kbq-radio-button [value]="'fire'">Charmander</kbq-radio-button>
            <kbq-radio-button name="custom" [value]="'water'">Squirtle</kbq-radio-button>
        </kbq-radio-group>
    `
})
class GroupWithOwnNamedButton {
    readonly changes: KbqRadioChange[] = [];

    onChange(event: KbqRadioChange): void {
        this.changes.push(event);
    }
}

describe('triage: button with its own name inside a group', () => {
    it('DEFECT: checking the own-named button leaves the group-named one checked, and it cannot be picked back', () => {
        const fixture = TestBed.createComponent(GroupWithOwnNamedButton);

        fixture.detectChanges();

        const radios = fixture.debugElement
            .queryAll(By.directive(KbqRadioButton))
            .map((debugEl) => debugEl.componentInstance as KbqRadioButton);
        const labels = fixture.debugElement
            .queryAll(By.css('label'))
            .map((debugEl) => debugEl.nativeElement as HTMLLabelElement);
        const inputs = fixture.debugElement
            .queryAll(By.css('input'))
            .map((debugEl) => debugEl.nativeElement as HTMLInputElement);
        const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

        labels[0].click();
        fixture.detectChanges();

        expect(group.value).toBe('fire');
        expect(fixture.componentInstance.changes.length).toBe(1);

        labels[1].click();
        fixture.detectChanges();

        // The group moved to the own-named button, but the group-named one stays checked.
        expect(group.value).toBe('water');
        expect(group.selected).toBe(radios[1]);
        expect(radios.map((radio) => radio.checked)).toEqual([true, true]);
        expect(inputs.map((input) => input.checked)).toEqual([true, true]);
        expect(fixture.componentInstance.changes.length).toBe(2);

        // Clicking the old button again: its native input is still checked, so no change fires.
        labels[0].click();
        fixture.detectChanges();

        expect(fixture.componentInstance.changes.length).toBe(2);
        expect(group.value).toBe('water');
        expect(group.selected).toBe(radios[1]);
    });
});
