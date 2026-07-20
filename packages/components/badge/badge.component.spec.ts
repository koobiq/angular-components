import { Component, signal } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqIconModule } from '@koobiq/components/icon';
import { badgeRightIconClassName, KbqBadge, KbqBadgeModule, rightIconClassName } from './index';

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
