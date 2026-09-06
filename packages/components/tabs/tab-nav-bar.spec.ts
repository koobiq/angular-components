import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';
import { KbqTabLink, KbqTabNavBar } from './tab-nav-bar';
import { KbqTabsModule } from './tabs.module';

describe(KbqTabNavBar.name, () => {
    const dir: Direction = 'ltr';
    let dirChange: Subject<Direction>;

    beforeEach(() => {
        dirChange = new Subject();
        TestBed.configureTestingModule({
            imports: [KbqTabsModule, SimpleTabNavBarTestApp, TabLinkWithTabIndexBinding, TabNavBarWithPanel],
            providers: [
                {
                    provide: Directionality,
                    useFactory: () => ({
                        value: dir,
                        change: dirChange.asObservable()
                    })
                }
            ]
        }).compileComponents();
    });

    describe('basic behavior', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;
        let component: SimpleTabNavBarTestApp;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });

        it('should change active index on click', () => {
            let tabLink = fixture.debugElement.queryAll(By.css('a'))[1];

            tabLink.nativeElement.click();
            expect(component.activeIndex).toBe(1);

            tabLink = fixture.debugElement.queryAll(By.css('a'))[2];
            tabLink.nativeElement.click();
            expect(component.activeIndex).toBe(2);
        });

        it('should add the active class if active', () => {
            const tabLink1 = fixture.debugElement.queryAll(By.css('a'))[0];
            const tabLink2 = fixture.debugElement.queryAll(By.css('a'))[1];
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            tabLink1.nativeElement.click();
            fixture.detectChanges();
            expect(tabLinkElements[0].classList.contains('kbq-selected')).toBeTruthy();
            expect(tabLinkElements[1].classList.contains('kbq-selected')).toBeFalsy();

            tabLink2.nativeElement.click();
            fixture.detectChanges();
            expect(tabLinkElements[0].classList.contains('kbq-selected')).toBeFalsy();
            expect(tabLinkElements[1].classList.contains('kbq-selected')).toBeTruthy();
        });

        it('should add the disabled class if disabled', () => {
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            expect(tabLinkElements.every((tabLinkEl) => !tabLinkEl.hasAttribute('disabled'))).toBe(true);

            component.disabled = true;
            fixture.detectChanges();

            expect(tabLinkElements.every((tabLinkEl) => tabLinkEl.hasAttribute('disabled'))).toBe(true);
        });

        it('should update the tabindex if links are disabled', () => {
            const tabLinkElements = fixture.debugElement
                .queryAll(By.css('a'))
                .map((tabLinkDebugEl) => tabLinkDebugEl.nativeElement);

            expect(tabLinkElements.every((tabLink) => tabLink.tabIndex === 0)).toBe(true);

            component.disabled = true;
            fixture.detectChanges();

            expect(tabLinkElements.every((tabLink) => tabLink.tabIndex === -1)).toBe(true);
        });
    });

    it('should support binding to the tabIndex', () => {
        const fixture = TestBed.createComponent(TabLinkWithTabIndexBinding);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        const tabLink = fixture.debugElement.query(By.directive(KbqTabLink)).injector.get<KbqTabLink>(KbqTabLink);

        expect(tabLink.tabIndex).toBe(0);

        component.tabIndex = 3;
        fixture.detectChanges();

        expect(tabLink.tabIndex).toBe(3);
    });

    describe('with [tabNavPanel]', () => {
        let fixture: ComponentFixture<TabNavBarWithPanel>;

        const navBar = (): HTMLElement => fixture.nativeElement.querySelector('nav');
        const links = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('a'));
        const panel = (): HTMLElement => fixture.nativeElement.querySelector('.kbq-tab-nav-panel');

        beforeEach(() => {
            fixture = TestBed.createComponent(TabNavBarWithPanel);
            fixture.detectChanges();
        });

        it('should turn the nav bar into a tablist and the links into tabs', () => {
            expect(navBar().getAttribute('role')).toBe('tablist');
            expect(links().map((link) => link.getAttribute('role'))).toEqual(['tab', 'tab', 'tab']);
            expect(panel().getAttribute('role')).toBe('tabpanel');
        });

        it('should mark only the active link as selected', () => {
            expect(links().map((link) => link.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false']);

            fixture.componentInstance.activeIndex = 2;
            fixture.detectChanges();

            expect(links().map((link) => link.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true']);
        });

        it('should point aria-controls of every link at the panel id', () => {
            const panelId = panel().getAttribute('id');

            expect(panelId).toBeTruthy();
            expect(links().every((link) => link.getAttribute('aria-controls') === panelId)).toBe(true);
        });

        it('should point aria-labelledby of the panel at the active link id', () => {
            expect(panel().getAttribute('aria-labelledby')).toBe(links()[0].getAttribute('id'));

            fixture.componentInstance.activeIndex = 1;
            fixture.detectChanges();

            expect(panel().getAttribute('aria-labelledby')).toBe(links()[1].getAttribute('id'));
        });

        it('should give a tab stop to the active link only, unlike the panel-less nav bar', () => {
            expect(links().map((link) => link.tabIndex)).toEqual([0, -1, -1]);

            fixture.componentInstance.activeIndex = 1;
            fixture.detectChanges();

            expect(links().map((link) => link.tabIndex)).toEqual([-1, 0, -1]);
        });

        it('should drop the tab stop of an active link that becomes disabled', () => {
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(links().map((link) => link.tabIndex)).toEqual([-1, -1, -1]);
        });

        it('should not emit aria-current, which is for navigation rather than tabs', () => {
            expect(links().every((link) => !link.hasAttribute('aria-current'))).toBe(true);
        });

        it('should announce a vertical orientation and nothing when horizontal', () => {
            expect(navBar().hasAttribute('aria-orientation')).toBe(false);

            fixture.componentInstance.vertical = true;
            fixture.detectChanges();

            expect(navBar().getAttribute('aria-orientation')).toBe('vertical');
        });

        it('should follow the vertical binding with the layout class', () => {
            expect(navBar().classList.contains('kbq-tab-group_vertical')).toBe(false);

            fixture.componentInstance.vertical = true;
            fixture.detectChanges();

            expect(navBar().classList.contains('kbq-tab-group_vertical')).toBe(true);
        });

        it('should have no axe violations', async () => {
            expect(await axe(fixture.nativeElement)).toHaveNoViolations();
        });
    });

    describe('without [tabNavPanel]', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            fixture.detectChanges();
        });

        it('should stay a plain navigation with no tab semantics', () => {
            const navBar: HTMLElement = fixture.nativeElement.querySelector('nav');
            const links: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));

            expect(navBar.hasAttribute('role')).toBe(false);
            expect(navBar.hasAttribute('aria-orientation')).toBe(false);
            expect(links.every((link) => !link.hasAttribute('role'))).toBe(true);
            expect(links.every((link) => !link.hasAttribute('aria-selected'))).toBe(true);
        });

        it('should mark the active link with aria-current instead', () => {
            const links: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));

            expect(links.map((link) => link.getAttribute('aria-current'))).toEqual(['page', null, null]);
        });
    });

    describe('activeTabOffset', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;
        let navBar: KbqTabNavBar;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            fixture.detectChanges();
            navBar = fixture.debugElement.query(By.directive(KbqTabNavBar)).componentInstance;
        });

        describe('activeTabOffsetWidth', () => {
            it('subtracts TAB_PADDING * 2 from offsetWidth', () => {
                const item = navBar.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetWidth', { configurable: true, value: 120 });

                expect((navBar as any).activeTabOffsetWidth).toBe(96);
            });

            it('returns undefined when no item at selectedIndex', () => {
                (navBar as any).selectedIndex = 99;

                expect((navBar as any).activeTabOffsetWidth).toBeUndefined();
            });
        });

        describe('activeTabOffsetLeft', () => {
            it('adds TAB_PADDING to offsetLeft', () => {
                const item = navBar.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: 100 });

                expect((navBar as any).activeTabOffsetLeft).toBe(112);
            });

            it('handles negative offsetLeft for the first tab shifted by negative margin-inline-start', () => {
                const item = navBar.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: -12 });

                expect((navBar as any).activeTabOffsetLeft).toBe(0);
            });

            it('treats offsetLeft === 0 as a valid position and still adds TAB_PADDING', () => {
                const item = navBar.items.get(0)!;

                Object.defineProperty(item.elementRef.nativeElement, 'offsetLeft', { configurable: true, value: 0 });

                expect((navBar as any).activeTabOffsetLeft).toBe(12);
            });

            it('returns undefined when no item at selectedIndex', () => {
                (navBar as any).selectedIndex = 99;

                expect((navBar as any).activeTabOffsetLeft).toBeUndefined();
            });
        });
    });
});

@Component({
    selector: 'test-app',
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar>
            @for (tab of tabs; track tab) {
                <a kbqTabLink [active]="activeIndex === $index" [disabled]="disabled" (click)="activeIndex = $index">
                    Tab link
                </a>
            }
        </nav>
    `
})
class SimpleTabNavBarTestApp {
    disabled = false;
    tabs = [0, 1, 2];
    activeIndex = 0;
}

@Component({
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar>
            <a kbqTabLink [tabIndex]="tabIndex">TabIndex Link</a>
        </nav>
    `
})
class TabLinkWithTabIndexBinding {
    tabIndex = 0;
}

@Component({
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar [tabNavPanel]="tabNavPanel" [vertical]="vertical">
            @for (tab of tabs; track tab) {
                <a kbqTabLink [active]="activeIndex === $index" [disabled]="disabled" (click)="activeIndex = $index">
                    Tab link
                </a>
            }
        </nav>
        <div #tabNavPanel="kbqTabNavPanel" kbqTabNavPanel>Panel content</div>
    `
})
class TabNavBarWithPanel {
    disabled = false;
    vertical = false;
    tabs = [0, 1, 2];
    activeIndex = 0;
}
