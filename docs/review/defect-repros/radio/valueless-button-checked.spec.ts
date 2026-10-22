import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqRadioButton, KbqRadioGroup, KbqRadioModule } from '@koobiq/components/radio';

@Component({
    imports: [KbqRadioModule],
    template: `
        <kbq-radio-group aria-label="Options">
            <kbq-radio-button>First</kbq-radio-button>
            <kbq-radio-button>Second</kbq-radio-button>
            <kbq-radio-button>Third</kbq-radio-button>
        </kbq-radio-group>
    `
})
class ValuelessButtons {}

@Component({
    imports: [KbqRadioModule],
    template: `
        <kbq-radio-group aria-label="Options">
            <kbq-radio-button [value]="'fire'">Fire</kbq-radio-button>
            <kbq-radio-button>None</kbq-radio-button>
        </kbq-radio-group>
    `
})
class MixedButtons {}

describe('triage: radio button without a value', () => {
    it('DEFECT: a value-less button is checked on init by the default null group value, the last one wins, and the group selected stays null', () => {
        const fixture = TestBed.createComponent(ValuelessButtons);

        fixture.detectChanges();

        const radios = fixture.debugElement
            .queryAll(By.directive(KbqRadioButton))
            .map((debugEl) => debugEl.componentInstance as KbqRadioButton);
        const inputs = fixture.debugElement
            .queryAll(By.css('input'))
            .map((debugEl) => debugEl.nativeElement as HTMLInputElement);
        const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

        expect(group.value).toBeNull();
        expect(radios.map((radio) => radio.checked)).toEqual([false, false, true]);
        expect(inputs.map((input) => input.checked)).toEqual([false, false, true]);
        expect(group.selected).toBeNull();
    });

    it('DEFECT: clearing the group value to null checks the value-less button', () => {
        const fixture = TestBed.createComponent(MixedButtons);

        fixture.detectChanges();

        const radios = fixture.debugElement
            .queryAll(By.directive(KbqRadioButton))
            .map((debugEl) => debugEl.componentInstance as KbqRadioButton);
        const group = fixture.debugElement.query(By.directive(KbqRadioGroup)).injector.get(KbqRadioGroup);

        group.value = 'fire';
        fixture.detectChanges();

        expect(radios.map((radio) => radio.checked)).toEqual([true, false]);

        group.value = null;
        fixture.detectChanges();

        expect(radios.map((radio) => radio.checked)).toEqual([false, true]);
        expect(group.selected).toBe(radios[1]);
    });
});
