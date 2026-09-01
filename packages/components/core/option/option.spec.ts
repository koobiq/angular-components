import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOption, KbqOptionModule } from './index';

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-option [disabled]="disabled" />
    `
})
class OptionWithDisable {
    disabled: boolean;
}

describe('KbqOption component', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqOptionModule, OptionWithDisable]
        }).compileComponents();
    });

    it('should complete the `stateChanges` stream on destroy', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const optionInstance: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const completeSpy = jest.fn();
        const subscription = optionInstance.stateChanges.subscribe({ complete: completeSpy });

        fixture.destroy();
        expect(completeSpy).toHaveBeenCalled();
        subscription.unsubscribe();
    });

    it('should reveal the option on focus without letting the browser scroll from focus itself', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const option: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const host = option.getHostElement();
        const focusSpy = jest.spyOn(host, 'focus');
        const scrollSpy = jest.spyOn(host, 'scrollIntoView');

        option.focus();

        expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
        expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    });

    it('should not scroll the list when the option is activated by the pointer', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const option: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const host = option.getHostElement();
        const scrollSpy = jest.spyOn(host, 'scrollIntoView');

        host.dispatchEvent(new MouseEvent('mouseenter'));
        option.focus();

        // The option is already under the cursor; revealing it would shift the list out from under it.
        expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should not emit to `onSelectionChange` if selecting an already-selected option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const optionInstance: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;

        optionInstance.select();
        expect(optionInstance.selected).toBe(true);

        const spy = jest.fn();
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

        const spy = jest.fn();
        const subscription = optionInstance.onSelectionChange.subscribe(spy);

        optionInstance.deselect();
        fixture.detectChanges();

        expect(optionInstance.selected).toBe(false);
        expect(spy).not.toHaveBeenCalled();

        subscription.unsubscribe();
    });
});
