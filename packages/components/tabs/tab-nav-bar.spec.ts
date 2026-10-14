import { Direction, Directionality } from '@angular/cdk/bidi';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { KBQ_ANIMATIONS_CONFIG } from '@koobiq/components/core';
import { KBQ_SCROLLBAR_OPTIONS, KbqScrollbarViewport } from '@koobiq/components/scrollbar';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';
import { KbqTabLink, KbqTabNavBar } from './tab-nav-bar';
import { KbqTabsModule } from './tabs.module';

/** Must match `SCROLL_CD_THROTTLE` in `paginated-tab-header.ts` — the audit window before a
 *  native `scroll` event's effect on arrow state is reflected via change detection. */
const SCROLL_CD_THROTTLE = 48;

describe(KbqTabNavBar.name, () => {
    const dir: Direction = 'ltr';
    let dirChange: Subject<Direction>;

    beforeEach(() => {
        dirChange = new Subject();
        TestBed.configureTestingModule({
            imports: [
                KbqTabsModule,
                SimpleTabNavBarTestApp,
                TabLinkWithTabIndexBinding,
                TabLinkWithIdBinding,
                TabNavBarWithPanel,
                TabNavBarWithDisablePagination
            ],
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

            expect(tabLinkElements.every((tabLinkEl) => !tabLinkEl.classList.contains('kbq-disabled'))).toBe(true);

            component.disabled = true;
            fixture.detectChanges();

            // The class, not a `disabled` attribute: this directive sits on an `<a>`, where that
            // attribute is neither valid HTML nor read by any assistive technology.
            expect(tabLinkElements.every((tabLinkEl) => tabLinkEl.classList.contains('kbq-disabled'))).toBe(true);
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

    it('should fall back to the generated id when the bound id turns undefined', () => {
        const fixture = TestBed.createComponent(TabLinkWithIdBinding);
        const component = fixture.componentInstance;

        fixture.detectChanges();

        const tabLink: HTMLElement = fixture.debugElement.query(By.directive(KbqTabLink)).nativeElement;
        const generatedId = tabLink.id;

        expect(generatedId).toMatch(/^kbq-tab-link-\d+$/);

        component.id = 'custom-link';
        fixture.detectChanges();

        expect(tabLink.id).toBe('custom-link');

        component.id = undefined;
        fixture.detectChanges();

        expect(tabLink.id).toBe(generatedId);
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

        const links = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('a'));

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            fixture.detectChanges();
        });

        it('should stay a plain navigation with no tab semantics', () => {
            const navBar: HTMLElement = fixture.nativeElement.querySelector('nav');

            expect(navBar.hasAttribute('role')).toBe(false);
            expect(navBar.hasAttribute('aria-orientation')).toBe(false);
            expect(links().every((link) => !link.hasAttribute('role'))).toBe(true);
            expect(links().every((link) => !link.hasAttribute('aria-selected'))).toBe(true);
        });

        it('should mark a disabled link with aria-disabled and no disabled attribute', () => {
            fixture.componentInstance.disabled = true;
            fixture.detectChanges();

            expect(links().some((link) => link.hasAttribute('disabled'))).toBe(false);
            expect(links().every((link) => link.getAttribute('aria-disabled') === 'true')).toBe(true);
        });

        it('should mark the active link with aria-current instead', () => {
            expect(links().map((link) => link.getAttribute('aria-current'))).toEqual(['page', null, null]);
        });
    });

    describe('vertical', () => {
        const scrollbarMode = (fixture: ComponentFixture<unknown>) =>
            fixture.debugElement.query(By.directive(KbqScrollbarViewport)).injector.get(KbqScrollbarViewport).mode();

        it('should give the strip of a nav bar created vertical the configured scrollbar, and drop it with vertical', () => {
            const fixture = TestBed.createComponent(TabNavBarWithPanel);

            fixture.componentInstance.vertical = true;
            fixture.detectChanges();

            expect(scrollbarMode(fixture)).toBe(TestBed.inject(KBQ_SCROLLBAR_OPTIONS).mode);

            fixture.componentInstance.vertical = false;
            fixture.detectChanges();

            expect(scrollbarMode(fixture)).toBe('hidden');
        });
    });

    describe('disablePagination', () => {
        it('should re-evaluate pagination when disablePagination alone changes', () => {
            const fixture = TestBed.createComponent(TabNavBarWithDisablePagination);

            fixture.detectChanges();

            const navBar = fixture.debugElement.query(By.directive(KbqTabNavBar)).componentInstance as KbqTabNavBar;
            const updatePagination = vi.spyOn(navBar, 'updatePagination');

            // Neither the orientation nor the link count changes here.
            fixture.componentInstance.disablePagination = true;
            fixture.detectChanges();

            expect(updatePagination).toHaveBeenCalled();
        });
    });

    describe('focus restoration', () => {
        it('should move focus to the neighbouring link, not the active one, when the focused link is removed', () => {
            const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);

            fixture.detectChanges();

            const links = (): HTMLElement[] => Array.from(fixture.nativeElement.querySelectorAll('a'));

            // Link 0 is the active one; focus sits on the last link instead.
            links()[2].focus();
            fixture.detectChanges();

            fixture.componentInstance.tabs = [0, 1];
            fixture.detectChanges();

            // `updateActiveLink()` runs on the same `items.changes` tick and moves the key manager to the
            // active link, so restoration has to remember where focus actually was.
            expect(document.activeElement).toBe(links()[1]);
        });
    });

    describe('arrow dimming', () => {
        let fixture: ComponentFixture<SimpleTabNavBarTestApp>;
        let navBar: KbqTabNavBar;

        beforeEach(() => {
            fixture = TestBed.createComponent(SimpleTabNavBarTestApp);
            fixture.detectChanges();
            navBar = fixture.debugElement.query(By.directive(KbqTabNavBar)).componentInstance;

            Object.defineProperty(navBar.tabListContainer.nativeElement, 'scrollWidth', {
                configurable: true,
                value: 400
            });
            Object.defineProperty(navBar.tabListContainer.nativeElement, 'clientWidth', {
                configurable: true,
                value: 100
            });
            navBar.updatePagination();
            fixture.detectChanges();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should dim the previous/next arrows at each scroll bound without removing them', async () => {
            vi.useFakeTimers();

            const before = fixture.nativeElement.querySelector('.kbq-tab-header__pagination_before');
            const after = fixture.nativeElement.querySelector('.kbq-tab-header__pagination_after');

            expect(before.classList.contains('kbq-disabled')).toBe(true);
            expect(after.classList.contains('kbq-disabled')).toBe(false);

            // scrollWidth(400) - clientWidth(100) = 300, i.e. the max scrollLeft a real browser would allow.
            navBar.tabListContainer.nativeElement.scrollLeft = 300;
            navBar.tabListContainer.nativeElement.dispatchEvent(new Event('scroll'));

            // `KbqTabNavBar` is OnPush — arrow state from a native scroll event is only reflected
            // once the audited change-detection tick fires.
            await vi.advanceTimersByTimeAsync(SCROLL_CD_THROTTLE);
            fixture.detectChanges();

            expect(before.classList.contains('kbq-disabled')).toBe(false);
            expect(after.classList.contains('kbq-disabled')).toBe(true);
        });
    });

    describe('underline motion', () => {
        const underlineOf = (fixture: ComponentFixture<SimpleTabNavBarTestApp>): HTMLElement =>
            fixture.nativeElement.querySelector('.kbq-tab-list__active-tab-underline');

        it('should move the underline with motion by default', () => {
            const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);

            fixture.detectChanges();

            expect(underlineOf(fixture).classList).not.toContain('kbq-animations-disabled');
        });

        it('should move the underline without motion when animations are disabled', () => {
            TestBed.configureTestingModule({
                providers: [{ provide: KBQ_ANIMATIONS_CONFIG, useValue: { animationsDisabled: true } }]
            });

            const fixture = TestBed.createComponent(SimpleTabNavBarTestApp);

            fixture.detectChanges();

            expect(underlineOf(fixture).classList).toContain('kbq-animations-disabled');
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

        it('should move the underline to an index assigned in code', async () => {
            const underline: HTMLElement = fixture.nativeElement.querySelector('.kbq-tab-list__active-tab-underline');

            Object.defineProperty(navBar.items.get(1)!.elementRef.nativeElement, 'offsetLeft', {
                configurable: true,
                value: 100
            });

            navBar.selectedIndex = 1;
            await fixture.whenStable();

            expect(underline.style.left).toBe('112px');
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
        <nav kbqTabNavBar>
            <a kbqTabLink [id]="id">Id Link</a>
        </nav>
    `
})
class TabLinkWithIdBinding {
    id: string | undefined;
}

@Component({
    imports: [KbqTabsModule],
    template: `
        <nav kbqTabNavBar [disablePagination]="disablePagination">
            <a kbqTabLink [active]="true">One</a>
            <a kbqTabLink>Two</a>
        </nav>
    `
})
class TabNavBarWithDisablePagination {
    disablePagination = false;
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
