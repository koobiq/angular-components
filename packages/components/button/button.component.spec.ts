import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ThemePalette } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import {
    buttonLeftIconClassName,
    buttonRightIconClassName,
    KbqButtonCssStyler,
    KbqButtonModule,
    leftIconClassName,
    rightIconClassName
} from './index';

describe('KbqButton', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();
    }));

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

            expect(buttonNativeElement.disabled).withContext('Expected button not to be disabled').toBeFalsy();

            fixture.componentInstance.isDisabled = true;
            fixture.detectChanges();
            expect(buttonNativeElement.disabled).withContext('Expected button to be disabled').toBeTruthy();
        });
    });

    describe('a[kbq-button]', () => {
        it('should not redirect if disabled', () => {
            const fixture = TestBed.createComponent(TestApp);
            const testComponent = fixture.debugElement.componentInstance;
            const buttonDebugElement = fixture.debugElement.query(By.css('.kbq-button-overlay'));

            testComponent.isDisabled = true;
            fixture.detectChanges();

            buttonDebugElement.nativeElement.click();
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

    it('should handle a click on the button', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;
        const buttonDebugElement = fixture.debugElement.query(By.css('button'));

        buttonDebugElement.nativeElement.click();

        expect(testComponent.clickCount).toBe(1);
    });
});

describe('Button with icon', () => {
    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqButtonModule, KbqIconModule],
            declarations: [
                KbqButtonCommentCaseTestApp,
                KbqButtonHtmlIconLeftCaseTestApp,
                KbqButtonHtmlIconRightCaseTestApp,
                KbqButtonTextIconCaseTestApp,
                KbqButtonTextIconLeftNgIfCaseTestApp,
                KbqButtonTextIconRightNgIfCaseTestApp,
                KbqButtonTextIconLeftRightNgIfCaseTestApp,
                KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp,
                KbqButtonTwoIconsCaseTestApp,
                KbqButtonIconNgIfCaseTestApp
            ]
        });

        TestBed.compileComponents();
    }));

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

    it('should add right css class when the previous sibling is an html element', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconRightCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`)))
            .withContext('Expected the element has right css class')
            .toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`)))
            .withContext('Expected the element has right css class')
            .toBeFalsy();
    });

    it('should add left css class when the next sibling is an html element', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlIconLeftCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`)))
            .withContext('Expected the element has left css class')
            .toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`)))
            .withContext('Expected the element has right css class')
            .toBeFalsy();
    });

    it('should add left css class when the right visible sibling is a text element and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`)))
            .withContext('Expected the element has left css class')
            .toBeTruthy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`)))
            .withContext('Expected the element has right css class')
            .toBeFalsy();
    });

    it('should NOT add left,right css class when the left,right visible sibling is a text element and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonTextIconLeftRightNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`)))
            .withContext('Expected the element missing left css class')
            .toBeFalsy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`)))
            .withContext('Expected the element missing right css class')
            .toBeFalsy();
    });
    it('should NOT add left,right css class when the more than 1 siblings on the left,right and icon created with ngIf', () => {
        const fixture = TestBed.createComponent(KbqButtonHtmlNodesNCountIconLeftRightNgIfCaseTestApp);

        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css(`.${buttonLeftIconClassName}`)))
            .withContext('Expected the element missing left css class')
            .toBeFalsy();

        expect(fixture.debugElement.query(By.css(`.${buttonRightIconClassName}`)))
            .withContext('Expected the element missing right css class')
            .toBeFalsy();
    });

    it('should toggle host button class type on icon removal/reveal', waitForAsync(() => {
        const fixture = TestBed.createComponent(KbqButtonIconNgIfCaseTestApp);
        const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));

        fixture.detectChanges();

        expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeTrue();
        expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeFalse();

        fixture.debugElement.componentInstance.visible = false;
        fixture.detectChanges();

        setTimeout(() => {
            expect(debugElement.nativeElement.classList.contains('kbq-button-icon')).toBeFalse();
            expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTrue();
        }, 0);
    }));

    it('should toggle additional classes on icon removal/reveal', waitForAsync(() => {
        [
            { component: KbqButtonTextIconLeftNgIfCaseTestApp, cssClass: buttonLeftIconClassName },
            { component: KbqButtonTextIconRightNgIfCaseTestApp, cssClass: buttonRightIconClassName }
        ].forEach(({ component, cssClass }) => {
            const fixture = TestBed.createComponent(component);
            const debugElement = fixture.debugElement.query(By.directive(KbqButtonCssStyler));
            fixture.detectChanges();

            expect(debugElement.nativeElement.classList.contains('kbq-button')).toBeTrue();
            expect(debugElement.nativeElement.classList.contains(cssClass)).toBeTrue();
            fixture.debugElement.componentInstance.visible = false;
            fixture.detectChanges();

            setTimeout(() => {
                expect(debugElement.nativeElement.classList.contains(cssClass)).toBeFalse();
            }, 0);
        });
    }));
});

@Component({
    selector: 'test-app',
    template: `
        <button
            [color]="buttonColor"
            [disabled]="isDisabled"
            (click)="increment()"
            kbq-button
            type="button"
        ></button>
        <a
            [color]="buttonColor"
            [disabled]="isDisabled"
            (click)="increment()"
            href="#"
            kbq-button
        ></a>
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
    template: `
        <button
            kbq-button
            type="button"
        >
            <!-- comment-before -->
            <i kbq-icon="mc-angle-down-S_16"></i>
            <!-- comment-after -->
        </button>
    `
})
class KbqButtonCommentCaseTestApp {}

@Component({
    selector: 'kbq-button-two-icons-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            <span>Some text</span>
            <i kbq-icon="mc-angle-down-S_16"></i>
        </button>
    `
})
class KbqButtonHtmlIconRightCaseTestApp {}

@Component({
    selector: 'kbq-button-two-icons-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            <i kbq-icon="mc-angle-down-S_16"></i>
            <span>Some text</span>
        </button>
    `
})
class KbqButtonHtmlIconLeftCaseTestApp {
    avoidCollisionMockTarget() {}
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            Some text
            <i kbq-icon="mc-angle-down-S_16"></i>
            Some text
        </button>
    `
})
class KbqButtonTextIconCaseTestApp {}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            <i
                *ngIf="visible"
                kbq-icon="mc-angle-down-S_16"
            ></i>
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
    template: `
        <button
            kbq-button
            type="button"
        >
            Some text
            <i
                *ngIf="visible"
                kbq-icon="mc-angle-down-S_16"
            ></i>
        </button>
    `
})
class KbqButtonTextIconRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            Some text
            <i
                *ngIf="visible"
                kbq-icon="mc-angle-down-S_16"
            ></i>
            Some text
        </button>
    `
})
class KbqButtonTextIconLeftRightNgIfCaseTestApp {
    visible = true;
}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            <span>Some text</span>
            <span>Some text</span>
            <span>Some text</span>
            <i
                *ngIf="visible"
                kbq-icon="mc-angle-down-S_16"
            ></i>
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
    template: `
        <button
            kbq-button
            type="button"
        >
            <i
                id="icon1"
                kbq-icon="mc-angle-down-S_16"
            ></i>
            <i
                id="icon2"
                kbq-icon="mc-angle-down-S_16"
            ></i>
        </button>
    `
})
class KbqButtonTwoIconsCaseTestApp {}

@Component({
    selector: 'kbq-button-text-icon-case-test-app',
    template: `
        <button
            kbq-button
            type="button"
        >
            <i
                *ngIf="visible"
                kbq-icon="mc-angle-down-S_16"
            ></i>
        </button>
    `
})
class KbqButtonIconNgIfCaseTestApp {
    visible = true;
}
