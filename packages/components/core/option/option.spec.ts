import { Component, effect, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    KBQ_OPTION_ACTION_PARENT,
    KBQ_OPTION_PARENT_COMPONENT,
    KbqOptgroup,
    KbqOption,
    KbqOptionActionComponent,
    KbqOptionModule
} from './index';

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

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-optgroup [label]="'Meat'" [disabled]="groupDisabled()">
            <kbq-option [value]="'steak'">Steak</kbq-option>
        </kbq-optgroup>
    `
})
class OptionInGroup {
    readonly groupDisabled = signal(true);
}

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-option-action [disabled]="disabled()" />
    `,
    providers: [{ provide: KBQ_OPTION_ACTION_PARENT, useValue: { focus: () => {} } }]
})
class ActionWithDisable {
    readonly disabled = signal(true);
}

@Component({
    imports: [KbqOptionModule],
    template: `
        <kbq-option [value]="'steak'">Steak</kbq-option>
    `,
    providers: [{ provide: KBQ_OPTION_PARENT_COMPONENT, useValue: { multiSelection: true } }]
})
class OptionDrivenByEffects {
    readonly option = viewChild.required(KbqOption);
    readonly wantSelected = signal(false);
    readonly toggles = signal(0);
    readonly runs = { select: 0, toggle: 0 };

    constructor() {
        effect(() => {
            if (!this.wantSelected()) return;

            this.runs.select++;
            this.option().select();
        });

        effect(() => {
            if (!this.toggles() || this.runs.toggle >= 10) return;

            this.runs.toggle++;
            this.option().selectViaInteraction();
        });
    }
}

describe('KbqOption component', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqOptionModule,
                OptionWithDisable,
                OptionWithCheckbox,
                OptionWithOwnRole,
                OptgroupWithLabel,
                OptionInGroup,
                OptionDrivenByEffects
            ]
        }).compileComponents();
    });

    describe('host state', () => {
        it('should reflect the selected, active and disabled state', () => {
            const fixture = TestBed.createComponent(OptionWithDisable);

            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqOption));
            const option: HTMLElement = debugElement.nativeElement;

            expect(option.getAttribute('tabindex')).toBe('0');
            expect(option.classList).not.toContain('kbq-selected');
            expect(option.classList).not.toContain('kbq-active');
            expect(option.classList).not.toContain('kbq-disabled');

            (debugElement.componentInstance as KbqOption).select();
            (debugElement.componentInstance as KbqOption).setActiveStyles();
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(option.getAttribute('tabindex')).toBe('-1');
            expect(option.classList).toContain('kbq-selected');
            expect(option.classList).toContain('kbq-active');
            expect(option.classList).toContain('kbq-disabled');
        });

        it('should follow the disabled state of its group', () => {
            const fixture = TestBed.createComponent(OptionInGroup);

            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqOption));
            const option: HTMLElement = debugElement.nativeElement;

            expect((debugElement.componentInstance as KbqOption).disabled).toBe(true);
            expect(option.getAttribute('tabindex')).toBe('-1');
            expect(option.getAttribute('aria-disabled')).toBe('true');
            expect(option.classList).toContain('kbq-disabled');

            fixture.componentInstance.groupDisabled.set(false);
            fixture.detectChanges();

            expect((debugElement.componentInstance as KbqOption).disabled).toBe(false);
            expect(option.getAttribute('tabindex')).toBe('0');
            expect(option.getAttribute('aria-disabled')).toBe('false');
            expect(option.classList).not.toContain('kbq-disabled');
        });
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

        // `aria-selected` is not in `role="checkbox"`'s allowed set — that role takes `aria-checked` —
        // so the default selection semantics have to step aside with the default role rather than
        // outlive it and leave the element contradicting itself.
        it('should drop `aria-selected` once the consumer replaces the role', () => {
            const fixture = TestBed.createComponent(OptionWithOwnRole);

            fixture.detectChanges();

            const debugElement = fixture.debugElement.query(By.directive(KbqOption));
            const option: HTMLElement = debugElement.nativeElement;

            expect(option.hasAttribute('aria-selected')).toBe(false);

            (debugElement.componentInstance as KbqOption).select();
            fixture.detectChanges();

            expect(option.hasAttribute('aria-selected')).toBe(false);
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
        const completeSpy = vi.fn();
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
        const focusSpy = vi.spyOn(host, 'focus');
        const scrollSpy = vi.spyOn(host, 'scrollIntoView');

        option.focus();

        expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
        expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    });

    it('should focus but not reveal while the pointer is over the option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const option: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;
        const host = option.getHostElement();
        const focusSpy = vi.spyOn(host, 'focus');
        const scrollSpy = vi.spyOn(host, 'scrollIntoView');

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
        const scrollSpy = vi.spyOn(host, 'scrollIntoView');

        // Hovering the option that is already active never reaches focus(), so a flag cleared only
        // there would stay armed and silently swallow every later reveal.
        host.dispatchEvent(new MouseEvent('mouseenter'));
        host.dispatchEvent(new MouseEvent('mouseleave'));
        option.focus();

        expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest', inline: 'nearest' });
    });

    it('should select an option without a parent on shift + click', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const option = fixture.debugElement.query(By.directive(KbqOption));

        option.nativeElement.dispatchEvent(new MouseEvent('click', { shiftKey: true }));
        fixture.detectChanges();

        expect((option.componentInstance as KbqOption).selected).toBe(true);
    });

    it('should not emit to `onSelectionChange` if selecting an already-selected option', () => {
        const fixture = TestBed.createComponent(OptionWithDisable);

        fixture.detectChanges();

        const optionInstance: KbqOption = fixture.debugElement.query(By.directive(KbqOption)).componentInstance;

        optionInstance.select();
        expect(optionInstance.selected).toBe(true);

        const spy = vi.fn();
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

        const spy = vi.fn();
        const subscription = optionInstance.onSelectionChange.subscribe(spy);

        optionInstance.deselect();
        fixture.detectChanges();

        expect(optionInstance.selected).toBe(false);
        expect(spy).not.toHaveBeenCalled();

        subscription.unsubscribe();
    });

    describe('called from an effect', () => {
        it('should not make an effect that selects it run again when it is deselected', () => {
            const fixture = TestBed.createComponent(OptionDrivenByEffects);
            const { componentInstance } = fixture;

            fixture.detectChanges();
            componentInstance.wantSelected.set(true);
            fixture.detectChanges();

            componentInstance.option().deselect();
            fixture.detectChanges();

            expect(componentInstance.option().selected).toBe(false);
            expect(componentInstance.runs.select).toBe(1);
        });

        it('should not loop when an effect toggles it through `selectViaInteraction`', () => {
            const fixture = TestBed.createComponent(OptionDrivenByEffects);
            const { componentInstance } = fixture;

            fixture.detectChanges();
            componentInstance.toggles.set(1);
            fixture.detectChanges();

            expect(componentInstance.option().selected).toBe(true);
            expect(componentInstance.runs.toggle).toBe(1);
        });
    });
});

describe('KbqOptionActionComponent', () => {
    it('should reflect the disabled state on the host', () => {
        const fixture = TestBed.createComponent(ActionWithDisable);

        fixture.detectChanges();

        const action: HTMLElement = fixture.debugElement.query(By.directive(KbqOptionActionComponent)).nativeElement;

        expect(action.getAttribute('disabled')).toBe('true');
        expect(action.getAttribute('aria-disabled')).toBe('true');
        expect(action.classList).toContain('kbq-disabled');

        fixture.componentInstance.disabled.set(false);
        fixture.detectChanges();

        expect(action.hasAttribute('disabled')).toBe(false);
        expect(action.hasAttribute('aria-disabled')).toBe(false);
        expect(action.classList).not.toContain('kbq-disabled');
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
