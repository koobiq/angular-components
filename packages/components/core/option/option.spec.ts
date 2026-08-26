import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqOptgroup, KbqOption, KbqOptionModule } from './index';

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-option [disabled]="disabled" />
    `
})
class OptionWithDisable {
    disabled: boolean;
}

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-option [disabled]="disabled" [showCheckbox]="true">Steak</kbq-option>
    `
})
class OptionWithCheckbox {
    disabled = false;
}

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-option [attr.role]="'checkbox'">Steak</kbq-option>
    `
})
class OptionWithOwnRole {}

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-optgroup [label]="'Meat'">
            <kbq-option [value]="'steak-0'">Steak</kbq-option>
        </kbq-optgroup>
    `
})
class OptgroupWithLabel {}

describe('KbqOption component', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqOptionModule, OptionWithDisable, OptionWithCheckbox, OptionWithOwnRole, OptgroupWithLabel]
        }).compileComponents();
    });

    describe('aria', () => {
        it('should announce itself as an option of a listbox by default', () => {
            const fixture = TestBed.createComponent(OptionWithDisable);

            fixture.detectChanges();

            const option: HTMLElement = fixture.debugElement.query(By.directive(KbqOption)).nativeElement;

            expect(option.getAttribute('role')).toBe('option');
            expect(option.getAttribute('aria-selected')).toBe('false');
            expect(option.getAttribute('aria-disabled')).toBe('false');
        });

        it('should follow the selected and disabled state', () => {
            const fixture = TestBed.createComponent(OptionWithDisable);

            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqOption));
            const option: HTMLElement = debugElement.nativeElement;

            (debugElement.componentInstance as KbqOption).select();
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(option.getAttribute('aria-selected')).toBe('true');
            expect(option.getAttribute('aria-disabled')).toBe('true');
        });

        // The default is an attribute rather than a host binding precisely so it stays a default: a host
        // binding runs after the declaring view's attribute bindings and would overwrite this silently.
        it('should keep a role the consumer set on the element', () => {
            const fixture = TestBed.createComponent(OptionWithOwnRole);

            fixture.detectChanges();

            const option: HTMLElement = fixture.debugElement.query(By.directive(KbqOption)).nativeElement;

            expect(option.getAttribute('role')).toBe('checkbox');
        });

        it('should hide the decorative pseudo-checkbox', () => {
            const fixture = TestBed.createComponent(OptionWithCheckbox);

            fixture.detectChanges();

            const checkbox: HTMLElement = fixture.debugElement.query(By.css('kbq-pseudo-checkbox')).nativeElement;

            expect(checkbox.getAttribute('aria-hidden')).toBe('true');
        });
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

    it('should focus but not reveal while the pointer is over the option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const option: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const host = option.getHostElement();
        const focusSpy = jest.spyOn(host, 'focus');
        const scrollSpy = jest.spyOn(host, 'scrollIntoView');

        host.dispatchEvent(new MouseEvent('mouseenter'));
        option.focus();

        // Focus must still move, otherwise type-ahead and aria-activedescendant break.
        expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
        // The option is already under the cursor; revealing it would shift the list out from under it.
        expect(scrollSpy).not.toHaveBeenCalled();
    });

    it('should reveal again once the pointer has left, even if no focus happened in between', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const option: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const host = option.getHostElement();
        const scrollSpy = jest.spyOn(host, 'scrollIntoView');

        // Hovering the option that is already active never reaches focus(), so a flag cleared only
        // there would stay armed and silently swallow every later reveal.
        host.dispatchEvent(new MouseEvent('mouseenter'));
        host.dispatchEvent(new MouseEvent('mouseleave'));
        option.focus();

        expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
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

describe('KbqOptgroup component', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqOptionModule, OptgroupWithLabel]
        }).compileComponents();
    });

    it('should expose itself as a group named by its own label', () => {
        const fixture = TestBed.createComponent(OptgroupWithLabel);

        fixture.detectChanges();

        const group: HTMLElement = fixture.debugElement.query(By.directive(KbqOptgroup)).nativeElement;
        const label: HTMLElement = fixture.debugElement.query(By.css('.kbq-optgroup-label')).nativeElement;

        expect(group.getAttribute('role')).toBe('group');
        expect(label.id).toBeTruthy();
        expect(group.getAttribute('aria-labelledby')).toBe(label.id);
    });

    // A `<label>` with nothing to label is dropped from the accessibility tree entirely.
    it('should render the label as a span, not as a label element', () => {
        const fixture = TestBed.createComponent(OptgroupWithLabel);

        fixture.detectChanges();

        const label: HTMLElement = fixture.debugElement.query(By.css('.kbq-optgroup-label')).nativeElement;

        expect(label.tagName).toBe('SPAN');
        expect(label.textContent!.trim()).toBe('Meat');
    });
});
