import { Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqIconModule } from '@koobiq/components/icon';
import { badgeRightIconClassName, KbqBadge, KbqBadgeColors, KbqBadgeModule, rightIconClassName } from './index';

describe(KbqBadge.name, () => {
    describe('basic styles', () => {
        let fixture: ComponentFixture<TestApp>;
        let badgeNativeElement: HTMLElement;

        beforeEach(fakeAsync(() => {
            TestBed.configureTestingModule({
                imports: [KbqBadgeModule, TestApp]
            });

            TestBed.compileComponents();

            fixture = TestBed.createComponent(TestApp);
            fixture.detectChanges();

            badgeNativeElement = fixture.debugElement.query(By.directive(KbqBadge)).nativeElement;
        }));

        it('should add class', () => {
            expect(badgeNativeElement.classList.contains('kbq-badge')).toBe(true);
        });

        it('should be filled and not compact by default', () => {
            expect(badgeNativeElement.classList.contains('kbq-badge-filled')).toBe(true);
            expect(badgeNativeElement.classList.contains('kbq-badge-outline')).toBe(false);
            expect(badgeNativeElement.classList.contains('kbq-badge_compact')).toBe(false);
        });

        it(`should fall back to ${KbqBadgeColors.FadeContrast} color`, () => {
            expect(badgeNativeElement.classList.contains(`kbq-badge_${KbqBadgeColors.FadeContrast}`)).toBe(true);
        });
    });

    describe('badgeColor', () => {
        let fixture: ComponentFixture<ColoredTestApp>;
        let badgeNativeElement: HTMLElement;
        let testComponent: ColoredTestApp;

        beforeEach(() => {
            TestBed.configureTestingModule({ imports: [KbqBadgeModule, ColoredTestApp] });

            fixture = TestBed.createComponent(ColoredTestApp);
            fixture.detectChanges();

            badgeNativeElement = fixture.debugElement.query(By.directive(KbqBadge)).nativeElement;
            testComponent = fixture.componentInstance;
        });

        it('should render the color as a class', () => {
            expect(badgeNativeElement.classList.contains(`kbq-badge_${KbqBadgeColors.Error}`)).toBe(true);
        });

        it('should replace the class when the color changes', () => {
            testComponent.color.set(KbqBadgeColors.Success);
            fixture.detectChanges();

            expect(badgeNativeElement.classList.contains(`kbq-badge_${KbqBadgeColors.Error}`)).toBe(false);
            expect(badgeNativeElement.classList.contains(`kbq-badge_${KbqBadgeColors.Success}`)).toBe(true);
        });

        it(`should fall back to ${KbqBadgeColors.FadeContrast} for an empty value`, () => {
            testComponent.color.set('');
            fixture.detectChanges();

            expect(badgeNativeElement.classList.contains(`kbq-badge_${KbqBadgeColors.FadeContrast}`)).toBe(true);
        });

        it('should report the raw color rather than the class', () => {
            const badge = fixture.debugElement.query(By.directive(KbqBadge)).componentInstance as KbqBadge;

            expect(badge.badgeColor()).toBe(KbqBadgeColors.Error);
        });
    });

    describe('boolean attributes', () => {
        it('should treat a valueless attribute as true', () => {
            TestBed.configureTestingModule({ imports: [KbqBadgeModule, StaticAttributesTestApp] });

            const fixture = TestBed.createComponent(StaticAttributesTestApp);

            fixture.detectChanges();

            const badgeNativeElement = fixture.debugElement.query(By.directive(KbqBadge)).nativeElement as HTMLElement;

            expect(badgeNativeElement.classList.contains('kbq-badge_compact')).toBe(true);
            expect(badgeNativeElement.classList.contains('kbq-badge-outline')).toBe(true);
            expect(badgeNativeElement.classList.contains('kbq-badge-filled')).toBe(false);
        });
    });

    describe('icon spacing', () => {
        let fixture: ComponentFixture<AsyncIconTestApp>;
        let badgeNativeElement: HTMLElement;
        let testComponent: AsyncIconTestApp;

        beforeEach(() => {
            TestBed.configureTestingModule({
                imports: [KbqBadgeModule, KbqIconModule, AsyncIconTestApp]
            });

            fixture = TestBed.createComponent(AsyncIconTestApp);
            fixture.detectChanges();

            badgeNativeElement = fixture.debugElement.query(By.directive(KbqBadge)).nativeElement;
            testComponent = fixture.componentInstance;
        });

        it('should not render an icon before it is projected', () => {
            const icon = badgeNativeElement.querySelector('[kbq-icon]');

            expect(icon).toBeNull();
            expect(badgeNativeElement.classList.contains(badgeRightIconClassName)).toBe(false);
        });

        it('should add right icon class when icon is projected asynchronously', (done) => {
            testComponent.showIcon.set(true);
            fixture.detectChanges();

            setTimeout(() => {
                const icon = badgeNativeElement.querySelector('[kbq-icon]')!;

                expect(icon.classList.contains(rightIconClassName)).toBe(true);
                expect(badgeNativeElement.classList.contains(badgeRightIconClassName)).toBe(true);
                done();
            });
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqBadgeModule],
    template: `
        <kbq-badge />
    `
})
class TestApp {}

@Component({
    selector: 'colored-test-app',
    imports: [KbqBadgeModule],
    template: `
        <kbq-badge [badgeColor]="color()">badge</kbq-badge>
    `
})
class ColoredTestApp {
    readonly color = signal<string>(KbqBadgeColors.Error);
}

@Component({
    selector: 'static-attributes-test-app',
    imports: [KbqBadgeModule],
    template: `
        <kbq-badge compact outline>badge</kbq-badge>
    `
})
class StaticAttributesTestApp {}

@Component({
    selector: 'async-icon-test-app',
    imports: [KbqBadgeModule, KbqIconModule],
    template: `
        <kbq-badge>
            Normal
            @if (showIcon()) {
                <i kbq-icon="kbq-circle-question_16"></i>
            }
        </kbq-badge>
    `
})
class AsyncIconTestApp {
    showIcon = signal(false);
}
