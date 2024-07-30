import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqCard, KbqCardModule } from './index';

describe('MсCard', () => {
    let fixture: ComponentFixture<TestApp>;
    let cardDebugElement: DebugElement;
    let cardNativeElement: HTMLElement;
    let testComponent: TestApp;

    beforeEach(fakeAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqCardModule],
            declarations: [TestApp]
        });

        TestBed.compileComponents();

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        cardDebugElement = fixture.debugElement.query(By.directive(KbqCard));
        cardNativeElement = cardDebugElement.nativeElement;
        testComponent = fixture.debugElement.componentInstance;
    }));

    it('should add class on selected', () => {
        testComponent.selected = true;
        fixture.detectChanges();

        expect(cardNativeElement.classList.contains('kbq-selected')).toBe(true);
    });

    it('should handle a click on the card', () => {
        cardNativeElement.click();

        expect(testComponent.clickCount).toBe(1);
    });

    it('should not interact if readonly', () => {
        testComponent.readonly = true;
        fixture.detectChanges();

        cardNativeElement.click();

        expect(testComponent.clickCount).toBe(0);
    });

    it('should remove tabindex if readonly', () => {
        expect(cardNativeElement.getAttribute('tabIndex')).toBe('0');

        testComponent.readonly = true;
        fixture.detectChanges();
        expect(cardNativeElement.getAttribute('tabIndex')).toBe(null);
    });
});

@Component({
    selector: 'test-app',
    template: `
        <kbq-card
            [selected]="selected"
            [readonly]="readonly"
            (selectedChange)="increment()"
        />
    `
})
class TestApp {
    readonly = false;
    selected = false;

    clickCount: number = 0;

    increment() {
        this.clickCount++;
    }
}
