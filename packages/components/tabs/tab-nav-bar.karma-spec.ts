import { Component, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KbqTabLink, KbqTabNavBar } from './tab-nav-bar';
import { KbqTabsModule } from './tabs.module';

describe(KbqTabNavBar.name, () => {
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
        <nav kbqTabNavBar>
            @for (tab of tabs; track tab; let index = $index) {
                <a
                    [active]="activeIndex === index"
                    [disabled]="disabled"
                    (click)="activeIndex = index"
                    kbqTabLink
                >
                    Tab link {{ label }}
                </a>
            }
        </nav>
    `
})
class SimpleTabNavBarTestApp {
    @ViewChild(KbqTabNavBar, { static: false }) tabNavBar: KbqTabNavBar;
    @ViewChildren(KbqTabLink) tabLinks: QueryList<KbqTabLink>;

    label = '';
    disabled = false;
    tabs = [0, 1, 2];

    activeIndex = 0;
}
