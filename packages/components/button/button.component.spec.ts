import { Component, ElementRef, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    dispatchFakeEvent,
    dispatchKeyboardEvent,
    DOWN_ARROW,
    ENTER,
    KbqComponentColors,
    leftIconClassName,
    rightIconClassName,
    SPACE,
    ThemePalette
} from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    buttonLeftIconClassName,
    buttonRightIconClassName,
    KbqButton,
    KbqButtonCssStyler,
    KbqButtonGroupRoot,
    KbqButtonModule,
    KbqButtonStyles
} from './index';

describe('KbqButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule, KbqDropdownModule, NoopAnimationsModule, TestApp, ButtonDropdownTrigger]
        }).compileComponents();
    });

    it('should apply class based on color attribute', () => {
        const fixture = TestBed.createComponent(TestApp);

        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));
        const aDebugElement = fixture.debugElement.query(By.css('a'));

        testComponent.buttonColor = 'primary';
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(true);
        expect(aDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(true);

        testComponent.buttonColor = 'accent';
        fixture.detectChanges();
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-accent')).toBe(true);
        expect(aDebugElement.nativeElement.classList.contains('kbq-accent')).toBe(true);

        testComponent.buttonColor = null;
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList).not.toContain('kbq-accent');
        expect(aDebugElement.nativeElement.classList).not.toContain('kbq-accent');
    });

    it('should should not clear previous defined classes', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.classList.add('custom-class');

        testComponent.buttonColor = 'primary';
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);

        testComponent.buttonColor = 'accent';
        fixture.detectChanges();

        expect(buttonDebugElement.nativeElement.classList.contains('kbq-primary')).toBe(false);
        expect(buttonDebugElement.nativeElement.classList.contains('kbq-accent')).toBe(true);
        expect(buttonDebugElement.nativeElement.classList.contains('custom-class')).toBe(true);
    });

    describe('button[kbq-button]', () => {
        it('should handle a click on the button', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('button'));

            buttonDebugElement.nativeElement.click();
            expect(testComponent.clickCount).toBe(1);
        });

        it('should not increment if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('button'));

            testComponent.isDisabled = true;
            fixture.detectChanges();

            buttonDebugElement.nativeElement.click();

            expect(testComponent.clickCount).toBe(0);
        });

        it('should disable the native button element', () => {
            const fixture = TestBed.createComponent(TestApp);
            const buttonNativeElement = fixture.nativeElement.querySelector('button');

            expect(buttonNativeElement.disabled).toBeFalsy();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            expect(buttonNativeElement.disabled).toBeTruthy();
        });
    });

    describe('a[kbq-button]', () => {
        it('should not redirect if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const anchorElement: HTMLAnchorElement = fixture.debugElement.query(By.css('a')).nativeElement;

            testComponent.isDisabled = true;
            fixture.detectChanges();

            const event = new MouseEvent('click', { bubbles: true, cancelable: true });

            anchorElement.dispatchEvent(event);

            expect(testComponent.clickCount).toBe(0);
            expect(event.defaultPrevented).toBe(true);
        });

        it('should halt ENTER and SPACE keydown if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const anchorElement: HTMLAnchorElement = fixture.debugElement.query(By.css('a')).nativeElement;

            testComponent.isDisabled = true;
            fixture.detectChanges();

            const enterEvent = dispatchKeyboardEvent(anchorElement, 'keydown', ENTER);
            const spaceEvent = dispatchKeyboardEvent(anchorElement, 'keydown', SPACE);

            expect(enterEvent.defaultPrevented).toBe(true);
            expect(spaceEvent.defaultPrevented).toBe(true);
        });

        it('should set aria-disabled if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const anchorElement: HTMLAnchorElement = fixture.debugElement.query(By.css('a')).nativeElement;

            expect(anchorElement.getAttribute('aria-disabled')).toBeNull();

            testComponent.isDisabled = true;
            fixture.detectChanges();

            expect(anchorElement.getAttribute('aria-disabled')).toBe('true');

            // `disabled || null` must remove the attribute (not set "false") when re-enabled
            testComponent.isDisabled = false;
            fixture.detectChanges();

            expect(anchorElement.getAttribute('aria-disabled')).toBeNull();
        });

        it('should remove tabindex if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('a'));

            expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe(null);

            testComponent.isDisabled = true;
            fixture.detectChanges();
            expect(buttonDebugElement.nativeElement.getAttribute('tabIndex')).toBe('-1');
        });
    });

    it('should set .kbq-active class when button with associated dropdown clicked', () => {
        const fixture: ComponentFixture<ButtonDropdownTrigger> = TestBed.createComponent(ButtonDropdownTrigger);

        fixture.detectChanges();
        const buttonDebugElement = fixture.componentInstance;

        const trigger = buttonDebugElement.trigger();

        dispatchFakeEvent(trigger.nativeElement, 'click');
        fixture.detectChanges();
        expect(trigger.nativeElement.classList.contains('kbq-active')).toBeTruthy();
    });

    it('should not open an associated dropdown when the disabled button is clicked or keyboard-activated', () => {
        const fixture: ComponentFixture<DisabledButtonDropdownTrigger> =
            TestBed.createComponent(DisabledButtonDropdownTrigger);

        fixture.detectChanges();

        const { dropdownTrigger, trigger } = fixture.componentInstance;
        const anchorElement = trigger().nativeElement as HTMLAnchorElement;

        // click is halted by the capture-phase listener (stopImmediatePropagation), so the
        // dropdown trigger's own click handler never runs and the dropdown stays closed
        dispatchFakeEvent(anchorElement, 'click');
        fixture.detectChanges();

        expect(dropdownTrigger().opened).toBe(false);
        expect(anchorElement.classList.contains('kbq-active')).toBe(false);

        // ENTER / SPACE and the arrow keys the trigger opens on are all halted too
        [ENTER, SPACE, DOWN_ARROW].forEach((keyCode) => {
            dispatchKeyboardEvent(anchorElement, 'keydown', keyCode);
            fixture.detectChanges();

            expect(dropdownTrigger().opened).toBe(false);
        });
    });

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.click();

        expect(testComponent.clickCount).toBe(1);
    });
});

describe('Button with icon', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonModule,
                KbqIconModule,
                KbqButtonCommentCaseTestApp,
                KbqButtonHtmlIconLeftCaseTestApp,
                KbqButtonHtmlIconRightCaseTestApp,
                KbqButtonTextIconCaseTestApp,
                KbqButtonTextIconLeftNgIfCaseTestApp,
                KbqButtonTextIconRightNgIfCaseTestApp,
                KbqButtonTextIconLeftRightNgIfCaseTestApp,
                KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp,
                KbqButtonTwoIconsCaseTestApp,
                KbqButtonThreeIconsCaseTestApp,
                KbqButtonIconNgIfCaseTestApp
            ]
        }).compileComponents();
    });

    it('should not add left and right css classes when next/previous siblings are html comments or text nodes', () => {
        let fixture: ComponentFixture<KbqButtonCommentCaseTestApp | KbqButtonTextIconCaseTestApp>;

        [KbqButtonCommentCaseTestApp, KbqButtonTextIconCaseTestApp].forEach((comp) => {
            fixture = TestBed.createComponent(comp);
            fixture.detectChanges();

            expect(fixture.debugElement.query(By.css(`.${leftIconClassName}`))).toBeNull();
            expect(fixture.debugElement.query(By.css(`.${rightIconClassName}`))).toBeNull();

            expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeNull();
            expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeNull();
        });
    });

    it('should add left and right css classes for left and right icons correspondingly for 2 icons in the button', () => {
        const fixture = TestBed.createComponent(KbqButtonTwoIconsCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`#icon1.${leftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon1.${rightIconClassName}`))).toBeNull();

        expect(fixture.debugElement.query(By.css(`#icon2.${rightIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon2.${leftIconClassName}`))).toBeNull();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).not.toBeNull();
    });

    it('should keep regular button styling and mark only outermost icons for more than 2 icons', () => {
        const fixture = TestBed.createComponent(KbqButtonThreeIconsCaseTestApp);

        fixture.detectChanges();

        const hostElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler)).nativeElement;

        expect(hostElement.classList.contains('kbq-button')).toBeTruthy();
        expect(hostElement.classList.contains('kbq-button-icon')).toBeFalsy();

        expect(fixture.debugElement.query(By.css(`#icon1.${leftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon3.${rightIconClassName}`))).not.toBeNull();

        expect(fixture.debugElement.query(By.css(`#icon2.${leftIconClassName}`))).toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon2.${rightIconClassName}`))).toBeNull();
    });

    it('should add right css class when the previous sibling is an html element', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconRightCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeFalsy();
    });

    it('should add left css class when the next sibling is an html element', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconLeftCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });

    it('should add left css class when the right visible sibling is a text element and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });

    it('should NOT add left,right css class when the left,right visible sibling is a text element and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftRightNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeFalsy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });
    it('should NOT add left,right css class when the more than 1 siblings on the left,right and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`))).toBeFalsy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`))).toBeFalsy();
    });

    it('should toggle host button class type on icon removal/reveal', (done) => {
        const fixture = TestBed.createComponent(KbqButtonIconNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeTruthy();
        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeFalsy();

        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeFalsy();
            expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();
            done();
        });
    });

    it('should toggle additional classes on icon removal/reveal', (done) => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();
        expect(debugElement.nativeElement.classList.contains(buttonLeftIconClassName)).toBeTruthy();
        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains(buttonLeftIconClassName)).toBeFalsy();
            done();
        });
    });

    it('should toggle additional classes on icon removal/reveal', (done) => {
        const fixture = TestBed.createComponent(KbqButtonTextIconRightNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();
        expect(debugElement.nativeElement.classList.contains(buttonRightIconClassName)).toBeTruthy();
        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains(buttonRightIconClassName)).toBeFalsy();
            done();
        });
    });

    it('should switch to kbq-button-icon via the effect when an icon is revealed while the content observer is disabled', (done) => {
        const fixture = TestBed.createComponent(KbqButtonIconNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        // start with no icon: cdkObserveContent is disabled (styler.icons() is empty), so the
        // styler's effect() — not the MutationObserver — is the only thing that can recompute
        fixture.componentInstance.visible = false;
        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeFalsy();
        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTruthy();

        fixture.componentInstance.visible = true;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeTruthy();
            expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeFalsy();
            done();
        });
    });
});

describe('Button with explicit icon slots', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonModule,
                KbqIconModule,
                KbqButtonLeftIconSlotReorderTestApp,
                KbqButtonRightIconSlotReorderTestApp,
                KbqButtonLeftRightIconSlotTestApp,
                KbqButtonTwoIconsSlotTestApp
            ]
        }).compileComponents();
    });

    it('should mark a [kbqButtonLeftIcon] as the left icon even when written after the text', () => {
        const fixture = TestBed.createComponent(KbqButtonLeftIconSlotReorderTestApp);

        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('#left-icon')).nativeElement;
        const host = fixture.debugElement.query(By.directive(KbqButtonCssStyler)).nativeElement;

        // the leading slot moves the icon to the front, so the styler marks it left, not right
        expect(icon.classList.contains(leftIconClassName)).toBeTruthy();
        expect(icon.classList.contains(rightIconClassName)).toBeFalsy();

        expect(host.classList.contains(buttonLeftIconClassName)).toBeTruthy();
        expect(host.classList.contains(buttonRightIconClassName)).toBeFalsy();

        // text present -> regular (not icon-only) button
        expect(host.classList.contains('kbq-button')).toBeTruthy();
        expect(host.classList.contains('kbq-button-icon')).toBeFalsy();
    });

    it('should mark a [kbqButtonRightIcon] as the right icon even when written before the text', () => {
        const fixture = TestBed.createComponent(KbqButtonRightIconSlotReorderTestApp);

        fixture.detectChanges();

        const icon = fixture.debugElement.query(By.css('#right-icon')).nativeElement;
        const host = fixture.debugElement.query(By.directive(KbqButtonCssStyler)).nativeElement;

        expect(icon.classList.contains(rightIconClassName)).toBeTruthy();
        expect(icon.classList.contains(leftIconClassName)).toBeFalsy();

        expect(host.classList.contains(buttonRightIconClassName)).toBeTruthy();
        expect(host.classList.contains(buttonLeftIconClassName)).toBeFalsy();
    });

    it('should place icons into the left/right slots regardless of their source order', () => {
        const fixture = TestBed.createComponent(KbqButtonLeftRightIconSlotTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`#left-icon.${leftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#left-icon.${rightIconClassName}`))).toBeNull();

        expect(fixture.debugElement.query(By.css(`#right-icon.${rightIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#right-icon.${leftIconClassName}`))).toBeNull();

        const host = fixture.debugElement.query(By.directive(KbqButtonCssStyler)).nativeElement;

        expect(host.classList.contains(buttonLeftIconClassName)).toBeTruthy();
        expect(host.classList.contains(buttonRightIconClassName)).toBeTruthy();
        expect(host.classList.contains('kbq-button')).toBeTruthy();
    });

    it('should stay an icon-only button when both icons use slots in reversed order', () => {
        const fixture = TestBed.createComponent(KbqButtonTwoIconsSlotTestApp);

        fixture.detectChanges();

        const host = fixture.debugElement.query(By.directive(KbqButtonCssStyler)).nativeElement;

        expect(host.classList.contains('kbq-button-icon')).toBeTruthy();
        expect(host.classList.contains('kbq-button')).toBeFalsy();

        expect(fixture.debugElement.query(By.css(`#icon1.${leftIconClassName}`))).not.toBeNull();
        expect(fixture.debugElement.query(By.css(`#icon2.${rightIconClassName}`))).not.toBeNull();

        expect(host.classList.contains(buttonLeftIconClassName)).toBeTruthy();
        expect(host.classList.contains(buttonRightIconClassName)).toBeTruthy();
    });
});

describe('Button text container', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                KbqButtonModule,
                KbqIconModule,
                KbqButtonLeftRightIconSlotTestApp,
                KbqButtonHtmlIconLeftCaseTestApp
            ]
        }).compileComponents();
    });

    it('should keep the text in .kbq-button-text and the marker-slot icons outside of it', () => {
        const fixture = TestBed.createComponent(KbqButtonLeftRightIconSlotTestApp);

        fixture.detectChanges();

        const textSpan = fixture.debugElement.query(By.css('.kbq-button-text')).nativeElement;
        const wrapper = fixture.debugElement.query(By.css('.kbq-button-wrapper')).nativeElement;
        const leftIcon = fixture.debugElement.query(By.css('#left-icon')).nativeElement;
        const rightIcon = fixture.debugElement.query(By.css('#right-icon')).nativeElement;

        // the text container holds only the text
        expect(textSpan.textContent.trim()).toBe('Some text');

        // marker icons are siblings of the text container, not nested inside it
        expect(textSpan.contains(leftIcon)).toBe(false);
        expect(textSpan.contains(rightIcon)).toBe(false);
        expect(leftIcon.parentElement).toBe(wrapper);
        expect(rightIcon.parentElement).toBe(wrapper);
    });

    it('should nest a legacy default-slot icon inside .kbq-button-text and still mark it left', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconLeftCaseTestApp);

        fixture.detectChanges();

        const textSpan = fixture.debugElement.query(By.css('.kbq-button-text')).nativeElement;
        const icon = textSpan.querySelector('.kbq-icon');

        // legacy icon (no marker) lands inside the text container...
        expect(icon).not.toBeNull();
        // ...and the styler still flattens it out to mark it as the left icon
        expect(icon.classList.contains(leftIconClassName)).toBe(true);
    });

    it('should expose textElement (.kbq-button-text) and parentTextElement (.kbq-button-wrapper)', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconLeftCaseTestApp);

        fixture.detectChanges();

        const button = fixture.debugElement.query(By.directive(KbqButton)).componentInstance as KbqButton;

        expect(button.textElement.nativeElement.classList.contains('kbq-button-text')).toBe(true);
        expect(button.parentTextElement.nativeElement.classList.contains('kbq-button-wrapper')).toBe(true);

        // parent (width container) must wrap the child (measured text) — guards against the two
        // ViewChildren being swapped, which would break kbq-title overflow detection
        expect(button.parentTextElement.nativeElement.contains(button.textElement.nativeElement)).toBe(true);
    });
});

describe('KbqButtonCssStyler without KbqButton', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [StylerOnlyTestApp]
        }).compileComponents();
    });

    it('should warn in dev mode when there is no .kbq-button-wrapper (styler used without KbqButton)', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        const fixture = TestBed.createComponent(StylerOnlyTestApp);

        fixture.detectChanges();

        expect(warnSpy).toHaveBeenCalledWith('KbqButtonCssStyler should be imported together with KbqButton.');

        warnSpy.mockRestore();
    });
});

describe(KbqButtonGroupRoot.name, () => {
    function createComponent<T>(
        component: Type<T>,
        imports: any[] = [],
        providers: Provider[] = []
    ): ComponentFixture<T> {
        TestBed.resetTestingModule();

        TestBed.configureTestingModule({
            imports: [...imports, component],
            providers: [...providers]
        }).compileComponents();

        const fixture = TestBed.createComponent<T>(component);

        fixture.autoDetectChanges();

        return fixture;
    }

    it('should propagate style to all child buttons', () => {
        const fixture = createComponent(BasicButtonGroupRootTestComponent);
        const { componentInstance } = fixture;

        componentInstance.style = KbqButtonStyles.Outline;
        fixture.detectChanges();

        const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[kbq-button]'));

        buttons.forEach((btn) => {
            expect(btn.classList.toString()).toContain(KbqButtonStyles.Outline);
        });
    });

    it('should fall back to Filled when falsy value is set', () => {
        const fixture = createComponent(BasicButtonGroupRootTestComponent);
        const { componentInstance } = fixture;

        expect(componentInstance.groupRoot().kbqStyle).toBe(`kbq-button-group-root_${KbqButtonStyles.Filled}`);
    });

    it('should propagate color to all child buttons', () => {
        const fixture = createComponent(BasicButtonGroupRootTestComponent);
        const { componentInstance } = fixture;

        componentInstance.color = KbqComponentColors.Theme;
        fixture.detectChanges();

        const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[kbq-button]'));

        buttons.forEach((btn) => {
            expect(btn.classList.toString()).toContain(KbqComponentColors.Theme);
        });
    });

    it('should accept arbitrary string color token', () => {
        const fixture = createComponent(BasicButtonGroupRootTestComponent);
        const { componentInstance } = fixture;

        componentInstance.color = 'custom-brand';
        fixture.detectChanges();

        expect(componentInstance.groupRoot().color).toBe('custom-brand');
    });

    it('should propagate disabled state to all child buttons', () => {
        const fixture = createComponent(BasicButtonGroupRootTestComponent);
        const { componentInstance } = fixture;

        componentInstance.disabled = true;
        fixture.detectChanges();

        const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[kbq-button]'));

        buttons.forEach((btn) => {
            expect(btn.hasAttribute('disabled')).toBeTruthy();
        });
    });

    it('should propagate color to dynamically added buttons via effect', () => {
        const fixture = createComponent(DynamicChildrenTestComponent);
        const { componentInstance } = fixture;

        componentInstance.color = KbqComponentColors.Error;
        fixture.detectChanges();

        componentInstance.showExtra = true;
        fixture.detectChanges();

        const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[kbq-button]'));

        expect(buttons.length).toBe(2);

        buttons.forEach((btn) => {
            expect(btn.classList.toString()).toContain(KbqComponentColors.Error);
        });
    });

    it('should propagate style to dynamically added buttons via effect', () => {
        const fixture = createComponent(DynamicChildrenTestComponent);
        const { componentInstance } = fixture;

        componentInstance.style = KbqButtonStyles.Outline;
        fixture.detectChanges();

        componentInstance.showExtra = true;
        fixture.detectChanges();

        const buttons: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[kbq-button]'));

        expect(buttons.length).toBe(2);

        buttons.forEach((btn) => {
            expect(btn.classList.toString()).toContain(KbqButtonStyles.Outline);
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqButtonModule, KbqDropdownModule],
    template: `
        <button kbq-button type="button" [color]="buttonColor" [disabled]="isDisabled" (click)="increment()"></button>
        <a href="#" kbq-button [color]="buttonColor" [disabled]="isDisabled" (click)="increment()"></a>
    `
})
class TestApp {
    clickCount: number = 0;
    isDisabled: boolean = false;
    buttonColor: ThemePalette;

    increment() {
        this.clickCount++;
    }
}

@Component({
    selector: 'kbq-button-comment-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <!-- comment-before -->
            <i kbq-icon="kbq-chevron-down-s_16"></i>
            <!-- comment-after -->
        </button>
    `
})
class KbqButtonCommentCaseTestApp {}

@Component({
    selector: 'kbq-button-two-icons-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <span>Some text</span>
            <i kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonHtmlIconRightCaseTestApp {}

@Component({
    selector: 'kbq-button-two-icons-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <i kbq-icon="kbq-chevron-down-s_16"></i>
            <span>Some text</span>
        </button>
    `
})
class KbqButtonHtmlIconLeftCaseTestApp {
    avoidCollisionMockTarget() {}
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            Some text
            <i kbq-icon="kbq-chevron-down-s_16"></i>
            Some text
        </button>
    `
})
class KbqButtonTextIconCaseTestApp {}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
            Some text
        </button>
    `
})
class KbqButtonTextIconLeftNgIfCaseTestApp {
    visible = true;

    avoidCollisionMockTarget() {}
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            Some text
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
        </button>
    `
})
class KbqButtonTextIconRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            Some text
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
            Some text
        </button>
    `
})
class KbqButtonTextIconLeftRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <span>Some text</span>
            <span>Some text</span>
            <span>Some text</span>
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
            <span>Some text</span>
            <span>Some text</span>
            <span>Some text</span>
        </button>
    `
})
class KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-comment-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <i id="icon1" kbq-icon="kbq-chevron-down-s_16"></i>
            <i id="icon2" kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonTwoIconsCaseTestApp {}

@Component({
    selector: 'kbq-button-three-icons-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <i id="icon1" kbq-icon="kbq-chevron-down-s_16"></i>
            <i id="icon2" kbq-icon="kbq-chevron-down-s_16"></i>
            <i id="icon3" kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonThreeIconsCaseTestApp {}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            @if (visible) {
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            }
        </button>
    `
})
class KbqButtonIconNgIfCaseTestApp {
    visible = true;
}

@Component({
    imports: [KbqButtonModule, KbqDropdownModule],
    template: `
        <button #triggerEl kbq-button [kbqDropdownTriggerFor]="dropdown">Toggle dropdown</button>
        <kbq-dropdown
            #dropdown="kbqDropdown"
            class="custom-one custom-two"
            [backdropClass]="backdropClass"
            [hasBackdrop]="true"
        >
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `
})
class ButtonDropdownTrigger {
    readonly trigger = viewChild.required('triggerEl', { read: ElementRef });
    backdropClass: string;
}

@Component({
    imports: [KbqButtonModule, KbqDropdownModule],
    template: `
        <a #triggerEl href="#" kbq-button disabled [kbqDropdownTriggerFor]="dropdown">Toggle dropdown</a>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item</button>
        </kbq-dropdown>
    `
})
class DisabledButtonDropdownTrigger {
    readonly trigger = viewChild.required('triggerEl', { read: ElementRef });
    readonly dropdownTrigger = viewChild.required(KbqDropdownTrigger);
}

@Component({
    imports: [KbqButtonModule],
    template: `
        <div kbqButtonGroupRoot [kbqStyle]="style" [color]="color" [disabled]="disabled">
            <button kbq-button>First</button>
            <button kbq-button>Second</button>
            <button kbq-button>Third</button>
        </div>
    `
})
class BasicButtonGroupRootTestComponent {
    readonly groupRoot = viewChild.required(KbqButtonGroupRoot);

    style: KbqButtonStyles | string = KbqButtonStyles.Filled;
    color: KbqComponentColors | ThemePalette | string = KbqComponentColors.ContrastFade;
    disabled = false;
}

@Component({
    imports: [KbqButtonModule],
    template: `
        <div kbqButtonGroupRoot [kbqStyle]="style" [color]="color">
            @if (showExtra) {
                <button kbq-button>Dynamic</button>
            }
            <button kbq-button>Static</button>
        </div>
    `
})
class DynamicChildrenTestComponent {
    readonly groupRoot = viewChild.required(KbqButtonGroupRoot);

    style: KbqButtonStyles | string = KbqButtonStyles.Filled;
    color: KbqComponentColors | string = KbqComponentColors.Theme;
    showExtra = false;
}

@Component({
    selector: 'kbq-button-left-icon-slot-reorder-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            Some text
            <i id="left-icon" kbqButtonLeftIcon kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonLeftIconSlotReorderTestApp {}

@Component({
    selector: 'kbq-button-right-icon-slot-reorder-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <i id="right-icon" kbqButtonRightIcon kbq-icon="kbq-chevron-down-s_16"></i>
            Some text
        </button>
    `
})
class KbqButtonRightIconSlotReorderTestApp {}

@Component({
    selector: 'kbq-button-left-right-icon-slot-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <i id="right-icon" kbqButtonRightIcon kbq-icon="kbq-chevron-down-s_16"></i>
            Some text
            <i id="left-icon" kbqButtonLeftIcon kbq-icon="kbq-chevron-down-s_16"></i>
        </button>
    `
})
class KbqButtonLeftRightIconSlotTestApp {}

@Component({
    selector: 'kbq-button-two-icons-slot-test-app',
    imports: [KbqButtonModule, KbqIconModule],
    template: `
        <button kbq-button type="button">
            <i id="icon2" kbqButtonRightIcon kbq-icon="kbq-chevron-down-s_16"></i>
            <i id="icon1" kbqButtonLeftIcon kbq-icon="kbq-play_16"></i>
        </button>
    `
})
class KbqButtonTwoIconsSlotTestApp {}

@Component({
    selector: 'styler-only-test-app',
    // KbqButton is intentionally NOT imported, so the host has no .kbq-button-wrapper
    imports: [KbqButtonCssStyler],
    template: `
        <div kbq-button></div>
    `
})
class StylerOnlyTestApp {}
