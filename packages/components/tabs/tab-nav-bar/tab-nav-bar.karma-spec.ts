import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqTabLink, KbqTabNav, KbqTabsModule } from '../index';

describe('KbqTabNavBar', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [KbqTabsModule],
            declarations: [SimpleTabNavBarTestApp]
        });

        TestBed.compileComponents();
    }));

    describe('basic behavior', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            fixture.detectChanges();
        });

        it('should make disabled links unclickable', () => {
            const tabLinkElement = fixture.debugElement.query(By.css('a')).nativeElement;

            expect(getComputedStyle(tabLinkElement).pointerEvents).not.toBe('none');

            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(getComputedStyle(tabLinkElement).pointerEvents).toBe('none');
        });
    });
});

@Component({
    selector: 'test-app',
    template: `
        <nav kbq-tab-nav-bar>
            <a
                *ngFor="let tab of tabs; let index = index"
                [active]="activeIndex === index"
                [disabled]="disabled"
                (click)="activeIndex = index"
                kbq-tab-link
            >
                Tab link {{ label }}
            </a>
        </nav>
    `
})
class SimpleTabNavBarTestApp {
    @ViewChild(KbqTabNav, { static: false }) tabNavBar: KbqTabNav;
    @ViewChildren(KbqTabLink) tabLinks: QueryList<KbqTabLink>;

    label = '';
    disabled = false;
    tabs = [0, 1, 2];

    activeIndex = 0;
}
