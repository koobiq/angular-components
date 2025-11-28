import { Component } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqIconModule } from './../icon/icon.module';
import { KbqNavbarItem, KbqNavbarModule } from './index';

const FONT_RENDER_TIMEOUT_MS = 10;

describe('KbqNavbar', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [KbqNavbarModule, KbqIconModule, TestApp]
        }).compileComponents();
    });

    xit('should be collapsed on init stage', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const collapsedElements = fixture.debugElement.queryAll(By.css('.kbq-navbar-item_collapsed'));

        expect(collapsedElements.length).toBeGreaterThan(0);
    }));

    it('collapsed elements should have title', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const items = fixture.debugElement.queryAll(By.css('kbq-navbar-item'));
        const collapsedElements = items.filter(
            (item) => item.nativeElement.querySelectorAll('.kbq-navbar-item_collapsed').length > 0
        );

        const hasTitle = collapsedElements.reduce((acc, el) => acc && el.nativeElement.hasAttribute('title'), true);

        expect(hasTitle).toBeTruthy();
    }));

    xit('collapsed elements should have specific title if defined', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const collapsedElements = fixture.debugElement.queryAll(By.css('.kbq-navbar-item_collapsed'));
        const elementWithCustomTitle = collapsedElements[collapsedElements.length - 1];

        expect(elementWithCustomTitle.componentInstance.titleText).toBe('Right icon');
    }));

    it('items should allow click if not disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        testComponent.counter = 0;

        fixture.detectChanges();

        const notDisabledItem = fixture.debugElement.query(By.css('.kbq-navbar-item:not(.kbq-disabled)'));

        notDisabledItem.nativeElement.click();

        fixture.detectChanges();

        expect(testComponent.counter).toBe(1);
    });

    it('items should not allow click if disable', () => {
        const fixture = TestBed.createComponent(TestApp);
        const testComponent = fixture.debugElement.componentInstance;

        fixture.detectChanges();

        const disabledItem = fixture.debugElement.query(By.css('.kbq-navbar-item[disabled]'));

        expect(testComponent.counter).toBe(0);

        disabledItem.nativeElement.click();
        fixture.detectChanges();

        expect(testComponent.counter).toBe(0);
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqNavbarModule, KbqIconModule],
    templateUrl: './navbar.component.html'
})
class TestApp {
    counter: number = 0;
    navbarContainerWidth: number = 915;

    onItemClick(disabledItem?: KbqNavbarItem) {
        if (disabledItem?.disabled) {
            return;
        }

        this.counter++;
    }
}
