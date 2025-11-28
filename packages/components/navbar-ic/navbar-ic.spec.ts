import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqIconModule } from './../icon/icon.module';
import { KbqNavbarIcItem, KbqNavbarIcModule } from './index';

const FONT_RENDER_TIMEOUT_MS = 10;

describe('KbqNavbarIc', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqNavbarIcModule, KbqIconModule, NoopAnimationsModule, TestApp]
        }).compileComponents();
    });

    it('should be expanded on init stage', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const collapsedElements = fixture.debugElement.queryAll(By.css('.kbq-expanded'));

        expect(collapsedElements.length).toBeGreaterThan(0);
    }));

    it('items should allow click if not disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        testComponent.counter = 0;

        fixture.detectChanges();

        const notDisabledItem = fixture.debugElement.query(By.css('.kbq-navbar-ic-item:not(.kbq-disabled)'));

        notDisabledItem.nativeElement.click();

        fixture.detectChanges();

        expect(testComponent.counter).toBe(1);
    });

    it('items should not allow click if disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        fixture.detectChanges();

        const disabledItem = fixture.debugElement.query(By.css('.kbq-navbar-ic-item[disabled]'));

        expect(testComponent.counter).toBe(0);

        disabledItem.nativeElement.click();
        fixture.detectChanges();

        expect(testComponent.counter).toBe(0);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqNavbarIcModule, KbqIconModule],
    templateUrl: './navbar-ic.spec.html'
})
class TestApp {
    counter: number = 0;
    navbarContainerWidth: number = 915;

    onItemClick(disabledItem?: KbqNavbarIcItem) {
        if (disabledItem?.disabled) {
            return;
        }

        this.counter++;
    }
}
