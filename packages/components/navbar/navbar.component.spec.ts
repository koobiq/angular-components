import { FocusMonitor } from '@angular/cdk/a11y';
import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, viewChild } from '@angular/core';
import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchKeyboardEvent, LEFT_ARROW, RIGHT_ARROW, TAB } from '@koobiq/components/core';
import { KbqDropdownModule, KbqDropdownTrigger } from '@koobiq/components/dropdown';
import { Observable, Subject } from 'rxjs';
import { KbqIconModule } from './../icon/icon.module';
import {
    KbqNavbar,
    KbqNavbarBrand,
    KbqNavbarContainer,
    KbqNavbarFocusableItem,
    KbqNavbarItem,
    KbqNavbarModule,
    KbqNavbarRectangleElement,
    KbqNavbarTitle,
    KbqVerticalNavbar
} from './index';

const FONT_RENDER_TIMEOUT_MS = 10;

const LONG_TITLE_CLASS = 'kbq-navbar-brand_long-title';

/** Matches `KbqNavbarBrand`'s own debounce window. */
const LONG_TITLE_DEBOUNCE_MS = 100;

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
                TestBrandHorizontalApp
            ]
        }).compileComponents();
    });

    it('collapsed elements should have title', fakeAsync(() => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        tick(FONT_RENDER_TIMEOUT_MS);
        fixture.detectChanges();

        const collapsableItems = fixture.debugElement
            .queryAll(By.directive(KbqNavbarItem))
            .map((item) => item.componentInstance as KbqNavbarItem)
            .filter((item) => item.title() && item.collapsable);

        collapsableItems.forEach((item) => (item.collapsed = true));

        fixture.detectChanges();

        const collapsedItems = collapsableItems.filter((item) => item.isCollapsed);

        expect(collapsedItems.length).toBeGreaterThan(0);
        expect(collapsedItems.every((item) => !!item.titleText && item.content === item.titleText)).toBe(true);
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
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar));

            expect(navbar.nativeElement.classList).toContain('kbq-navbar');
        }));

        it('tabIndex should be 0 by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const navbar = fixture.debugElement.query(By.directive(KbqNavbar));

            expect(navbar.nativeElement.getAttribute('tabindex')).toBe('0');
        }));

        it('TAB key should set tabIndex to -1 and restore it after setTimeout', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqNavbar;

            dispatchKeyboardEvent(navbarDebugEl.nativeElement, 'keydown', TAB, navbarDebugEl.nativeElement);
            fixture.detectChanges();

            expect(navbarInstance.tabIndex).toBe(-1);

            tick();
            fixture.detectChanges();

            expect(navbarInstance.tabIndex).toBe(0);
        }));

        it('RIGHT_ARROW key should pass event to keyManager', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const itemWithTitle = fixture.debugElement.query(By.css('kbq-navbar-item.kbq-navbar-item_with-title'));

            expect(itemWithTitle).toBeTruthy();
        }));

        it('should not have kbq-navbar-item_with-title class for icon-only item', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const iconOnlyItem = fixture.debugElement.query(By.css('kbq-navbar-item:not(.kbq-navbar-item_with-title)'));

            expect(iconOnlyItem).toBeTruthy();
        }));

        it('collapsedText input should override titleText', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            fixture.componentInstance.collapsedText = 'Custom Tooltip';
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            expect(item.titleText).toBe('Custom Tooltip');
        }));

        it('collapsable should be true by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            expect(item.collapsable).toBe(true);
        }));

        it('setting collapsable=false should make item non-collapsable', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.componentInstance.collapsable = false;
            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const item = fixture.debugElement.query(By.directive(KbqNavbarItem)).componentInstance as KbqNavbarItem;

            expect(item.collapsable).toBe(false);
        }));

        it('should not have kbq-navbar-item_collapsed class by default', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const itemDebugEl = fixture.debugElement.query(By.directive(KbqNavbarItem));

            expect(itemDebugEl.nativeElement.classList).not.toContain('kbq-navbar-item_collapsed');
        }));

        it('should toggle kbq-navbar-item_collapsed class when collapsed changes', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
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
    });

    describe('KbqNavbarBrand', () => {
        it('collapsedText input should override inner kbq-navbar-title in titleText', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            fixture.componentInstance.collapsedText = 'Custom Tooltip';
            fixture.detectChanges();

            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            expect(brand.titleText).toBe('Custom Tooltip');
        }));

        it('titleText should fall back to inner kbq-navbar-title text when collapsedText is empty', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            expect(brand.titleText).toBe('App Name');
        }));

        it('tooltip content should update reactively when collapsedText changes while collapsed', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestBrandApp);

            fixture.componentInstance.collapsedText = 'First';
            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const brand = fixture.debugElement.query(By.directive(KbqNavbarBrand)).componentInstance as KbqNavbarBrand;

            brand.collapsed = true;
            fixture.detectChanges();

            expect(brand.content).toBe('First');

            fixture.componentInstance.collapsedText = 'Updated';
            fixture.detectChanges();

            expect(brand.content).toBe('Updated');
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
        it('setting horizontal=true should add kbq-horizontal and remove kbq-vertical', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            rect.vertical = true;
            fixture.detectChanges();

            expect(rectDebugEl.nativeElement.classList).toContain('kbq-vertical');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-horizontal');

            rect.horizontal = true;
            fixture.detectChanges();

            expect(rectDebugEl.nativeElement.classList).toContain('kbq-horizontal');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-vertical');
        }));

        it('vertical collapsed item should have kbq-collapsed class', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            rect.vertical = true;
            rect.collapsed = true;
            fixture.detectChanges();

            expect(rectDebugEl.nativeElement.classList).toContain('kbq-collapsed');
            expect(rectDebugEl.nativeElement.classList).not.toContain('kbq-expanded');
        }));

        it('state Subject should emit when horizontal value changes', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            let emitCount = 0;

            rect.state.subscribe(() => emitCount++);

            rect.horizontal = true;

            expect(emitCount).toBe(1);
        });

        it('state Subject should not emit when horizontal value is unchanged', () => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();

            const rectDebugEl = fixture.debugElement.query(By.directive(KbqNavbarRectangleElement));
            const rect = rectDebugEl.injector.get(KbqNavbarRectangleElement);

            rect.horizontal = true;

            let emitCount = 0;

            rect.state.subscribe(() => emitCount++);

            rect.horizontal = true;

            expect(emitCount).toBe(0);
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
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const focusableItems = fixture.debugElement.queryAll(By.directive(KbqNavbarFocusableItem));

            focusableItems.forEach((el) => {
                expect(el.nativeElement.getAttribute('tabindex')).toBe('-1');
            });
        }));

        it('should apply kbq-disabled class and disabled attribute when disabled=true', () => {
            const fixture = TestBed.createComponent(TestApp);

            fixture.detectChanges();

            const disabledItem = fixture.debugElement.query(By.css('kbq-navbar-item[disabled]'));

            expect(disabledItem.nativeElement.classList).toContain('kbq-disabled');
            expect(disabledItem.nativeElement.hasAttribute('disabled')).toBe(true);
        });

        it('onFocusHandler should not emit onFocus when item is disabled', fakeAsync(() => {
            const fixture = TestBed.createComponent(TestItemApp);

            fixture.detectChanges();
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
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
            tick(FONT_RENDER_TIMEOUT_MS);
            fixture.detectChanges();

            const navbarDebugEl = fixture.debugElement.query(By.directive(KbqVerticalNavbar));
            const navbarInstance = navbarDebugEl.componentInstance as KbqVerticalNavbar;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(navbarInstance.keyManager, 'setFirstItemActive');

            focusMonitor.focusVia(navbarDebugEl.nativeElement, 'keyboard');
            tick();

            expect(spy).toHaveBeenCalled();
        }));
    });
});

describe('KbqNavbar dropdown host', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, KbqNavbarModule, KbqDropdownModule, NavbarWithDropdownApp]
        }).compileComponents();
    });

    it('should default demoteOverlay to false on a KbqDropdownTrigger nested inside kbq-navbar', () => {
        const fixture = TestBed.createComponent(NavbarWithDropdownApp);

        fixture.detectChanges();

        expect(fixture.componentInstance.trigger().demoteOverlay).toBe(false);
    });
});

@Component({
    selector: 'test-app-navbar-with-dropdown',
    imports: [KbqNavbarModule, KbqDropdownModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <button [kbqDropdownTriggerFor]="dropdown">Open</button>
                <kbq-dropdown #dropdown="kbqDropdown">
                    <button kbq-dropdown-item>Item</button>
                </kbq-dropdown>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class NavbarWithDropdownApp {
    readonly trigger = viewChild.required(KbqDropdownTrigger);
}

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

@Component({
    selector: 'test-item-app',
    imports: [KbqNavbarModule, KbqIconModule],
    template: `
        <kbq-navbar>
            <kbq-navbar-container>
                <kbq-navbar-item [collapsedText]="collapsedText" [collapsable]="collapsable">
                    <i kbq-icon="kbq-circle-info_16"></i>
                    <kbq-navbar-title>Item with title</kbq-navbar-title>
                </kbq-navbar-item>
                <kbq-navbar-item>
                    <i kbq-icon="kbq-play_16"></i>
                </kbq-navbar-item>
            </kbq-navbar-container>
        </kbq-navbar>
    `
})
class TestItemApp {
    collapsedText: string = '';
    collapsable: boolean = true;
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
        <kbq-vertical-navbar>
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
        </kbq-vertical-navbar>
    `
})
class TestVerticalApp {}
