import { Component, contentChild, Directive, ElementRef, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqComponentColors, ThemePalette } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton, KbqIconButtonSize, KbqIconModule } from '@koobiq/components/icon';
import { axe } from 'jest-axe';

describe('KbqIconButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, TestApp, SizeTestApp]
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

        const spyFn = jest.spyOn(testComponent, 'onClick');

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

        it('should add compact class when deprecated small input is true', () => {
            fixture.componentInstance.small = true;
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(true);
        });

        it('should not add compact class when size is normal and small is false', () => {
            fixture.componentInstance.size = 'normal';
            fixture.componentInstance.small = false;
            fixture.detectChanges();
            expect(buttonEl.classList.contains('kbq-icon-button_compact')).toBe(false);
        });
    });

    describe('button semantics', () => {
        let fixture: ComponentFixture<TestApp>;

        const nativeButton = () => fixture.nativeElement.querySelector('button') as HTMLElement;
        const genericHost = () => fixture.nativeElement.querySelector('i') as HTMLElement;

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

        it.each(['Enter', ' '])('should activate a non-button host with %s', (key) => {
            const spyFn = jest.spyOn(fixture.componentInstance, 'onClick');

            genericHost().dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));

            expect(spyFn).toHaveBeenCalledTimes(1);
        });

        it('should not activate a disabled host from the keyboard', () => {
            const spyFn = jest.spyOn(fixture.componentInstance, 'onClick');

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();

            genericHost().dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
            );

            expect(spyFn).not.toHaveBeenCalled();
        });

        it('should leave activation to the browser on a native button', () => {
            const spyFn = jest.spyOn(fixture.componentInstance, 'onClick');

            nativeButton().dispatchEvent(
                new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
            );

            // jsdom does not synthesize the click a browser would, so the assertion is that the
            // component did not add a second one of its own.
            expect(spyFn).not.toHaveBeenCalled();
        });

        // `KbqTagRemove` and `KbqCleaner` both put their own Enter/Space handling on the very element the
        // icon button sits on. Exactly one of the two has to end up synthesizing the click.
        it('should stand down when a co-located handler already activated the host', () => {
            const fixture = TestBed.createComponent(SelfActivatingApp);

            fixture.detectChanges();

            const host = fixture.nativeElement.querySelector('i') as HTMLElement;
            const spyFn = jest.spyOn(fixture.componentInstance, 'onClick');

            host.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));

            expect(spyFn).toHaveBeenCalledTimes(1);
        });

        it('should warn in dev mode when it has no accessible name', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

            TestBed.createComponent(TestApp).detectChanges();

            expect(warn).toHaveBeenCalledWith(expect.stringContaining('no accessible name'), expect.anything());

            warn.mockRestore();
        });

        it('should stay silent when an accessible name is present', () => {
            const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

            TestBed.createComponent(NamedTestApp).detectChanges();

            expect(warn).not.toHaveBeenCalled();

            warn.mockRestore();
        });

        it('should have no violations', async () => {
            const named = TestBed.createComponent(NamedTestApp);

            named.detectChanges();

            expect(await axe(named.nativeElement)).toHaveNoViolations();
        });
    });

    // ICN-ARCH-01: host metadata is inherited, the DI token is not.
    it('should be found by a KbqIcon content query', () => {
        const fixture = TestBed.createComponent(IconQueryTestApp);

        fixture.detectChanges();

        const queryHost = fixture.debugElement.query(By.directive(IconQueryHost)).componentInstance as IconQueryHost;

        expect(queryHost.icon()).toBeInstanceOf(KbqIconButton);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button
            kbq-icon-button="kbq-chevron-down-s_16"
            [color]="color"
            [disabled]="isDisabled"
            (click)="onClick()"
        ></button>

        <i kbq-icon-button="kbq-chevron-down-s_16" [color]="color" [disabled]="isDisabled" (click)="onClick()"></i>
    `
})
class TestApp {
    isDisabled: boolean = false;
    color: ThemePalette;

    onClick() {}
}

@Component({
    selector: 'size-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" [size]="size" [small]="small"></i>
    `
})
class SizeTestApp {
    size: KbqIconButtonSize = 'normal';
    small = false;
}

@Component({
    selector: 'named-test-app',
    imports: [KbqIconModule],
    template: `
        <i kbq-icon-button="kbq-chevron-down-s_16" aria-label="Collapse"></i>
    `
})
class NamedTestApp {}

/** Mirrors the shape of `KbqTagRemove`: a co-located directive that activates the host itself. */
@Directive({
    selector: '[selfActivating]',
    host: {
        '(keydown.enter)': 'activate($event)'
    }
})
class SelfActivating {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

    protected activate(event: KeyboardEvent): void {
        event.preventDefault();
        event.stopPropagation();

        this.elementRef.nativeElement.click();
    }
}

@Component({
    selector: 'self-activating-app',
    imports: [KbqIconModule, SelfActivating],
    template: `
        <i selfActivating kbq-icon-button="kbq-chevron-down-s_16" aria-label="Remove" (click)="onClick()"></i>
    `
})
class SelfActivatingApp {
    onClick() {}
}

@Component({
    selector: 'icon-query-host',
    imports: [],
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
