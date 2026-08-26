import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import {
    KbqButton,
    KbqButtonColor,
    KbqButtonModule,
    KbqButtonStyleInput,
    KbqButtonStyles
} from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButton, KbqSplitButtonModule } from '@koobiq/components/split-button';
import { axe } from 'jest-axe';

describe('KbqSplitButton', () => {
    const getButtons = (fixture: ComponentFixture<unknown>): KbqButton[] =>
        fixture.debugElement.queryAll(By.directive(KbqButton)).map((debugEl) => debugEl.injector.get(KbqButton));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                KbqSplitButtonModule,
                KbqButtonModule,
                KbqDropdownModule,
                NoopAnimationsModule,
                TestApp,
                TestAppEnabled,
                TestAppInputs,
                TestAppSingle,
                TestAppNoButtons,
                TestAppSecondDisabled,
                TestAppDropdown,
                TestAppDropdownAutoWidth,
                TestAppUnboundColor,
                TestAppOwnButtonSettings,
                TestAppDynamicButtons
            ]
        }).compileComponents();
    });

    describe('initialization', () => {
        let fixture: ComponentFixture<TestApp>;
        let nativeElement: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestApp);
            nativeElement = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;
            fixture.detectChanges();
        });

        it('should have kbq-split-button class on host', () => {
            expect(nativeElement.classList.contains('kbq-split-button')).toBe(true);
        });

        it('should throw in dev mode when no kbq-button children are provided', () => {
            const errorFixture = TestBed.createComponent(TestAppNoButtons);

            expect(() => errorFixture.detectChanges()).toThrow('kbq-split-button must contain at least one button');
        });

        it('should degrade to an empty control outside dev mode instead of aborting change detection', () => {
            const errorFixture = TestBed.createComponent(TestAppNoButtons);
            const global = globalThis as { ngDevMode?: unknown };
            const devMode = global.ngDevMode;

            // The flag `isDevMode()` reads, so this is what the guard sees in a production build. Restored
            // in a `finally` because everything Angular asserts is behind the same global.
            global.ngDevMode = false;

            try {
                expect(() => errorFixture.detectChanges()).not.toThrow();
            } finally {
                global.ngDevMode = devMode;
            }
        });
    });

    describe('CSS classes on nested buttons', () => {
        let fixture: ComponentFixture<TestAppEnabled>;
        let buttons: DebugElement[];
        let hostEl: HTMLElement;

        beforeEach(() => {
            fixture = TestBed.createComponent(TestAppEnabled);
            fixture.detectChanges();
            buttons = fixture.debugElement.queryAll(By.directive(KbqButton));
            hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;
        });

        it('should apply kbq-split-button_first to the first button', () => {
            expect(buttons[0].nativeElement.classList.contains('kbq-split-button_first')).toBe(true);
        });

        it('should apply kbq-split-button_second to the last button', () => {
            expect(buttons[1].nativeElement.classList.contains('kbq-split-button_second')).toBe(true);
        });

        it('should apply kbq-split-button_item to all buttons', () => {
            buttons.forEach((btn) => {
                expect(btn.nativeElement.classList.contains('kbq-split-button_item')).toBe(true);
            });
        });

        it('should apply kbq-split-button_styles-for-nested when more than one button', () => {
            expect(hostEl.classList.contains('kbq-split-button_styles-for-nested')).toBe(true);
        });

        it('should not apply kbq-split-button_styles-for-nested when only one button', () => {
            const singleFixture = TestBed.createComponent(TestAppSingle);

            singleFixture.detectChanges();
            const singleHost = singleFixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

            expect(singleHost.classList.contains('kbq-split-button_styles-for-nested')).toBe(false);
        });
    });

    describe('kbqStyle input', () => {
        let fixture: ComponentFixture<TestAppInputs>;
        let component: TestAppInputs;
        let hostEl: HTMLElement;
        let buttons: DebugElement[];

        beforeEach(() => {
            fixture = TestBed.createComponent(TestAppInputs);
            component = fixture.componentInstance;
            fixture.detectChanges();
            hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;
            buttons = fixture.debugElement.queryAll(By.directive(KbqButton));
        });

        it('should have kbq-button_filled class on host by default', () => {
            expect(hostEl.classList.contains('kbq-button_filled')).toBe(true);
        });

        it('should propagate style to all nested buttons', () => {
            buttons.forEach((btn) => {
                expect(btn.nativeElement.classList.contains('kbq-button_filled')).toBe(true);
            });
        });

        it('should update host class and nested buttons when kbqStyle changes', () => {
            component.style = KbqButtonStyles.Outline;
            fixture.detectChanges();

            expect(hostEl.classList.contains('kbq-button_outline')).toBe(true);
            buttons.forEach((btn) => {
                expect(btn.nativeElement.classList.contains('kbq-button_outline')).toBe(true);
            });
        });

        it('should fall back to filled when kbqStyle is set to empty string', () => {
            component.style = '';
            fixture.detectChanges();

            expect(hostEl.classList.contains('kbq-button_filled')).toBe(true);
        });
    });

    describe('color input', () => {
        let fixture: ComponentFixture<TestAppInputs>;
        let component: TestAppInputs;
        let buttons: DebugElement[];

        beforeEach(() => {
            fixture = TestBed.createComponent(TestAppInputs);
            component = fixture.componentInstance;
            fixture.detectChanges();
            buttons = fixture.debugElement.queryAll(By.directive(KbqButton));
        });

        it('should default color on nested buttons to contrast-fade', () => {
            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).color).toBe(KbqComponentColors.ContrastFade);
            });
        });

        it('should propagate color to all nested buttons', () => {
            component.color = KbqComponentColors.Theme;
            fixture.detectChanges();

            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).color).toBe(KbqComponentColors.Theme);
            });
        });

        it('should release nested buttons back to the style default when an empty value is set', () => {
            component.color = KbqComponentColors.Contrast;
            fixture.detectChanges();

            component.color = null;
            fixture.detectChanges();

            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).color).toBe(KbqComponentColors.ContrastFade);
            });
        });

        it('should leave nested buttons on the default color of the style while the color is unbound', () => {
            const unboundFixture = TestBed.createComponent(TestAppUnboundColor);

            unboundFixture.detectChanges();

            unboundFixture.debugElement.queryAll(By.directive(KbqButton)).forEach((btn) => {
                expect(btn.injector.get(KbqButton).color).toBe(KbqComponentColors.Contrast);
            });
        });

        it('should keep the color when the style changes while the color is bound', () => {
            component.color = KbqComponentColors.Theme;
            fixture.detectChanges();

            component.style = KbqButtonStyles.Transparent;
            fixture.detectChanges();

            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).color).toBe(KbqComponentColors.Theme);
            });
        });
    });

    describe('disabled input', () => {
        let fixture: ComponentFixture<TestAppInputs>;
        let component: TestAppInputs;
        let hostEl: HTMLElement;
        let buttons: DebugElement[];

        beforeEach(() => {
            fixture = TestBed.createComponent(TestAppInputs);
            component = fixture.componentInstance;
            fixture.detectChanges();
            hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;
            buttons = fixture.debugElement.queryAll(By.directive(KbqButton));
        });

        it('should propagate disabled=true to all nested buttons', () => {
            component.disabled = true;
            fixture.detectChanges();

            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).disabled).toBe(true);
            });
        });

        // Own fixture: the input has to carry its value into the very first pass, where the content
        // query that holds the buttons is not resolved yet.
        it('should propagate disabled to nested buttons that were not projected yet', () => {
            const initiallyDisabled = TestBed.createComponent(TestAppInputs);

            initiallyDisabled.componentInstance.disabled = true;
            initiallyDisabled.detectChanges();

            getButtons(initiallyDisabled).forEach((button) => {
                expect(button.disabled).toBe(true);
            });
        });

        it('should propagate disabled=false to all nested buttons', () => {
            component.disabled = true;
            fixture.detectChanges();

            component.disabled = false;
            fixture.detectChanges();

            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).disabled).toBe(false);
            });
        });

        it('should apply kbq-split-button_first-disabled when first button is disabled', () => {
            component.firstDisabled = true;
            fixture.detectChanges();

            expect(hostEl.classList.contains('kbq-split-button_first-disabled')).toBe(true);
        });

        it('should not apply kbq-split-button_first-disabled when first button is enabled', () => {
            expect(hostEl.classList.contains('kbq-split-button_first-disabled')).toBe(false);
        });

        it('should apply kbq-split-button_second-disabled when second button is disabled', () => {
            component.secondDisabled = true;
            fixture.detectChanges();

            expect(hostEl.classList.contains('kbq-split-button_second-disabled')).toBe(true);
        });

        it('should not apply kbq-split-button_second-disabled when second button is enabled', () => {
            expect(hostEl.classList.contains('kbq-split-button_second-disabled')).toBe(false);
        });

        it('should apply both disabled classes when both buttons are disabled', () => {
            component.disabled = true;
            fixture.detectChanges();

            expect(hostEl.classList.contains('kbq-split-button_first-disabled')).toBe(true);
            expect(hostEl.classList.contains('kbq-split-button_second-disabled')).toBe(true);
        });
    });

    describe('firstDisabled / secondDisabled getters', () => {
        it('firstDisabled should be true when first button has disabled=true', () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            const splitButton = fixture.debugElement.query(By.directive(KbqSplitButton))
                .componentInstance as KbqSplitButton;

            expect(splitButton.firstDisabled).toBe(true);
        });

        it('firstDisabled should be false when first button is enabled', () => {
            const fixture = TestBed.createComponent(TestAppEnabled);

            fixture.detectChanges();
            const splitButton = fixture.debugElement.query(By.directive(KbqSplitButton))
                .componentInstance as KbqSplitButton;

            expect(splitButton.firstDisabled).toBe(false);
        });

        it('secondDisabled should be false when only one button is present', () => {
            const fixture = TestBed.createComponent(TestAppSingle);

            fixture.detectChanges();
            const splitButton = fixture.debugElement.query(By.directive(KbqSplitButton))
                .componentInstance as KbqSplitButton;

            expect(splitButton.secondDisabled).toBe(false);
        });

        it('secondDisabled should be true when last of 2+ buttons is disabled', () => {
            const fixture = TestBed.createComponent(TestAppSecondDisabled);

            fixture.detectChanges();
            const splitButton = fixture.debugElement.query(By.directive(KbqSplitButton))
                .componentInstance as KbqSplitButton;

            expect(splitButton.secondDisabled).toBe(true);
        });
    });

    describe('settings owned by a nested button', () => {
        it('should keep a button disabled through its own input when the split button is re-enabled', () => {
            const fixture = TestBed.createComponent(TestAppOwnButtonSettings);

            fixture.detectChanges();

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            fixture.componentInstance.disabled = false;
            fixture.detectChanges();

            const [first, second] = getButtons(fixture);

            expect(first.disabled).toBe(true);
            expect(second.disabled).toBe(false);
        });

        it('should not overwrite a style set through the button own input', () => {
            const fixture = TestBed.createComponent(TestAppOwnButtonSettings);

            fixture.detectChanges();

            fixture.componentInstance.style = KbqButtonStyles.Outline;
            fixture.detectChanges();

            const [first, second] = getButtons(fixture);

            expect(first.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Transparent}`);
            expect(second.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Outline}`);
        });

        it('should not overwrite a color set through the button own input', () => {
            const fixture = TestBed.createComponent(TestAppOwnButtonSettings);

            fixture.detectChanges();

            const [first, second] = getButtons(fixture);

            expect(first.color).toBe(KbqComponentColors.Theme);
            expect(second.color).toBe(KbqComponentColors.ContrastFade);
        });
    });

    describe('dynamic buttons', () => {
        it('should reassign the position classes when a button is added', () => {
            const fixture = TestBed.createComponent(TestAppDynamicButtons);

            fixture.detectChanges();

            fixture.componentInstance.showSecond = true;
            fixture.detectChanges();

            const [first, second] = fixture.debugElement.queryAll(By.directive(KbqButton));
            const hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

            expect(first.nativeElement.classList.contains('kbq-split-button_first')).toBe(true);
            expect(first.nativeElement.classList.contains('kbq-split-button_second')).toBe(false);
            expect(second.nativeElement.classList.contains('kbq-split-button_second')).toBe(true);
            expect(hostEl.classList.contains('kbq-split-button_styles-for-nested')).toBe(true);
        });

        it('should reassign the position classes when a button is removed', () => {
            const fixture = TestBed.createComponent(TestAppDynamicButtons);

            fixture.componentInstance.showSecond = true;
            fixture.detectChanges();

            fixture.componentInstance.showSecond = false;
            fixture.detectChanges();

            const [first] = fixture.debugElement.queryAll(By.directive(KbqButton));
            const hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

            expect(first.nativeElement.classList.contains('kbq-split-button_first')).toBe(true);
            expect(first.nativeElement.classList.contains('kbq-split-button_second')).toBe(true);
            expect(hostEl.classList.contains('kbq-split-button_styles-for-nested')).toBe(false);
        });

        it('should propagate the split button style to a button added later', () => {
            const fixture = TestBed.createComponent(TestAppDynamicButtons);

            fixture.componentInstance.style = KbqButtonStyles.Outline;
            fixture.detectChanges();

            fixture.componentInstance.showSecond = true;
            fixture.detectChanges();

            getButtons(fixture).forEach((button) => {
                expect(button.kbqStyle).toBe(`kbq-button_${KbqButtonStyles.Outline}`);
            });
        });

        it('should stop reacting to button changes once the split button is destroyed', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestAppDynamicButtons);

            fixture.componentInstance.showSecond = true;
            fixture.detectChanges();

            const first = fixture.debugElement.query(By.directive(KbqButton)).nativeElement as HTMLElement;

            fixture.componentInstance.showSecond = false;
            fixture.detectChanges();

            // Sentinel: a class write that survives the teardown can only come from work the split
            // button scheduled for itself and never cancelled.
            first.classList.remove('kbq-split-button_first');
            fixture.destroy();

            flush();

            expect(first.classList.contains('kbq-split-button_first')).toBe(false);
        }));
    });

    describe('dropdown integration', () => {
        it('should set xPosition to "before" on the dropdown', () => {
            const fixture = TestBed.createComponent(TestAppDropdown);

            fixture.detectChanges();

            const dropdownTrigger = fixture.debugElement
                .query(By.directive(KbqDropdownTrigger))
                .injector.get(KbqDropdownTrigger);

            expect(dropdownTrigger.dropdown.xPosition).toBe('before');
        });

        /**
         * Opens the dropdown with the split-button host measuring 600 and the chevron trigger — which is
         * what the dropdown would measure on its own — measuring 50, then returns the rendered pane.
         * The two straddle the 200px default `panelMinWidth`, so the measured origin is observable.
         */
        const openPanelWithMockedWidths = (panelAutoWidth: boolean): HTMLElement => {
            const fixture = TestBed.createComponent(TestAppDropdownAutoWidth);

            fixture.componentInstance.panelAutoWidth = panelAutoWidth;

            const hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;
            const triggerDebugEl = fixture.debugElement.query(By.directive(KbqDropdownTrigger));

            jest.spyOn(hostEl, 'getBoundingClientRect').mockReturnValue({ width: 600 } as DOMRect);
            jest.spyOn(triggerDebugEl.nativeElement, 'getBoundingClientRect').mockReturnValue({ width: 50 } as DOMRect);

            fixture.detectChanges();

            triggerDebugEl.injector.get(KbqDropdownTrigger).open();
            fixture.detectChanges();

            return TestBed.inject(OverlayContainer).getContainerElement().querySelector('.cdk-overlay-pane')!;
        };

        it('should match the panel width to the split-button when panelAutoWidth is true', () => {
            expect(openPanelWithMockedWidths(true).style.minWidth).toBe('600px');
        });

        it('should fall back to the default minimum when panelAutoWidth is false', () => {
            // The chevron alone is 50px, so the 200px default `panelMinWidth` floor applies instead.
            expect(openPanelWithMockedWidths(false).style.minWidth).toBe('200px');
        });
    });

    describe('a11y', () => {
        it('should expose the host as a group', () => {
            const fixture = TestBed.createComponent(TestAppEnabled);

            fixture.detectChanges();

            const hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

            expect(hostEl.getAttribute('role')).toBe('group');
        });

        it('should reflect the open state of the menu on the trigger', () => {
            const fixture = TestBed.createComponent(TestAppDropdown);

            fixture.detectChanges();

            const triggerDebugEl = fixture.debugElement.query(By.directive(KbqDropdownTrigger));

            expect(triggerDebugEl.nativeElement.getAttribute('aria-expanded')).toBe('false');

            triggerDebugEl.injector.get(KbqDropdownTrigger).open();
            fixture.detectChanges();

            expect(triggerDebugEl.nativeElement.getAttribute('aria-expanded')).toBe('true');
        });

        it('should have no violations with a closed menu', async () => {
            const fixture = TestBed.createComponent(TestAppDropdown);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });

        it('should have no violations when a nested button is disabled', async () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqIconModule],
    template: `
        <kbq-split-button>
            <button kbq-button aria-label="Add" [disabled]="true">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
            <button kbq-button aria-label="More options">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>
    `
})
class TestApp {}

@Component({
    selector: 'test-app-enabled',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button>
            <button kbq-button>First</button>
            <button kbq-button>Second</button>
        </kbq-split-button>
    `
})
class TestAppEnabled {}

@Component({
    selector: 'test-app-inputs',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button [kbqStyle]="style" [color]="color" [disabled]="disabled">
            <button kbq-button [disabled]="firstDisabled">First</button>
            <button kbq-button [disabled]="secondDisabled">Second</button>
        </kbq-split-button>
    `
})
class TestAppInputs {
    style: KbqButtonStyleInput = KbqButtonStyles.Filled;
    color: KbqButtonColor | null = KbqComponentColors.ContrastFade;
    disabled: boolean = false;
    firstDisabled: boolean = false;
    secondDisabled: boolean = false;
}

@Component({
    selector: 'test-app-unbound-color',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button [kbqStyle]="style">
            <button kbq-button>First</button>
            <button kbq-button>Second</button>
        </kbq-split-button>
    `
})
class TestAppUnboundColor {
    readonly style = KbqButtonStyles.Transparent;
}

@Component({
    selector: 'test-app-own-button-settings',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button [kbqStyle]="style" [disabled]="disabled">
            <button kbq-button [disabled]="true" [kbqStyle]="buttonStyle" [color]="buttonColor">First</button>
            <button kbq-button>Second</button>
        </kbq-split-button>
    `
})
class TestAppOwnButtonSettings {
    readonly buttonStyle = KbqButtonStyles.Transparent;
    readonly buttonColor = KbqComponentColors.Theme;

    style: KbqButtonStyleInput = KbqButtonStyles.Filled;
    disabled: boolean = false;
}

@Component({
    selector: 'test-app-dynamic-buttons',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button [kbqStyle]="style">
            <button kbq-button>First</button>
            @if (showSecond) {
                <button kbq-button>Second</button>
            }
        </kbq-split-button>
    `
})
class TestAppDynamicButtons {
    style: KbqButtonStyleInput = KbqButtonStyles.Filled;
    showSecond: boolean = false;
}

@Component({
    selector: 'test-app-single',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button>
            <button kbq-button>Only</button>
        </kbq-split-button>
    `
})
class TestAppSingle {}

@Component({
    selector: 'test-app-second-disabled',
    imports: [KbqSplitButtonModule, KbqButtonModule],
    template: `
        <kbq-split-button>
            <button kbq-button>First</button>
            <button kbq-button [disabled]="true">Second</button>
        </kbq-split-button>
    `
})
class TestAppSecondDisabled {}

@Component({
    selector: 'test-app-no-buttons',
    imports: [KbqSplitButtonModule],
    template: '<kbq-split-button />'
})
class TestAppNoButtons {}

@Component({
    selector: 'test-app-dropdown',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqDropdownModule, KbqIconModule],
    template: `
        <kbq-split-button>
            <button kbq-button>Action</button>
            <button kbq-button aria-label="More options" [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item 1</button>
        </kbq-dropdown>
    `
})
class TestAppDropdown {}

@Component({
    selector: 'test-app-dropdown-auto-width',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqDropdownModule, KbqIconModule],
    template: `
        <kbq-split-button [panelAutoWidth]="panelAutoWidth">
            <button kbq-button>Action</button>
            <button kbq-button aria-label="More options" [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item 1</button>
        </kbq-dropdown>
    `
})
class TestAppDropdownAutoWidth {
    panelAutoWidth = true;
}
