import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqBadge, KbqBadgeModule } from './index';

describe('MсAlert', () => {
    let fixture: ComponentFixture<TestApp>;
    let alertDebugElement: DebugElement;
    let alertNativeElement: HTMLElement;
    // let testComponent: TestApp;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqBadgeModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        alertDebugElement = fixture.debugElement.query(By.directive(KbqBadge));
        alertNativeElement = alertDebugElement.nativeElement;
        // testComponent = fixture.debugElement.componentInstance;
    }));

    it('should add class', () => {
        expect(alertNativeElement.classList.contains('kbq-badge')).toBe(true);
    });
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-badge />
    `
})
class TestApp {}
