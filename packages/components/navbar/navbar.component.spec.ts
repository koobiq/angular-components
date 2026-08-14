import { FocusMonitor } from '@angular/cdk/a11y';
import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, DebugElement } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { KbqButtonModule } from '@koobiq/components/button';
import {
    dispatchKeyboardEvent,
    ENTER,
    enUSLocaleData,
    KBQ_LOCALE_SERVICE,
    KbqLocaleService,
    LEFT_ARROW,
    NUMPAD_DIVIDE,
    RIGHT_ARROW,
    ruRULocaleData,
    SLASH,
    SPACE,
    TAB
} from '@koobiq/components/core';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';
import { Observable, Subject } from 'rxjs';
import { KbqIconModule } from './../icon/icon.module';
import {
    KBQ_VERTICAL_NAVBAR_CONFIGURATION,
    KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION,
    KbqNavbar,
    KbqNavbarBrand,
    KbqNavbarContainer,
    KbqNavbarDivider,
    KbqNavbarFocusableItem,
    KbqNavbarItem,
    KbqNavbarModule,
    KbqNavbarRectangleElement,
    KbqNavbarTitle,
    KbqNavbarToggle,
    KbqVerticalNavbar,
    kbqVerticalNavbarLocaleConfigurationProvider
} from './index';

const LONG_TITLE_CLASS = 'kbq-navbar-brand_long-title';

/** Matches `KbqNavbarBrand`'s own debounce window. */
const LONG_TITLE_DEBOUNCE_MS = 100;

/** Matches `KbqNavbar`'s own resize debounce window. */
const RESIZE_DEBOUNCE_MS = 100;

/** `dispatchKeyboardEvent` cannot carry modifiers, and the shortcut is defined by `Ctrl` plus the key code. */
const dispatchGlobalShortcut = (keyCode: number): void => {
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ctrlKey: true });

    Object.defineProperty(event, 'keyCode', { get: () => keyCode });

    window.dispatchEvent(event);
};

/**
 * jsdom performs no layout, so every geometry property reads as 0. These stubs stand in for the browser's
 * answer to "does the text fit?". Defined as getters so a test can observe *when* they are read.
 */
const setTextMetrics = (
    el: HTMLElement,
    metrics: Partial<Record<'scrollWidth' | 'clientWidth' | 'scrollHeight' | 'clientHeight', number>>
): void => {
    Object.entries(metrics).forEach(([key, value]) => {
        Object.defineProperty(el, key, { configurable: true, get: () => value });
    });
};

/** Minimal `SharedResizeObserver` stand-in: the real one never emits in jsdom (ResizeObserver is a no-op stub). */
class MockNavbarBrandResizeObserver {
    private readonly subjects = new Map<Element, Subject<ResizeObserverEntry[]>>();

    observe(target: Element): Observable<ResizeObserverEntry[]> {
        let subject = this.subjects.get(target);

        if (!subject) {
            subject = new Subject<ResizeObserverEntry[]>();
            this.subjects.set(target, subject);
        }

        return subject.asObservable();
    }

    emit(target: Element): void {
        this.subjects.get(target)?.next([]);
    }
}

describe('KbqNavbar', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                KbqNavbarModule,
                KbqIconModule,
                TestApp,
                TestItemApp,
                TestTitleApp,
                TestVerticalApp,
                TestBrandApp,
                TestBrandLongTitleApp,
                TestBrandHorizontalApp,
                TestNonAnchorBrandApp,
                TestTwoVerticalNavbarsApp,
                TestExternalConfigApp,
                TestCollapseApp
            ]
        }).compileComponents();
    });

    it('collapsed elements should have title', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        flush();
        fixture.detectChanges();

        const collapsableItems = fixture.debugElement
            .queryAll(By.directive(KbqNavbarItem))
            .map((item) => item.componentInstance as KbqNavbarItem)
            .filter((item) => item.title() && item.collapsable());

        collapsableItems.forEach((item) => (item.collapsed = true));

        fixture.detectChanges();

        const collapsedItems = collapsableItems.filter((item) => item.isCollapsed());

        expect(collapsedItems.length).toBeGreaterThan(0);
        expect(collapsedItems.every((item) => !!item.titleText && item.tooltip.content === item.titleText)).toBe(true);
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

        const disabledItem = fixture.debugElement.query(By.css('.kbq-navbar-item.kbq-disabled'));

        expect(testComponent.counter).toBe(0);

        disabledItem.nativeElement.click();
        fixture.detectChanges();

        expect(testComponent.counter).toBe(0);
    });

    describe('KbqNavbarContainer', () => {
        it('should have kbq-navbar-container class on host element', () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            const container = fixture.debugElement.query(By.directive(KbqNavbarContainer));

            expect(container.nativeElement.classList).toContain('kbq-navbar-container');
        });
    });

    describe('KbqNavbar host', () => {
        it('should have kbq-navbar class', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar));

            expect(navbar.nativeElement.classList).toContain('kbq-navbar');
        }));

        it('tabIndex should be 0 by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar));

            expect(navbar.nativeElement.getAttribute('tabindex')).toBe('0');
        }));

        it('TAB key should set tabIndex to -1 and restore it after setTimeout', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;

            dispatchKeyboardEvent(navbarDebugEl.nativeElement, 'keydown', TAB, navbarDebugEl.nativeElement);
            fixture.detectChanges();

            expect(navbarInstance.tabIndex()).toBe(-1);

            tick();
            fixture.detectChanges();

            expect(navbarInstance.tabIndex()).toBe(0);
        }));

        it('RIGHT_ARROW key should pass event to keyManager', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;
            const spy = jest.spyOn(navbarInstance.keyManager, 'onKeydown');

            dispatchKeyboardEvent(navbarDebugEl.nativeElement, 'keydown', RIGHT_ARROW, navbarDebugEl.nativeElement);

            expect(spy).toHaveBeenCalled();
        }));

        it('LEFT_ARROW key should pass event to keyManager', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;
            const spy = jest.spyOn(navbarInstance.keyManager, 'onKeydown');

            dispatchKeyboardEvent(navbarDebugEl.nativeElement, 'keydown', LEFT_ARROW, navbarDebugEl.nativeElement);

            expect(spy).toHaveBeenCalled();
        }));
    });

    describe('KbqNavbarItem', () => {
        it('should have kbq-navbar-item_with-title class when title is present', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const itemWithTitle = fixture.debugElement.query(By.css('kbq-navbar-item.kbq-navbar-item_with-title'));

            expect(itemWithTitle).toBeTruthy();
        }));

        it('should not have kbq-navbar-item_with-title class for icon-only item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const iconOnlyItem = fixture.debugElement.query(By.css('kbq-navbar-item:not(.kbq-navbar-item_with-title)'));

            expect(iconOnlyItem).toBeTruthy();
        }));

        it('collapsedText input should override titleText', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.collapsedText = 'Custom Tooltip';
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            expect(item.titleText).toBe('Custom Tooltip');
        }));

        it('collapsable should be true by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            expect(item.collapsable()).toBe(true);
        }));

        it('a non-collapsable item keeps its title when the navbar runs out of room', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.componentInstance.collapsable = false;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar)).componentInstance as KbqNavbar;
            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            // Far more content than room: every collapsable item would be collapsed.
            stubNavbarWidths(fixture.debugElement, { navbar: 100, item: 400 });

            navbar.updateExpandedStateForItems();
            fixture.detectChanges();

            expect(item.isCollapsed()).toBe(false);
        }));

        it('should not have kbq-navbar-item_collapsed class by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const itemDebugEl = fixture.debugElement.query(By.directive(KbqNavbarItem));

            expect(itemDebugEl.nativeElement.classList).not.toContain('kbq-navbar-item_collapsed');
        }));

        it('should toggle kbq-navbar-item_collapsed class when collapsed changes', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const itemDebugEl = fixture.debugElement.query(By.directive(KbqNavbarItem));
            const item = itemDebugEl.componentInstance as KbqNavbarItem;

            item.collapsed = true;
            fixture.detectChanges();

            expect(itemDebugEl.nativeElement.classList).toContain('kbq-navbar-item_collapsed');

            item.collapsed = false;
            fixture.detectChanges();

            expect(itemDebugEl.nativeElement.classList).not.toContain('kbq-navbar-item_collapsed');
        }));

        it('kbqTooltipDisabled should win over the automatic suppression', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.componentInstance.tooltipDisabled = false;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            // Expanded and not clipped: the item would suppress its own tooltip without the explicit input.
            expect(item.isCollapsed()).toBe(false);
            expect(item.tooltip.disabled).toBe(false);
        }));

        it('should enable the tooltip only while the title cannot be read from the item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            expect(item.tooltip.disabled).toBe(true);

            item.collapsed = true;
            fixture.detectChanges();

            expect(item.tooltip.disabled).toBe(false);
        }));
    });

    describe('KbqNavbarBrand', () => {
        it('collapsedText input should override inner kbq-navbar-title in titleText', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            fixture.componentInstance.collapsedText = 'Custom Tooltip';
            fixture.detectChanges();

            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            expect(brand.titleText).toBe('Custom Tooltip');
        }));

        it('titleText should fall back to inner kbq-navbar-title text when collapsedText is empty', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            expect(brand.titleText).toBe('App Name');
        }));

        it('tooltip content should update reactively when collapsedText changes while collapsed', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.componentInstance.collapsedText = 'First';
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            expect(brand.collapsed()).toBe(true);
            expect(brand.tooltip.content).toBe('First');

            fixture.componentInstance.collapsedText = 'Updated';
            fixture.detectChanges();

            expect(brand.tooltip.content).toBe('Updated');
        }));

        it('isLink should be true for an anchor brand and false otherwise', fakeAsync(() => {
            const anchorFixture = TestBed.createComponent(TestBrandApp);

            anchorFixture.detectChanges();
            flush();

            const anchorBrand = anchorFixture.debugElement.query(By.directive(KbqNavbarBrand))
                .componentInstance as KbqNavbarBrand;

            expect(anchorBrand.isLink).toBe(true);

            const divFixture = TestBed.createComponent(TestNonAnchorBrandApp);

            divFixture.detectChanges();
            flush();

            const divBrand = divFixture.debugElement.query(By.directive(KbqNavbarBrand))
                .componentInstance as KbqNavbarBrand;

            expect(divBrand.isLink).toBe(false);
        }));

        it('should apply kbq-navbar-brand_link only to an anchor brand', fakeAsync(() => {
            const anchorFixture = TestBed.createComponent(TestBrandApp);

            anchorFixture.detectChanges();
            flush();

            expect(anchorFixture.nativeElement.querySelector('.kbq-navbar-brand').classList).toContain(
                'kbq-navbar-brand_link'
            );

            const divFixture = TestBed.createComponent(TestNonAnchorBrandApp);

            divFixture.detectChanges();
            flush();

            expect(divFixture.nativeElement.querySelector('.kbq-navbar-brand').classList).not.toContain(
                'kbq-navbar-brand_link'
            );
        }));

        it('an anchor brand stays in the roving focus order', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.detectChanges();
            flush();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarBrand))
                .injector.get(KbqNavbarFocusableItem);

            expect(focusableItem.disabled).toBe(false);
        }));

        /**
         * The brand used to be disabled purely on `tagName !== 'A'`, which took a `<div kbq-navbar-brand>`
         * hosting a real button out of the roving focus order and announced it as disabled.
         */
        it('a non-anchor brand wrapping interactive content stays in the roving focus order', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestNonAnchorBrandApp);

            fixture.componentInstance.withButton = true;
            fixture.detectChanges();
            flush();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarBrand))
                .injector.get(KbqNavbarFocusableItem);

            expect(focusableItem.disabled).toBe(false);
        }));

        it('a purely decorative non-anchor brand is kept out of the roving focus order', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestNonAnchorBrandApp);

            fixture.detectChanges();
            flush();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarBrand))
                .injector.get(KbqNavbarFocusableItem);

            expect(focusableItem.disabled).toBe(true);
        }));
    });

    describe('KbqNavbarBrand automatic long title', () => {
        let resizeObserver: MockNavbarBrandResizeObserver;
        let contentObserverSubject: Subject<MutationRecord[]>;

        beforeEach(() => {
            resizeObserver = new MockNavbarBrandResizeObserver();
            contentObserverSubject = new Subject<MutationRecord[]>();

            TestBed.overrideProvider(SharedResizeObserver, { useValue: resizeObserver });
            // Driven manually: jsdom delivers MutationObserver records outside the fakeAsync queue.
            TestBed.overrideProvider(ContentObserver, {
                useValue: { observe: () => contentObserverSubject.asObservable() }
            });
        });

        /** Stubs the title's geometry before the first render, so the initial measurement already sees it. */
        const render = (
            metrics: Parameters<typeof setTextMetrics>[1],
            setup?: (instance: TestBrandLongTitleApp) => void
        ) => {
            const fixture = TestBed.createComponent(TestBrandLongTitleApp);

            setup?.(fixture.componentInstance);

            const titleEl = fixture.nativeElement.querySelector('.kbq-navbar-title') as HTMLElement;

            setTextMetrics(titleEl, metrics);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brandEl = fixture.nativeElement.querySelector('.kbq-navbar-brand') as HTMLElement;

            return { fixture, brandEl, titleEl };
        };

        it('should apply the long title class when the title does not fit into one line', fakeAsync(() => {
            const { brandEl } = render({ scrollWidth: 300, clientWidth: 176 });

            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);
        }));

        it('should not apply the long title class when the title fits into one line', fakeAsync(() => {
            const { brandEl } = render({ scrollWidth: 120, clientWidth: 176 });

            expect(brandEl.classList).not.toContain(LONG_TITLE_CLASS);
        }));

        it('longTitle=true should force the mode on for a title that fits', fakeAsync(() => {
            const { brandEl } = render(
                { scrollWidth: 120, clientWidth: 176 },
                (instance) => (instance.longTitle = true)
            );

            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);
        }));

        it('longTitle=false should force the mode off for a title that does not fit', fakeAsync(() => {
            const { brandEl } = render(
                { scrollWidth: 300, clientWidth: 176 },
                (instance) => (instance.longTitle = false)
            );

            expect(brandEl.classList).not.toContain(LONG_TITLE_CLASS);
        }));

        /**
         * The load-bearing invariant: the mode changes the font, so measuring in the applied state would feed
         * the result back into its own input and the mode would toggle forever. Every measurement must
         * therefore read the reference state, with the class removed - and must put it back.
         */
        it('should always measure with the long title class removed, and restore it afterwards', fakeAsync(() => {
            const classWhenMeasured: boolean[] = [];
            const fixture = TestBed.createComponent(TestBrandLongTitleApp);
            const titleEl = fixture.nativeElement.querySelector('.kbq-navbar-title') as HTMLElement;
            const brandEl = fixture.nativeElement.querySelector('.kbq-navbar-brand') as HTMLElement;
            let brandWidth = 240;

            setTextMetrics(titleEl, { clientWidth: 176 });
            Object.defineProperty(brandEl, 'clientWidth', { configurable: true, get: () => brandWidth });
            Object.defineProperty(titleEl, 'scrollWidth', {
                configurable: true,
                get: () => {
                    classWhenMeasured.push(brandEl.classList.contains(LONG_TITLE_CLASS));

                    return 300;
                }
            });

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);

            // Re-measure while the class is applied. A changed width is required to get past distinctUntilChanged.
            // Only the dedicated measurement in `measureNeedsLongTitle()` needs to read the unbiased
            // (class-removed) state, and it always runs first inside `updateAutoLongTitle()` - before the
            // tooltip-content refresh, which correctly reads the settled (class-applied) state afterwards.
            classWhenMeasured.length = 0;
            brandWidth = 300;
            resizeObserver.emit(brandEl);
            tick(LONG_TITLE_DEBOUNCE_MS);
            fixture.detectChanges();

            expect(classWhenMeasured[0]).toBe(false);
            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);
        }));

        it('should re-measure when the title text changes', fakeAsync(() => {
            const { fixture, brandEl, titleEl } = render({ scrollWidth: 120, clientWidth: 176 });

            expect(brandEl.classList).not.toContain(LONG_TITLE_CLASS);

            // The navbar has a fixed width, so a longer title resizes nothing - only the content observer
            // can notice it.
            setTextMetrics(titleEl, { scrollWidth: 300, clientWidth: 176 });
            fixture.componentInstance.titleText = 'A considerably longer application name';
            fixture.detectChanges();
            contentObserverSubject.next([]);
            tick(LONG_TITLE_DEBOUNCE_MS);
            fixture.detectChanges();

            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);
        }));

        /** The brand wraps its title in a horizontal navbar too, where the title is capped at 154px. */
        it('should apply the long title class in a horizontal navbar', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandHorizontalApp);
            const titleEl = fixture.nativeElement.querySelector('.kbq-navbar-title') as HTMLElement;

            setTextMetrics(titleEl, { scrollWidth: 300, clientWidth: 154 });

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brandEl = fixture.nativeElement.querySelector('.kbq-navbar-brand') as HTMLElement;

            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);
        }));

        it('should not apply the long title class in a horizontal navbar when the title fits', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandHorizontalApp);
            const titleEl = fixture.nativeElement.querySelector('.kbq-navbar-title') as HTMLElement;

            setTextMetrics(titleEl, { scrollWidth: 120, clientWidth: 154 });

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brandEl = fixture.nativeElement.querySelector('.kbq-navbar-brand') as HTMLElement;

            expect(brandEl.classList).not.toContain(LONG_TITLE_CLASS);
        }));

        it('hasCroppedText should be true for a title clamped vertically to two lines', fakeAsync(() => {
            // Wrapped text never exceeds its width, so only the height reveals the clamp.
            const { fixture } = render({ scrollWidth: 176, clientWidth: 176, scrollHeight: 60, clientHeight: 40 });
            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            expect(brand.hasCroppedText).toBe(true);
        }));

        /**
         * A collapsed title is `display: none`, so it cannot be measured until the navbar expands - which makes
         * the first expand the only chance to get the presentation right before the user sees it. Routing that
         * event through the debounce paints the default 18px single line for the whole window and only then
         * snaps to the compact two-line one, which reads as a flicker (#DS-4477).
         *
         * Hence the deliberate absence of `tick(LONG_TITLE_DEBOUNCE_MS)` before the assertion.
         */
        it('should apply the long title class on the first expand without waiting out the debounce', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandLongTitleApp);

            fixture.componentInstance.expanded = false;

            const titleEl = fixture.nativeElement.querySelector('.kbq-navbar-title') as HTMLElement;

            setTextMetrics(titleEl, { scrollWidth: 300, clientWidth: 176 });

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brandEl = fixture.nativeElement.querySelector('.kbq-navbar-brand') as HTMLElement;

            expect(brandEl.classList).not.toContain(LONG_TITLE_CLASS);

            fixture.componentInstance.expanded = true;
            fixture.detectChanges();
            // Drains microtasks only, which is what the render hooks run on - the browser paints no earlier
            // than that. Virtual time does not advance, so the debounce window is still wide open here.
            tick(0);
            fixture.detectChanges();

            expect(brandEl.classList).toContain(LONG_TITLE_CLASS);

            flush();
        }));
    });

    describe('KbqNavbarRectangleElement', () => {
        /**
         * Orientation is owned by the ambient navbar, which re-asserts it on every change detection pass, so
         * it is checked through the navbar the element actually sits in rather than by writing it by hand.
         */
        it('a horizontal navbar should mark its elements horizontal', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));

            expect(rectDebugEl.injector.get(KbqNavbarRectangleElement).orientation).toBe('horizontal');
            expect(rectDebugEl.nativeElement.classList).toContain('kbq-horizontal');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-vertical');
        }));

        it('a vertical navbar should mark its elements vertical', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));

            expect(rectDebugEl.injector.get(KbqNavbarRectangleElement).orientation).toBe('vertical');
            expect(rectDebugEl.nativeElement.classList).toContain('kbq-vertical');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-horizontal');
        }));

        it('vertical collapsed item should have kbq-collapsed class and expand back', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;

            expect(rectDebugEl.nativeElement.classList).toContain('kbq-collapsed');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-expanded');

            navbar.expanded.set(true);
            fixture.detectChanges();

            expect(rectDebugEl.nativeElement.classList).toContain('kbq-expanded');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-collapsed');

            flush();
        }));

        it('state Subject should emit when the orientation changes', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            rect.orientation = 'vertical';

            let emitCount = 0;

            rect.state.subscribe(() => emitCount++);

            rect.orientation = 'horizontal';

            expect(emitCount).toBe(1);
        });

        it('state Subject should not emit when the orientation is unchanged', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            rect.orientation = 'horizontal';

            let emitCount = 0;

            rect.state.subscribe(() => emitCount++);

            rect.orientation = 'horizontal';

            expect(emitCount).toBe(0);
        });

        /**
         * `_collapsed` starts `undefined` so that this first assignment gets through the setter's guard: a
         * vertical navbar that starts expanded assigns `collapsed = false` exactly once and never again, and
         * `KbqNavbarItem.updateDropdown()` rides on that emission. Initializing the field to `false` would
         * swallow it - and the test below would not notice, since it primes the first assignment before
         * subscribing.
         */
        it('state Subject should emit on the first collapsed assignment, even for false', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            let emitCount = 0;

            rect.state.subscribe(() => emitCount++);

            rect.collapsed = false;

            expect(emitCount).toBe(1);
        });

        it('state Subject should not emit when collapsed value is unchanged', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            rect.collapsed = true;

            let emitCount = 0;

            rect.state.subscribe(() => emitCount++);

            rect.collapsed = true;

            expect(emitCount).toBe(0);
        });

        /**
         * `getComputedStyle` answers `'auto'` for a width that has not been resolved and `''` for a margin
         * jsdom never computes. Guarding the sum instead of each value turns a single one of them into a `NaN`
         * total, which silently disables the whole collapse decision.
         */
        it('getOuterElementWidth should stay finite for non-numeric computed styles', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rect = fixture.debugElement
                .query(By.directive(KbqNavbarRectangleElement))
                .injector.get(KbqNavbarRectangleElement);
            const title = fixture.debugElement.query(By.directive(KbqNavbarTitle)).injector.get(KbqNavbarTitle);

            jest.spyOn(window, 'getComputedStyle').mockReturnValue({
                width: 'auto',
                marginLeft: '',
                marginRight: '10px'
            } as CSSStyleDeclaration);

            expect(rect.getOuterElementWidth()).toBe(10);
            expect(title.getOuterElementWidth()).toBe(10);

            jest.restoreAllMocks();
        });
    });

    describe('KbqNavbarTitle', () => {
        it('text getter should return element textContent', () => {
            const fixture = TestBed.createComponent(TestTitleApp);

            fixture.componentInstance.titleText = 'titleText';
            fixture.detectChanges();

            const titleInstance = fixture.debugElement.query(By.directive(KbqNavbarTitle)).injector.get(KbqNavbarTitle);

            expect(titleInstance.text).toContain('titleText');
        });
    });

    describe('KbqNavbarFocusableItem', () => {
        it('tabIndex should always be -1', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const focusableItems = fixture.debugElement.queryAll(By.directive(KbqNavbarFocusableItem));

            focusableItems.forEach((el) => {
                expect(el.nativeElement.getAttribute('tabindex')).toBe('-1');
            });
        }));

        it('should apply kbq-disabled class and aria-disabled when disabled=true', () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            const disabledItem = fixture.debugElement.query(By.css('.kbq-navbar-item.kbq-disabled'));

            expect(disabledItem.nativeElement.getAttribute('aria-disabled')).toBe('true');
            // The `disabled` content attribute means nothing on a custom element and is ignored by AT.
            expect(disabledItem.nativeElement.hasAttribute('disabled')).toBe(false);
        });

        it('onFocusHandler should not emit onFocus when item is disabled', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarFocusableItem))
                .injector.get(KbqNavbarFocusableItem);

            focusableItem.disabled = true;

            let emitCount = 0;

            focusableItem.onFocus.subscribe(() => emitCount++);

            focusableItem.onFocusHandler();

            expect(emitCount).toBe(0);
        }));

        it('onFocusHandler should not emit onFocus when item already has focus', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarFocusableItem))
                .injector.get(KbqNavbarFocusableItem);

            focusableItem.hasFocus = true;

            let emitCount = 0;

            focusableItem.onFocus.subscribe(() => emitCount++);

            focusableItem.onFocusHandler();

            expect(emitCount).toBe(0);
        }));

        it('focus(mouse) should not call nestedElement.focusViaKeyboard()', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarFocusableItem))
                .injector.get(KbqNavbarFocusableItem);

            const fakeButton = { focusViaKeyboard: jest.fn(), hasFocus: false } as any;

            jest.spyOn(focusableItem, 'nestedElement', 'get').mockReturnValue(fakeButton);

            focusableItem.focus('mouse');

            expect(fakeButton.focusViaKeyboard).not.toHaveBeenCalled();
        }));

        it('focus(keyboard) should call nestedElement.focusViaKeyboard()', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const focusableItem = fixture.debugElement
                .query(By.directive(KbqNavbarFocusableItem))
                .injector.get(KbqNavbarFocusableItem);

            const fakeButton = { focusViaKeyboard: jest.fn(), hasFocus: false } as any;

            jest.spyOn(focusableItem, 'nestedElement', 'get').mockReturnValue(fakeButton);

            focusableItem.focus('keyboard');

            expect(fakeButton.focusViaKeyboard).toHaveBeenCalled();
        }));
    });

    describe('KbqFocusableComponent focus origin gating', () => {
        it('mouse-origin focus on KbqNavbar host should not activate first item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(navbarInstance.keyManager, 'setFirstItemActive');

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'mouse');
            tick();

            expect(spy).not.toHaveBeenCalled();
        }));

        it('keyboard-origin focus on KbqNavbar host should activate first item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(navbarInstance.keyManager, 'setFirstItemActive');

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'keyboard');
            tick();

            expect(spy).toHaveBeenCalled();
        }));

        it('touch-origin focus on KbqNavbar host should not activate first item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(navbarInstance.keyManager, 'setFirstItemActive');

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'touch');
            tick();

            expect(spy).not.toHaveBeenCalled();
        }));

        it('mouse-origin focus on KbqVerticalNavbar host should not activate first item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqVerticalNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqVerticalNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(navbarInstance.keyManager, 'setFirstItemActive');

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'mouse');
            tick();

            expect(spy).not.toHaveBeenCalled();
        }));

        it('keyboard-origin focus on KbqVerticalNavbar host should activate first item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqVerticalNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqVerticalNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(navbarInstance.keyManager, 'setFirstItemActive');

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'keyboard');
            tick();

            expect(spy).toHaveBeenCalled();
        }));

        it('the roving key manager should skip disabled items', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar)).componentInstance as KbqNavbar;
            const items = navbar.focusableItems.toArray();

            // The first item of `TestApp` is the disabled one.
            expect(items[0].disabled).toBe(true);

            navbar.keyManager.setFirstItemActive();

            expect(navbar.keyManager.activeItem).toBe(items[1]);
        }));

        /**
         * The host owns the tab stop and hands focus straight to an item, which reads as the host being
         * blurred unless the focus monitor watches its children too. Losing the keyboard origin there left
         * every later arrow key moving the key manager's active item while nothing moved in the DOM — the
         * item only takes focus for a keyboard origin.
         */
        it('arrow keys should keep moving real focus after the hand-off to the first item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbar = navbarDebugEl.componentInstance as KbqNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'keyboard');
            tick();

            const first = navbar.keyManager.activeItem;

            expect(first?.hasFocus).toBe(true);

            dispatchKeyboardEvent(navbarDebugEl.nativeElement, 'keydown', RIGHT_ARROW, navbarDebugEl.nativeElement);
            fixture.detectChanges();
            tick();

            const next = navbar.keyManager.activeItem;

            expect(next).not.toBe(first);
            expect(next?.hasFocus).toBe(true);
        }));
    });

    describe('KbqVerticalNavbar', () => {
        it('should start collapsed and expand its container on toggle()', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;
            const container = fixture.nativeElement.querySelector('.kbq-vertical-navbar__container') as HTMLElement;

            expect(navbar.expanded()).toBe(false);
            expect(container.classList).toContain('kbq-collapsed');

            navbar.toggle();
            fixture.detectChanges();

            expect(navbar.expanded()).toBe(true);
            expect(container.classList).toContain('kbq-expanded');
        }));

        it('expanding should un-collapse every projected rectangle element', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;

            expect(navbar.rectangleElements().every((element) => element.collapsed)).toBe(true);

            navbar.expanded.set(true);
            fixture.detectChanges();
            flush();

            expect(navbar.rectangleElements().every((element) => !element.collapsed)).toBe(true);
        }));

        it('openOver should toggle the host class', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const host = fixture.nativeElement.querySelector('.kbq-vertical-navbar') as HTMLElement;

            expect(host.classList).not.toContain('kbq-vertical-navbar_open-over');

            fixture.componentInstance.openOver = true;
            fixture.detectChanges();

            expect(host.classList).toContain('kbq-vertical-navbar_open-over');
        }));

        it('configuration should fall back to the default when no locale service is provided', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;

            expect(navbar.configuration()).toEqual(KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION);
        }));

        /** The locale service is optional, so a configuration provided through the token applies without it. */
        it('configuration should use the value provided through the token', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestExternalConfigApp);

            fixture.detectChanges();
            flush();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;

            expect(navbar.configuration()).toBe(EXTERNAL_NAVBAR_CONFIGURATION);
        }));

        it('configuration should follow the locale service', fakeAsync(() => {
            TestBed.resetTestingModule();
            TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, KbqNavbarModule, KbqIconModule, TestVerticalApp],
                providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
            });

            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;
            const localeService = TestBed.inject(KBQ_LOCALE_SERVICE);

            localeService.setLocale('en-US');
            fixture.detectChanges();

            expect(navbar.configuration()).toEqual(localeService.getParams('navbar'));
        }));
    });

    describe('KbqNavbarToggle', () => {
        const getToggle = (fixture: { debugElement: DebugElement }) =>
            fixture.debugElement.query(By.directive(KbqNavbarToggle));

        it('click should toggle the navbar', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;

            getToggle(fixture).nativeElement.click();
            fixture.detectChanges();

            expect(navbar.expanded()).toBe(true);
        }));

        it('SPACE and ENTER should toggle the navbar and swallow the event', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;
            const toggleEl = getToggle(fixture).nativeElement as HTMLElement;

            const spaceEvent = dispatchKeyboardEvent(toggleEl, 'keydown', SPACE);

            fixture.detectChanges();

            expect(navbar.expanded()).toBe(true);
            expect(spaceEvent.defaultPrevented).toBe(true);

            dispatchKeyboardEvent(toggleEl, 'keydown', ENTER);
            fixture.detectChanges();

            expect(navbar.expanded()).toBe(false);
        }));

        it('should publish role, name and expanded state', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const toggleEl = getToggle(fixture).nativeElement as HTMLElement;
            const configuration = KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION;

            expect(toggleEl.getAttribute('role')).toBe('button');
            expect(toggleEl.getAttribute('aria-expanded')).toBe('false');
            expect(toggleEl.getAttribute('aria-keyshortcuts')).toBe('Control+/');
            expect(toggleEl.getAttribute('aria-label')).toBe(configuration.toggle.expand);

            toggleEl.click();
            fixture.detectChanges();

            expect(toggleEl.getAttribute('aria-expanded')).toBe('true');
            expect(toggleEl.getAttribute('aria-label')).toBe(configuration.toggle.collapse);
        }));

        it('the tooltip should name the action the toggle performs', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const toggle = getToggle(fixture).componentInstance as KbqNavbarToggle;
            const configuration = KBQ_VERTICAL_NAVBAR_DEFAULT_CONFIGURATION;
            const tooltip = getToggle(fixture).injector.get(KbqTooltipTrigger);

            expect(tooltip.content).toBe(configuration.toggle.expand);

            toggle.toggle();
            fixture.detectChanges();
            tooltip.visibleChange.emit(false);

            expect(tooltip.content).toBe(configuration.toggle.collapse);
        }));

        /**
         * Every toggle listens on the window. Toggling unconditionally collapsed *every* vertical navbar on
         * the page at once - and the shipped e2e fixture renders four of them.
         */
        it('Ctrl+/ should only toggle the navbar that holds focus', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestTwoVerticalNavbarsApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const [first, second] = fixture.debugElement
                .queryAll(By.directive(KbqVerticalNavbar))
                .map((el) => el.componentInstance as KbqVerticalNavbar);

            const secondHost = fixture.debugElement.queryAll(By.directive(KbqVerticalNavbar))[1]
                .nativeElement as HTMLElement;

            document.body.appendChild(fixture.nativeElement);
            secondHost.focus();

            dispatchGlobalShortcut(SLASH);
            fixture.detectChanges();

            expect(second.expanded()).toBe(true);
            expect(first.expanded()).toBe(false);

            fixture.nativeElement.remove();
        }));

        it('Ctrl+/ should fall back to the first navbar when focus is elsewhere', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestTwoVerticalNavbarsApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const [first, second] = fixture.debugElement
                .queryAll(By.directive(KbqVerticalNavbar))
                .map((el) => el.componentInstance as KbqVerticalNavbar);

            dispatchGlobalShortcut(NUMPAD_DIVIDE);
            fixture.detectChanges();

            expect(first.expanded()).toBe(true);
            expect(second.expanded()).toBe(false);
        }));

        it('should stop reacting to the shortcut once destroyed', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;
            const spy = jest.spyOn(navbar, 'toggle');

            fixture.destroy();

            dispatchGlobalShortcut(SLASH);

            expect(spy).not.toHaveBeenCalled();
        }));

        it('tooltip content should follow a runtime locale change', fakeAsync(() => {
            TestBed.configureTestingModule({
                providers: [{ provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService }]
            });

            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const tooltip = getToggle(fixture).injector.get(KbqTooltipTrigger);

            expect(tooltip.content).toBe(ruRULocaleData.navbar.toggle.expand);

            // The tooltip is deliberately never shown nor hidden here: `visibleChange` would refresh the
            // content on its own and hide a toggle that never reacts to the locale itself.
            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();

            expect(tooltip.content).toBe(enUSLocaleData.navbar.toggle.expand);
        }));

        it('tooltip content should follow an override registered through the provider', fakeAsync(() => {
            const expand = '*unit_test* Open the menu';

            TestBed.configureTestingModule({
                providers: [
                    { provide: KBQ_LOCALE_SERVICE, useClass: KbqLocaleService },
                    kbqVerticalNavbarLocaleConfigurationProvider({ toggle: { expand } })
                ]
            });

            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const tooltip = getToggle(fixture).injector.get(KbqTooltipTrigger);

            expect(tooltip.content).toBe(expand);

            TestBed.inject(KBQ_LOCALE_SERVICE).setLocale('en-US');
            fixture.detectChanges();

            // An override outranks the locale — that is what distinguishes it from a default.
            expect(tooltip.content).toBe(expand);
        }));
    });

    describe('responsive collapse', () => {
        it('should collapse just enough items to fit the navbar width', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestCollapseApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar)).componentInstance as KbqNavbar;
            const items = fixture.debugElement
                .queryAll(By.directive(KbqNavbarItem))
                .map((el) => el.componentInstance as KbqNavbarItem);

            // Four rectangle elements of 100px each (three items plus the divider) in a 350px navbar:
            // collapsing the last item, worth 100px of title, is exactly enough.
            stubNavbarWidths(fixture.debugElement, { navbar: 350, item: 100, title: 100 });

            navbar.updateExpandedStateForItems();
            fixture.detectChanges();

            expect(items.map((item) => item.isCollapsed())).toEqual([false, false, true]);
        }));

        it('should expand items again once the navbar has room', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestCollapseApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar)).componentInstance as KbqNavbar;
            const items = fixture.debugElement
                .queryAll(By.directive(KbqNavbarItem))
                .map((el) => el.componentInstance as KbqNavbarItem);

            stubNavbarWidths(fixture.debugElement, { navbar: 350, item: 100, title: 100 });
            navbar.updateExpandedStateForItems();
            fixture.detectChanges();

            expect(items.some((item) => item.isCollapsed())).toBe(true);

            stubNavbarWidths(fixture.debugElement, { navbar: 1000, item: 100, title: 100 });
            navbar.updateExpandedStateForItems();
            fixture.detectChanges();

            expect(items.every((item) => !item.isCollapsed())).toBe(true);
        }));

        it('a burst of resize events should trigger a single debounced recompute', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestCollapseApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar)).componentInstance as KbqNavbar;
            const spy = jest.spyOn(navbar, 'updateExpandedStateForItems');

            for (let i = 0; i < 20; i++) {
                window.dispatchEvent(new Event('resize'));
            }

            expect(spy).not.toHaveBeenCalled();

            tick(RESIZE_DEBOUNCE_MS);

            expect(spy).toHaveBeenCalledTimes(1);

            flush();
        }));
    });

    describe('accessibility', () => {
        it('KbqNavbar should expose a navigation landmark with a name', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.nativeElement.querySelector('.kbq-navbar') as HTMLElement;

            expect(navbar.getAttribute('role')).toBe('navigation');
            expect(navbar.getAttribute('aria-label')).toBe('Main');
        }));

        it('KbqVerticalNavbar should expose a navigation landmark', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const navbar = fixture.nativeElement.querySelector('.kbq-vertical-navbar') as HTMLElement;

            expect(navbar.getAttribute('role')).toBe('navigation');
        }));

        it('a bare item should be announced as a button', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const item = fixture.nativeElement.querySelector('kbq-navbar-item') as HTMLElement;

            expect(item.getAttribute('role')).toBe('button');
        }));

        /**
         * An icon-only item (no projected `kbq-navbar-title`) has no visible label of its own in either
         * state, collapsed or not — unlike a titled item, whose title text names it while expanded and is
         * published as `aria-label` only once collapsed. The `aria-label` input is the only way to name it.
         */
        it('an icon-only item needs its own aria-label to be an accessible button', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const items = fixture.nativeElement.querySelectorAll('kbq-navbar-item');
            const iconOnlyItem = items[1] as HTMLElement;

            expect(iconOnlyItem.getAttribute('role')).toBe('button');
            expect(iconOnlyItem.getAttribute('aria-label')).toBe('Play');
        }));

        it('an item wrapping a native control should keep its own semantics', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestCollapseApp);

            fixture.componentInstance.asLinks = true;
            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const item = fixture.nativeElement.querySelector('a[kbq-navbar-item]') as HTMLElement;

            expect(item.hasAttribute('role')).toBe(false);
        }));

        /** A tooltip is a transient overlay; on its own it never names the control it is attached to. */
        it('a collapsed item should carry its title as an accessible name', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const itemDebugEl = fixture.debugElement.query(By.directive(KbqNavbarItem));
            const item = itemDebugEl.componentInstance as KbqNavbarItem;

            expect(itemDebugEl.nativeElement.hasAttribute('aria-label')).toBe(false);

            item.collapsed = true;
            fixture.detectChanges();

            expect(itemDebugEl.nativeElement.getAttribute('aria-label')).toBe('Item with title');
        }));

        it('a collapsed brand should carry its title as an accessible name', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const brandEl = fixture.nativeElement.querySelector('.kbq-navbar-brand') as HTMLElement;

            expect(brandEl.getAttribute('aria-label')).toBe('App Name');
        }));

        it('the divider should be a separator oriented across the navbar', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestCollapseApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const divider = fixture.debugElement.query(By.directive(KbqNavbarDivider)).nativeElement as HTMLElement;

            expect(divider.getAttribute('role')).toBe('separator');
            expect(divider.getAttribute('aria-orientation')).toBe('vertical');
        }));

        it('ENTER should activate a bare item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const itemEl = fixture.nativeElement.querySelector('kbq-navbar-item') as HTMLElement;

            dispatchKeyboardEvent(itemEl, 'keydown', 13);
            fixture.detectChanges();

            expect(fixture.componentInstance.clicks).toBe(1);
        }));

        it('SPACE should activate a bare item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            flush();
            fixture.detectChanges();

            const itemEl = fixture.nativeElement.querySelector('kbq-navbar-item') as HTMLElement;

            dispatchKeyboardEvent(itemEl, 'keydown', 32);
            fixture.detectChanges();

            expect(fixture.componentInstance.clicks).toBe(1);
        }));

        it('has no axe violations for a horizontal navbar', async () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            document.body.appendChild(fixture.nativeElement);

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();

            fixture.nativeElement.remove();
        });

        it('has no axe violations for a titled and an icon-only item', async () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            document.body.appendChild(fixture.nativeElement);

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();

            fixture.nativeElement.remove();
        });

        it('has no axe violations for a collapsed vertical navbar', async () => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();
            document.body.appendChild(fixture.nativeElement);

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();

            fixture.nativeElement.remove();
        });

        it('has no axe violations for an expanded vertical navbar', async () => {
            const fixture = TestBed.createComponent(TestVerticalApp);

            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqVerticalNavbar))
                .componentInstance as KbqVerticalNavbar;

            navbar.expanded.set(true);
            fixture.detectChanges();
            document.body.appendChild(fixture.nativeElement);

            expect(await axe(fixture.nativeElement)).toHaveNoViolations();

            fixture.nativeElement.remove();
        });
    });
});

/**
 * jsdom performs no layout, so the collapse algorithm has nothing to measure. These stubs stand in for the
 * browser's answer to "how much room is there, and how much do the items need?".
 */
const stubNavbarWidths = (
    root: DebugElement,
    { navbar, item, title }: { navbar: number; item: number; title?: number }
): void => {
    const navbarEl = root.query(By.directive(KbqNavbar)).nativeElement as HTMLElement;

    navbarEl.getBoundingClientRect = () => ({ width: navbar }) as DOMRect;

    root.queryAll(By.directive(KbqNavbarRectangleElement)).forEach((el) => {
        el.injector.get(KbqNavbarRectangleElement).getOuterElementWidth = () => item;
    });

    root.queryAll(By.directive(KbqNavbarItem)).forEach((el) => {
        (el.componentInstance as KbqNavbarItem).getTitleWidth = () => title ?? item;
    });
};

@Component({
    selector: 'test-app',
    imports: [KbqNavbarModule, KbqIconModule],
    templateUrl: './navbar.component.html'
})
class TestApp {
    counter: number = 0;
    navbarContainerWidth: number = 915;

    onItemClick(disabledItem?: KbqNavbarItem) {
        if (disabledItem?.navbarFocusableItem.disabled) {
            return;
        }

        this.counter++;
    }
}

@Component({
    selector: 'test-item-app',
    imports: [KbqNavbarModule, KbqIconModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item
                    [collapsable]="collapsable"
                    [collapsedText]="collapsedText"
                    [kbqTooltipDisabled]="tooltipDisabled"
                    (click)="clicks = clicks + 1"
                >
                    <i kbq-icon="kbq-circle-info_16"></i>
                    <kbq-navbar-title>Item with title</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item aria-label="Play">
                    <i kbq-icon="kbq-play_16"></i>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestItemApp {
    collapsedText: string = '';
    collapsable: boolean = true;
    tooltipDisabled: boolean | undefined = undefined;
    clicks = 0;
}

@Component({
    selector: 'test-collapse-app',
    imports: [KbqNavbarModule, KbqIconModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                @if (asLinks) {
                    <a href="#" kbq-navbar-item>
                        <i kbq-icon="kbq-circle-info_16"></i>
                        <kbq-navbar-title>Link item</kbq-navbar-title>
                    </a>
                }
                <kbq-navbar-item>
                    <i kbq-icon="kbq-circle-info_16"></i>
                    <kbq-navbar-title>First</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-divider />
                <kbq-navbar-item>
                    <i kbq-icon="kbq-play_16"></i>
                    <kbq-navbar-title>Second</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <i kbq-icon="kbq-pause_16"></i>
                    <kbq-navbar-title>Third</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestCollapseApp {
    asLinks = false;
}

@Component({
    selector: 'test-title-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-navbar-title>{{ titleText }}</kbq-navbar-title>
    `
})
class TestTitleApp {
    titleText: string = '';
}

@Component({
    selector: 'test-brand-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-vertical-navbar>
            <kbq-navbar-container>
                <a href="#" kbq-navbar-brand [collapsedText]="collapsedText">
                    <div kbq-navbar-title>App Name</div>
                </a>
            </kbq-navbar-container>
        </kbq-vertical-navbar>
    `
})
class TestBrandApp {
    collapsedText: string = '';
}

@Component({
    selector: 'test-non-anchor-brand-app',
    imports: [KbqNavbarModule, KbqIconModule, KbqButtonModule],
    template: `
        <kbq-vertical-navbar>
            <kbq-navbar-container>
                <div kbq-navbar-brand>
                    <div kbq-navbar-title>App Name</div>
                    @if (withButton) {
                        <button kbq-button>Action</button>
                    }
                </div>
            </kbq-navbar-container>
        </kbq-vertical-navbar>
    `
})
class TestNonAnchorBrandApp {
    withButton = false;
}

@Component({
    selector: 'test-brand-long-title-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-vertical-navbar [expanded]="expanded">
            <kbq-navbar-container>
                <a href="#" kbq-navbar-brand [longTitle]="longTitle">
                    <div kbq-navbar-title>{{ titleText }}</div>
                </a>
            </kbq-navbar-container>
        </kbq-vertical-navbar>
    `
})
class TestBrandLongTitleApp {
    titleText: string = 'App Name';
    longTitle: boolean | undefined = undefined;
    expanded: boolean = true;
}

@Component({
    selector: 'test-brand-horizontal-app',
    imports: [KbqNavbarModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <a href="#" kbq-navbar-brand>
                    <div kbq-navbar-title>App Name</div>
                </a>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestBrandHorizontalApp {}

@Component({
    selector: 'test-vertical-app',
    imports: [KbqNavbarModule, KbqIconModule],
    template: `
        <kbq-vertical-navbar [openOver]="openOver">
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <i kbq-icon="kbq-circle-info_16"></i>
                    <kbq-navbar-title>First item</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <i kbq-icon="kbq-play_16"></i>
                    <kbq-navbar-title>Second item</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
            <button kbq-navbar-toggle></button>
        </kbq-vertical-navbar>
    `
})
class TestVerticalApp {
    openOver = false;
}

@Component({
    selector: 'test-two-vertical-navbars-app',
    imports: [KbqNavbarModule, KbqIconModule],
    template: `
        @for (navbar of navbars; track navbar) {
            <kbq-vertical-navbar>
                <kbq-navbar-container>
                    <kbq-navbar-item>
                        <i kbq-icon="kbq-circle-info_16"></i>
                        <kbq-navbar-title>{{ navbar }}</kbq-navbar-title>
                    </kbq-navbar-item>
                </kbq-navbar-container>
                <button kbq-navbar-toggle></button>
            </kbq-vertical-navbar>
        }
    `
})
class TestTwoVerticalNavbarsApp {
    readonly navbars = ['first', 'second'];
}

const EXTERNAL_NAVBAR_CONFIGURATION = { toggle: { expand: 'Open it', collapse: 'Close it' } };

@Component({
    selector: 'test-external-config-app',
    imports: [KbqNavbarModule, KbqIconModule],
    template: `
        <kbq-vertical-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item>
                    <i kbq-icon="kbq-circle-info_16"></i>
                    <kbq-navbar-title>First item</kbq-navbar-title>
                </kbq-navbar-item>
            </kbq-navbar-container>
            <button kbq-navbar-toggle></button>
        </kbq-vertical-navbar>
    `,
    providers: [{ provide: KBQ_VERTICAL_NAVBAR_CONFIGURATION, useValue: EXTERNAL_NAVBAR_CONFIGURATION }]
})
class TestExternalConfigApp {}
