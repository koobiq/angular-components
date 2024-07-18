import { Component } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOption, KbqOptionModule } from './index';

@Component({ template: `<kbq-option [disabled]="disabled"></kbq-option>` })
class OptionWithDisable {
    disabled: boolean;
}

describe('KbqOption component', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqOptionModule],
            declarations: [OptionWithDisable]
        }).compileComponents();
    }));

    it('should complete the `stateChanges` stream on destroy', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);
        fixture.detectChanges();

        const optionInstance: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const completeSpy = jasmine.createSpy('complete spy');
        const subscription = optionInstance.stateChanges.subscribe({ complete: completeSpy });

        fixture.destroy();
        expect(completeSpy).toHaveBeenCalled();
        subscription.unsubscribe();
    });

    it('should not emit to `onSelectionChange` if selecting an already-selected option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);
        fixture.detectChanges();

        const optionInstance: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;

        optionInstance.select();
        expect(optionInstance.selected).toBe(true);

        const spy = jasmine.createSpy('selection change spy');
        const subscription = optionInstance.onSelectionChange.subscribe(spy);

        optionInstance.select();
        fixture.detectChanges();

        expect(optionInstance.selected).toBe(true);
        expect(spy).not.toHaveBeenCalled();

        subscription.unsubscribe();
    });

    it('should not emit to `onSelectionChange` if deselecting an unselected option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);
        fixture.detectChanges();

        const optionInstance: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;

        optionInstance.deselect();
        expect(optionInstance.selected).toBe(false);

        const spy = jasmine.createSpy('selection change spy');
        const subscription = optionInstance.onSelectionChange.subscribe(spy);

        optionInstance.deselect();
        fixture.detectChanges();

        expect(optionInstance.selected).toBe(false);
        expect(spy).not.toHaveBeenCalled();

        subscription.unsubscribe();
    });
});
