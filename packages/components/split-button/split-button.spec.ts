import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { KbqButton, KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqSplitButton, KbqSplitButtonModule } from '@koobiq/components/split-button';

describe('KbqSplitButton', () => {
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
                TestAppDropdownAutoWidth
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

        it('should throw when no kbq-button children are provided', () => {
            const errorFixture = TestBed.createComponent(TestAppNoButtons);

            expect(() => errorFixture.detectChanges()).toThrowError(
                'kbq-split-button must contain at least one button'
            );
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

        it('should not update color when an empty value is set', () => {
            component.color = KbqComponentColors.Contrast;
            fixture.detectChanges();

            component.color = '';
            fixture.detectChanges();

            buttons.forEach((btn) => {
                expect(btn.injector.get(KbqButton).color).toBe(KbqComponentColors.Contrast);
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
            fixture.detectChanges();
            // TestApp already has first button disabled
            const testFixture = TestBed.createComponent(TestApp);

            testFixture.detectChanges();
            const testHost = testFixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

            expect(testHost.classList.contains('kbq-split-button_first-disabled')).toBe(true);
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

    describe('dropdown integration', () => {
        it('should set xPosition to "before" on the dropdown', () => {
            const fixture = TestBed.createComponent(TestAppDropdown);

            fixture.detectChanges();

            const dropdownTrigger = fixture.debugElement
                .query(By.directive(KbqDropdownTrigger))
                .injector.get(KbqDropdownTrigger);

            expect(dropdownTrigger.dropdown.xPosition).toBe('before');
        });

        it('should set triggerWidth when panelAutoWidth is true', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestAppDropdownAutoWidth);
            const hostEl = fixture.debugElement.query(By.directive(KbqSplitButton)).nativeElement;

            jest.spyOn(hostEl, 'getClientRects').mockReturnValue([{ width: 200 }] as unknown as DOMRectList);

            fixture.detectChanges();
            tick(50);

            const dropdownTrigger = fixture.debugElement
                .query(By.directive(KbqDropdownTrigger))
                .injector.get(KbqDropdownTrigger);

            expect(dropdownTrigger.dropdown.triggerWidth).toBe('200px');
        }));
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqSplitButtonModule, KbqButtonModule, KbqIconModule],
    template: `
        <kbq-split-button>
            <button kbq-button [disabled]="true">
                <i kbq-icon="kbq-plus_16"></i>
            </button>
            <button kbq-button>
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
    style: string = KbqButtonStyles.Filled;
    color: string = KbqComponentColors.ContrastFade;
    disabled: boolean = false;
    firstDisabled: boolean = false;
    secondDisabled: boolean = false;
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
            <button kbq-button [kbqDropdownTriggerFor]="dropdown">
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
        <kbq-split-button [panelAutoWidth]="true">
            <button kbq-button>Action</button>
            <button kbq-button [kbqDropdownTriggerFor]="dropdown">
                <i kbq-icon="kbq-chevron-down-s_16"></i>
            </button>
        </kbq-split-button>
        <kbq-dropdown #dropdown="kbqDropdown">
            <button kbq-dropdown-item>Item 1</button>
        </kbq-dropdown>
    `
})
class TestAppDropdownAutoWidth {}
