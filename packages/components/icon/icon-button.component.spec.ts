import { Component, contentChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButtonSize, KbqIconModule } from '@koobiq/components/icon';
import { axe } from 'jest-axe';

describe('KbqIconButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestApp, SizeTestApp, TabindexTestApp]
        }).compileComponents();
    });

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));
        const iDebugElement = fixture.debugElement.query(By.css('i'));

        testComponent.color = KbqComponentColors.Theme;
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-theme')).toBe(true);
        expect(iDebugElement.nativeElement.classList.contains('kbq-theme')).toBe(true);
    });

    it('should not clear previous defined classes', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.classList.add('custom-class');

        testComponent.color = KbqComponentColors.Theme;
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('kbq-theme')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        const spyFn = vi.spyOn(testComponent, 'onClick');

        expect(spyFn).not.toHaveBeenCalled();

        buttonDebugElement.nativeElement.click();

        expect(spyFn).toHaveBeenCalled();
    });

    it('should disable the native button element', () => {
        const fixture = TestBed.createComponent(TestApp);
        const buttonNativeElement = fixture.nativeElement.querySelector('button');

        expect(buttonNativeElement.disabled).toBeFalsy();

        fixture.componentInstance.isDisabled = true;
        fixture.detectChanges();
        expect(buttonNativeElement.disabled).toBeTruthy();
        expect(buttonNativeElement.classList.contains('kbq-disabled')).toBe(true);
    });

    describe('size input', () => {
        let fixture: ComponentFixture<SizeTestApp>;
        let buttonEl: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(SizeTestApp);
            buttonEl = fixture.debugElement.query(By.css('i')).nativeElement;
            fixture.detectChanges();
        });

        it('should not add compact class when size is normal (default)', () => {
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(false);
        });

        it('should add compact class when size is compact', () => {
            fixture.componentInstance.size = 'compact';
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(true);
        });

        it('should remove compact class when size returns to normal', () => {
            fixture.componentInstance.size = 'compact';
            fixture.detectChanges();
            fixture.componentInstance.size = 'normal';
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(false);
        });
    });

    it('should restore the default tabindex once the bound one turns undefined', () => {
        const fixture = TestBed.createComponent(TabindexTestApp);
        const iconButton: HTMLElement = fixture.nativeElement.querySelector('i');

        fixture.detectChanges();

        expect(iconButton.getAttribute('tabindex')).toBe('5');

        fixture.componentInstance.tabindex = undefined;
        fixture.detectChanges();

        expect(iconButton.getAttribute('tabindex')).toBe('0');
    });

    describe('button semantics', () => {
        let fixture: ComponentFixture<TestApp>;

        const nativeButton = (): HTMLElement => fixture.nativeElement.querySelector('button');
        const genericHost = (): HTMLElement => fixture.nativeElement.querySelector('i');

        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();
        });

        it('should give a non-button host the button role', () => {
            expect(genericHost().getAttribute('role')).toBe('button');
        });

        it('should leave a native button without an explicit role', () => {
            expect(nativeButton().hasAttribute('role')).toBe(false);
        });

        it('should stay out of the decorative aria-hidden default of KbqIcon', () => {
            expect(genericHost().hasAttribute('aria-hidden')).toBe(false);
            expect(nativeButton().hasAttribute('aria-hidden')).toBe(false);
        });

        it('should report a disabled non-button host through aria-disabled', () => {
            expect(genericHost().hasAttribute('aria-disabled')).toBe(false);

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();

            expect(genericHost().getAttribute('aria-disabled')).toBe('true');
            expect(genericHost().hasAttribute('tabindex')).toBe(false);
        });

        it('should warn in dev mode when it has no accessible name', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            TestBed.createComponent(UnnamedTestApp).detectChanges();

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'), expect.anything());
        });

        it('should stay silent when an accessible name is present', () => {
            const warn = vi.spyOn(console, 'warn');

            TestBed.createComponent(NamedTestApp).detectChanges();

            expect(warn).not.toHaveBeenCalled();
        });

        // KbqStepper and the datepicker toggle are both mouse-only affordances beside a control that
        // already carries the keyboard interaction; assistive technology never reaches them.
        it('should stay silent when the host is hidden from assistive technology', () => {
            const warn = vi.spyOn(console, 'warn');

            TestBed.createComponent(HiddenTestApp).detectChanges();

            expect(warn).not.toHaveBeenCalled();
        });

        // `routerLink` and a bound `[attr.href]` are written in the update pass, long after a directive
        // constructor has run — an anchor that navigates must still be announced as a link.
        it('should leave an anchor that gains its href later without a button role', () => {
            const anchorFixture = TestBed.createComponent(LateHrefApp);

            anchorFixture.detectChanges();

            const anchor: HTMLElement = anchorFixture.nativeElement.querySelector('a');

            expect(anchor.hasAttribute('href')).toBe(true);
            expect(anchor.hasAttribute('role')).toBe(false);
        });

        it('should not overwrite a role the caller set', () => {
            const roleFixture = TestBed.createComponent(ExplicitRoleApp);

            roleFixture.detectChanges();

            expect(roleFixture.nativeElement.querySelector('i').getAttribute('role')).toBe('switch');
        });

        it('should not render an unparsable tabindex', () => {
            const tabindexFixture = TestBed.createComponent(TabindexTestApp);

            tabindexFixture.componentInstance.tabindex = '';
            tabindexFixture.detectChanges();

            expect(tabindexFixture.nativeElement.querySelector('i').hasAttribute('tabindex')).toBe(false);
        });

        it('should have no violations', async () => {
            const named = TestBed.createComponent(NamedTestApp);

            named.detectChanges();

            expect(await axe(named.nativeElement)).toHaveNoViolations();
        });
    });

    // Host metadata is inherited from KbqIcon, the DI token is not — and deliberately stays that way. A
    // `contentChild(KbqIcon)` is looking for a decorative icon to position or tint; answering it with an
    // interactive control would make KbqAlert render an empty icon box for a dismissible alert and re-tint
    // its close button to the alert color.
    it('should not be matched by a KbqIcon content query', () => {
        const fixture = TestBed.createComponent(IconQueryTestApp);

        fixture.detectChanges();

        const queryHost: IconQueryHost = fixture.debugElement.query(By.directive(IconQueryHost)).componentInstance;

        expect(queryHost.icon()).toBeUndefined();
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button
            kbq-icon-button="kbq-chevron-down-s_16"
            aria-label="Collapse"
            [color]="color"
            [disabled]="isDisabled"
            (click)="onClick()"
        ></button>

        <i
            kbq-icon-button="kbq-chevron-down-s_16"
            aria-label="Collapse"
            [color]="color"
            [disabled]="isDisabled"
            (click)="onClick()"
        ></i>
    `
})
class TestApp {
    isDisabled: boolean = false;
    color: KbqComponentColors;

    onClick() {}
}

@Component({
    selector: 'size-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Collapse" [size]="size"></i>
    `
})
class SizeTestApp {
    size: KbqIconButtonSize = 'normal';
}

@Component({
    selector: 'tabindex-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Collapse" [tabindex]="tabindex"></i>
    `
})
class TabindexTestApp {
    tabindex: number | string | undefined = 5;
}

@Component({
    selector: 'unnamed-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16"></i>
    `
})
class UnnamedTestApp {}

@Component({
    selector: 'named-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Collapse"></i>
    `
})
class NamedTestApp {}

@Component({
    selector: 'hidden-test-app',
    imports: [KbqIconModule],
    template: `
        <i aria-hidden="true" kbq-icon-button="kbq-chevron-down-s_16" [tabindex]="-1"></i>
    `
})
class HiddenTestApp {}

/** Stands in for `routerLink`, which writes its `href` through a host binding in the update pass. */
@Component({
    selector: 'late-href-app',
    imports: [KbqIconModule],
    template: `
        <a kbq-icon-button="kbq-chevron-down-s_16" aria-label="Settings" [attr.href]="href"></a>
    `
})
class LateHrefApp {
    href = '/settings';
}

@Component({
    selector: 'explicit-role-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Toggle" role="switch" aria-checked="false"></i>
    `
})
class ExplicitRoleApp {}

@Component({
    selector: 'icon-query-host',
    template: `
        <ng-content />
    `
})
class IconQueryHost {
    readonly icon = contentChild(KbqIcon);
}

@Component({
    selector: 'icon-query-test-app',
    imports: [KbqIconModule, IconQueryHost],
    template: `
        <icon-query-host>
            <i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Collapse"></i>
        </icon-query-host>
    `
})
class IconQueryTestApp {}
