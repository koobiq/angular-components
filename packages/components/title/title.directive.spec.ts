import { FocusMonitor } from '@angular/cdk/a11y';
import { ContentObserver } from '@angular/cdk/observers';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
    Component,
    DebugElement,
    Directive,
    ElementRef,
    Injectable,
    TemplateRef,
    Type,
    ViewChild
} from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    dispatchMouseEvent,
    KBQ_TITLE_TEXT_REF,
    KbqSiblingPopup,
    kbqSiblingPopupProvider,
    KbqTitleTextRef,
    PopUpTriggers
} from '@koobiq/components/core';
import { Observable, Subject } from 'rxjs';
import { KbqTitleDirective } from './title.directive';

/** Drives the directive's resize path by hand — the real observer never emits under JSDOM. */
@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    readonly changes = new Subject<ResizeObserverEntry[]>();
    readonly observedTargets: Element[] = [];

    override observe(target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        this.observedTargets.push(target);

        return this.changes.asObservable();
    }
}

const provideMockResizeObserver = () => ({ provide: SharedResizeObserver, useClass: MockResizeObserver });

const getResizeObserver = (): MockResizeObserver => TestBed.inject(SharedResizeObserver) as MockResizeObserver;

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers
    }).compileComponents();
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getTitleDirective = (de: DebugElement): KbqTitleDirective =>
    de.query(By.directive(KbqTitleDirective)).injector.get(KbqTitleDirective);

const getTooltipElement = (): Element | null =>
    TestBed.inject(OverlayContainer).getContainerElement().querySelector('.kbq-tooltip');

describe('KbqTitleDirective', () => {
    describe('creation', () => {
        it('should create the directive', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);

            expect(getTitleDirective(debugElement)).toBeTruthy();
        });
    });

    describe('trigger getter', () => {
        it('should always return PopUpTriggers.Hover', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.trigger).toBe(PopUpTriggers.Hover);
        });

        it('should not be overridden by the setter', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            directive.trigger = 'click';

            expect(directive.trigger).toBe(PopUpTriggers.Hover);
        });
    });

    describe('viewValue getter', () => {
        it('should return trimmed textContent of parent', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.viewValue).toBe('Hello World');
        });

        it('should return empty string when parent has no text', () => {
            const { debugElement } = createComponent(EmptyTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.viewValue).toBe('');
        });
    });

    describe('hasOnlyText getter', () => {
        it('should return true when host element has only a text node child', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive['hasOnlyText']).toBe(true);
        });

        it('should return false when host element has element children', () => {
            const { debugElement } = createComponent(ElementChildTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive['hasOnlyText']).toBe(false);
        });
    });

    describe('isHorizontalOverflown getter', () => {
        it('should return true when parent offsetWidth < child scrollWidth', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);

            expect(directive['isHorizontalOverflown']).toBe(true);
        });

        it('should return false when parent offsetWidth >= child scrollWidth', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(200);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(100);

            expect(directive['isHorizontalOverflown']).toBe(false);
        });
    });

    describe('isVerticalOverflown getter', () => {
        it('should return true when parent offsetHeight < child scrollHeight', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetHeight', 'get').mockReturnValue(30);
            jest.spyOn(el, 'scrollHeight', 'get').mockReturnValue(60);

            expect(directive['isVerticalOverflown']).toBe(true);
        });

        it('should return false when parent offsetHeight >= child scrollHeight', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetHeight', 'get').mockReturnValue(60);
            jest.spyOn(el, 'scrollHeight', 'get').mockReturnValue(30);

            expect(directive['isVerticalOverflown']).toBe(false);
        });
    });

    describe('isOverflown getter', () => {
        it('should return true when content is vertically overflown', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetHeight', 'get').mockReturnValue(10);
            jest.spyOn(el, 'scrollHeight', 'get').mockReturnValue(20);

            expect(directive.isOverflown).toBe(true);
        });

        it('should return true when content is horizontally overflown (non-zero scrollWidth)', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);

            expect(directive.isOverflown).toBe(true);
        });

        it('should return true via getBoundingClientRect for text-only content (fraction-pixel case)', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            // JSDOM returns 0 for all sizing properties — triggers the special-case branch.
            // hasOnlyText === true → creates a wrapper span and compares getBoundingClientRect widths.
            const spy = jest
                .spyOn(Element.prototype, 'getBoundingClientRect')
                .mockReturnValueOnce({ width: 119, height: 20, top: 0, left: 0, right: 119, bottom: 20 } as DOMRect)
                .mockReturnValueOnce({ width: 130, height: 20, top: 0, left: 0, right: 130, bottom: 20 } as DOMRect);

            expect(directive.isOverflown).toBe(true);
            spy.mockRestore();
        });

        it('should return true via getBoundingClientRect for element-child content (fraction-pixel case)', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);
            // scrollWidth === 0 by default (JSDOM) → enters special-case branch.
            // hasOnlyText === false → compares parent and child getBoundingClientRect directly.
            const containerEl = debugElement.query(By.css('.container-el')).nativeElement;
            const textEl = debugElement.query(By.css('.text-el')).nativeElement;

            jest.spyOn(containerEl, 'getBoundingClientRect').mockReturnValue({
                width: 100,
                height: 20,
                top: 0,
                left: 0,
                right: 100,
                bottom: 20
            } as DOMRect);
            jest.spyOn(textEl, 'getBoundingClientRect').mockReturnValue({
                width: 150,
                height: 20,
                top: 0,
                left: 0,
                right: 150,
                bottom: 20
            } as DOMRect);

            expect(directive.isOverflown).toBe(true);
        });

        it('should NOT be overflown for a sub-pixel clip (text-overflow: clip)', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            // JSDOM scrollWidth === 0 → enters the special-case branch; hasOnlyText === true → wrapper-span path.
            // With `clip` a <1px overflow is invisible, so it must not be reported as truncation.
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'clip' } as CSSStyleDeclaration);
            const rectSpy = jest
                .spyOn(Element.prototype, 'getBoundingClientRect')
                .mockReturnValueOnce({ width: 124, height: 20, top: 0, left: 0, right: 124, bottom: 20 } as DOMRect)
                .mockReturnValueOnce({
                    width: 124.4,
                    height: 20,
                    top: 0,
                    left: 0,
                    right: 124.4,
                    bottom: 20
                } as DOMRect);

            expect(directive.isOverflown).toBe(false);

            rectSpy.mockRestore();
            cssSpy.mockRestore();
        });

        it('should be overflown for a sub-pixel overflow when text-overflow is ellipsis', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            // With `ellipsis` even a sub-pixel overflow drops the trailing glyph for `…`, so the text IS truncated.
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'ellipsis' } as CSSStyleDeclaration);
            const rectSpy = jest
                .spyOn(Element.prototype, 'getBoundingClientRect')
                .mockReturnValueOnce({ width: 124, height: 20, top: 0, left: 0, right: 124, bottom: 20 } as DOMRect)
                .mockReturnValueOnce({
                    width: 124.4,
                    height: 20,
                    top: 0,
                    left: 0,
                    right: 124.4,
                    bottom: 20
                } as DOMRect);

            expect(directive.isOverflown).toBe(true);

            rectSpy.mockRestore();
            cssSpy.mockRestore();
        });

        it('should be overflown for a >= 1px clip even without ellipsis', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'clip' } as CSSStyleDeclaration);
            const rectSpy = jest
                .spyOn(Element.prototype, 'getBoundingClientRect')
                .mockReturnValueOnce({ width: 124, height: 20, top: 0, left: 0, right: 124, bottom: 20 } as DOMRect)
                .mockReturnValueOnce({ width: 130, height: 20, top: 0, left: 0, right: 130, bottom: 20 } as DOMRect);

            expect(directive.isOverflown).toBe(true);

            rectSpy.mockRestore();
            cssSpy.mockRestore();
        });

        it('should NOT be overflown for a sub-pixel clip (element-child, text-overflow: clip)', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);
            const containerEl = debugElement.query(By.css('.container-el')).nativeElement;
            const textEl = debugElement.query(By.css('.text-el')).nativeElement;
            // scrollWidth === 0 (JSDOM) → enters the branch; hasOnlyText === false → parent/child rect comparison.
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'clip' } as CSSStyleDeclaration);

            jest.spyOn(containerEl, 'getBoundingClientRect').mockReturnValue({
                width: 100,
                height: 20,
                top: 0,
                left: 0,
                right: 100,
                bottom: 20
            } as DOMRect);
            jest.spyOn(textEl, 'getBoundingClientRect').mockReturnValue({
                width: 100.4,
                height: 20,
                top: 0,
                left: 0,
                right: 100.4,
                bottom: 20
            } as DOMRect);

            expect(directive.isOverflown).toBe(false);

            cssSpy.mockRestore();
        });

        it('should be overflown for a sub-pixel overflow when text-overflow is ellipsis (element-child)', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);
            const containerEl = debugElement.query(By.css('.container-el')).nativeElement;
            const textEl = debugElement.query(By.css('.text-el')).nativeElement;
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'ellipsis' } as CSSStyleDeclaration);

            jest.spyOn(containerEl, 'getBoundingClientRect').mockReturnValue({
                width: 100,
                height: 20,
                top: 0,
                left: 0,
                right: 100,
                bottom: 20
            } as DOMRect);
            jest.spyOn(textEl, 'getBoundingClientRect').mockReturnValue({
                width: 100.4,
                height: 20,
                top: 0,
                left: 0,
                right: 100.4,
                bottom: 20
            } as DOMRect);

            expect(directive.isOverflown).toBe(true);

            cssSpy.mockRestore();
        });

        it('should be overflown for a sub-pixel overflow when the ellipsis is on the container, not the child (tree-option case)', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);
            const containerEl = debugElement.query(By.css('.container-el')).nativeElement;
            const textEl = debugElement.query(By.css('.text-el')).nativeElement;
            // Mirrors kbq-tree-option: `text-overflow: ellipsis` lives on the wrapping #kbqTitleContainer
            // (the parent), while the measured #kbqTitleText child keeps the default `clip`. A sub-pixel
            // overflow still renders a visible `…` on the container, so it MUST be reported as truncation.
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockImplementation(
                    (element: Element) =>
                        ({ textOverflow: element === containerEl ? 'ellipsis' : 'clip' }) as CSSStyleDeclaration
                );

            jest.spyOn(containerEl, 'getBoundingClientRect').mockReturnValue({
                width: 100,
                height: 20,
                top: 0,
                left: 0,
                right: 100,
                bottom: 20
            } as DOMRect);
            jest.spyOn(textEl, 'getBoundingClientRect').mockReturnValue({
                width: 100.4,
                height: 20,
                top: 0,
                left: 0,
                right: 100.4,
                bottom: 20
            } as DOMRect);

            expect(directive.isOverflown).toBe(true);

            cssSpy.mockRestore();
        });

        it('should be overflown for a clip whose widths straddle the rounding boundary (124 vs 124.5)', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);
            const containerEl = debugElement.query(By.css('.container-el')).nativeElement;
            const textEl = debugElement.query(By.css('.text-el')).nativeElement;
            // The other clip tests use a 0.4 fraction that rounds DOWN (124.4 -> 124 == 124 -> not overflown).
            // Here the widths round to different integers (124 vs 125), i.e. a whole visible pixel of clip,
            // so it MUST be reported. Pins the Math.round boundary of isWidthOverflown.
            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'clip' } as CSSStyleDeclaration);

            jest.spyOn(containerEl, 'getBoundingClientRect').mockReturnValue({
                width: 124,
                height: 20,
                top: 0,
                left: 0,
                right: 124,
                bottom: 20
            } as DOMRect);
            jest.spyOn(textEl, 'getBoundingClientRect').mockReturnValue({
                width: 124.5,
                height: 20,
                top: 0,
                left: 0,
                right: 124.5,
                bottom: 20
            } as DOMRect);

            expect(directive.isOverflown).toBe(true);

            cssSpy.mockRestore();
        });
    });

    describe('handleElementEnter()', () => {
        it('should set disabled=false when content is overflown', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
            directive['handleElementEnter']();

            expect(directive.disabled).toBe(false);
        });

        it('should set disabled=true when content is not overflown', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            // JSDOM defaults: all sizing = 0 → isOverflown = false
            directive['handleElementEnter']();

            expect(directive.disabled).toBe(true);
        });
    });

    describe('hideTooltip()', () => {
        it('should always set disabled=true', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
            directive['handleElementEnter']();
            expect(directive.disabled).toBe(false);

            directive['hideTooltip']();
            expect(directive.disabled).toBe(true);
        });
    });

    describe('mouseenter host binding', () => {
        it('should enable the tooltip on mouseenter over overflown content', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
            dispatchMouseEvent(el, 'mouseenter');

            expect(directive.disabled).toBe(false);
        });
    });

    describe('mouseleave host binding', () => {
        it('should disable the tooltip on mouseleave', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
            dispatchMouseEvent(el, 'mouseenter');
            expect(directive.disabled).toBe(false);

            dispatchMouseEvent(el, 'mouseleave');

            expect(directive.disabled).toBe(true);
        });
    });

    describe('resize handling', () => {
        it('should update disabled=true after debounceTime(100) on a container resize when not overflown', fakeAsync(() => {
            const { debugElement } = createComponent(SimpleTitleComponent, [provideMockResizeObserver()]);
            const directive = getTitleDirective(debugElement);

            // JSDOM defaults: all sizing = 0 → isOverflown = false → disabled = !false = true
            getResizeObserver().changes.next([]);
            tick(100);

            expect(directive.disabled).toBe(true);
        }));

        it('should set disabled=false after resize when content is overflown', fakeAsync(() => {
            const { debugElement } = createComponent(SimpleTitleComponent, [provideMockResizeObserver()]);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
            getResizeObserver().changes.next([]);
            tick(100);

            expect(directive.disabled).toBe(false);
        }));

        it('should observe the measured container instead of registering a window listener', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent, [provideMockResizeObserver()]);
            const container = debugElement.query(By.css('.container-el')).nativeElement;

            // A container-only resize (splitter drag, sidebar collapse) never fires `window:resize`,
            // so the observed target has to be the measured element itself.
            expect(getResizeObserver().observedTargets).toContain(container);
        });
    });

    describe('contentObserver subscription', () => {
        let contentObserverSubject: Subject<MutationRecord[]>;
        let fakeContentObserver: { observe: jest.Mock };

        beforeEach(() => {
            contentObserverSubject = new Subject<MutationRecord[]>();
            fakeContentObserver = { observe: jest.fn().mockReturnValue(contentObserverSubject.asObservable()) };
        });

        it('should set disabled=true when content changes and there is no overflow', fakeAsync(() => {
            const { debugElement } = createComponent(ContentObserverTitleComponent, [
                { provide: ContentObserver, useValue: fakeContentObserver }
            ]);
            const directive = getTitleDirective(debugElement);

            // throttleTime(100) leading-edge emits synchronously on the first next(),
            // so tick(0) only flushes microtasks — no need for tick(100).
            contentObserverSubject.next([]);
            tick(0);

            expect(directive.disabled).toBe(true);
        }));

        it('should update content to viewValue when content changes', fakeAsync(() => {
            const { debugElement } = createComponent(ContentObserverTitleComponent, [
                { provide: ContentObserver, useValue: fakeContentObserver }
            ]);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            el.textContent = ' Updated Text ';
            contentObserverSubject.next([]);
            tick(0);

            expect(directive.content).toBe('Updated Text');
        }));
    });

    describe('keyboard focus', () => {
        /** Mocks the host as clipped, so the tooltip is allowed to open at all. */
        const makeOverflown = (el: HTMLElement) => {
            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
        };

        it('should open the tooltip on keyboard focus of overflown content', fakeAsync(() => {
            const { debugElement } = createComponent(FocusTitleComponent);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            makeOverflown(el);
            TestBed.inject(FocusMonitor).focusVia(el, 'keyboard');
            tick();
            // enterDelay
            tick(400);

            expect(getTooltipElement()).not.toBeNull();

            flush();
        }));

        it('should enable but not open the tooltip when the content fits', fakeAsync(() => {
            const { debugElement } = createComponent(FocusTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            // JSDOM defaults: all sizing = 0 → not overflown
            TestBed.inject(FocusMonitor).focusVia(el, 'keyboard');
            tick();
            tick(400);

            expect(directive.disabled).toBe(true);
            expect(getTooltipElement()).toBeNull();

            flush();
        }));

        it('should hide the tooltip when focus arrives from a non-keyboard origin', fakeAsync(() => {
            const { debugElement } = createComponent(FocusTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const focusMonitor = TestBed.inject(FocusMonitor);

            makeOverflown(el);
            focusMonitor.focusVia(el, 'keyboard');
            tick();
            tick(400);
            expect(getTooltipElement()).not.toBeNull();

            focusMonitor.focusVia(el, 'mouse');
            tick();
            flush();

            expect(directive.disabled).toBe(true);
        }));

        it('should hide the tooltip on blur', fakeAsync(() => {
            const { debugElement } = createComponent(FocusTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const focusMonitor = TestBed.inject(FocusMonitor);

            makeOverflown(el);
            focusMonitor.focusVia(el, 'keyboard');
            tick();
            tick(400);

            el.blur();
            tick();
            flush();

            expect(directive.disabled).toBe(true);
        }));

        it('should open again on keyboard focus after a pop-up on the same host has closed', fakeAsync(() => {
            const { debugElement } = createComponent(SiblingPopupTitleComponent);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const popup = debugElement.query(By.directive(SiblingPopup)).injector.get(SiblingPopup);
            const focusMonitor = TestBed.inject(FocusMonitor);

            makeOverflown(el);
            focusMonitor.focusVia(el, 'keyboard');
            tick();
            tick(400);
            expect(getTooltipElement()).not.toBeNull();

            // The pop-up takes over the anchor, which mutes the tooltip.
            popup.open();
            tick();
            popup.close();
            popup.detach();
            flush();
            expect(getTooltipElement()).toBeNull();

            // A keyboard-only user leaves and comes back. No pointer ever touches the host, so `mouseleave`
            // never fires and the blur is the only signal that can release the mute.
            el.blur();
            tick();
            focusMonitor.focusVia(el, 'keyboard');
            tick();
            tick(400);

            expect(getTooltipElement()).not.toBeNull();

            flush();
        }));
    });

    describe('template refs (#kbqTitleText and #kbqTitleContainer)', () => {
        it('should use #kbqTitleContainer textContent for viewValue', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.viewValue).toBe('Container text');
        });

        it('should compute overflow between #kbqTitleContainer (parent) and #kbqTitleText (child)', () => {
            const { debugElement } = createComponent(WithRefsTitleComponent);
            const directive = getTitleDirective(debugElement);
            const containerEl = debugElement.query(By.css('.container-el')).nativeElement;
            const textEl = debugElement.query(By.css('.text-el')).nativeElement;

            jest.spyOn(containerEl, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(textEl, 'scrollWidth', 'get').mockReturnValue(200);

            expect(directive['isHorizontalOverflown']).toBe(true);
        });
    });

    describe('KBQ_TITLE_TEXT_REF host component', () => {
        it('should use componentInstance.textElement as child container', () => {
            const fixture = createComponent(TitleTextRefHostWrapperComponent);
            const directive = getTitleDirective(fixture.debugElement);
            const hostEl = fixture.debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const innerEl = fixture.debugElement.query(By.css('.text-ref-inner')).nativeElement;

            // parentTextElement is not provided → parent falls back to host elementRef.
            // textElement IS provided → child must be the inner span.
            jest.spyOn(hostEl, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(innerEl, 'scrollWidth', 'get').mockReturnValue(200);

            expect(directive['isHorizontalOverflown']).toBe(true);
        });
    });

    describe('tooltip integration', () => {
        it('should open tooltip for overflown text', fakeAsync(() => {
            const fixture = createComponent(OverflowTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('#overflow-text')).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(150);
            jest.spyOn(host, 'scrollWidth', 'get').mockReturnValue(300);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()).not.toBeNull();
        }));

        it('should let clicks reach whatever the hint floats over', fakeAsync(() => {
            const fixture = createComponent(OverflowTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('#overflow-text')).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(150);
            jest.spyOn(host, 'scrollWidth', 'get').mockReturnValue(300);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()!.closest('.cdk-overlay-pane')!.classList).toContain(
                'cdk-overlay-pane_ignore-pointer-events'
            );
        }));

        it('should not open tooltip for wide parent with short text', fakeAsync(() => {
            const fixture = createComponent(OverflowTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('#wide-text')).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(600);
            jest.spyOn(host, 'scrollWidth', 'get').mockReturnValue(100);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()).toBeNull();
        }));

        it('should open tooltip for overflown text with inline element', fakeAsync(() => {
            const fixture = createComponent(OverflowTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('#inline-overflow')).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(150);
            jest.spyOn(host, 'scrollWidth', 'get').mockReturnValue(300);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()).not.toBeNull();
        }));

        it('should open tooltip for overflown complex container', fakeAsync(() => {
            const fixture = createComponent(ComplexTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('#complex-overflow')).nativeElement;
            const parent = fixture.debugElement.query(By.css('#complex-overflow .parent')).nativeElement;
            const child = fixture.debugElement.query(By.css('#complex-overflow .child')).nativeElement;

            jest.spyOn(parent, 'offsetWidth', 'get').mockReturnValue(150);
            jest.spyOn(child, 'scrollWidth', 'get').mockReturnValue(300);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()).not.toBeNull();
        }));

        it('should not open tooltip for wide complex container with short text', fakeAsync(() => {
            const fixture = createComponent(ComplexTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('#complex-wide')).nativeElement;
            const parent = fixture.debugElement.query(By.css('#complex-wide .parent')).nativeElement;
            const child = fixture.debugElement.query(By.css('#complex-wide .child')).nativeElement;

            jest.spyOn(parent, 'offsetWidth', 'get').mockReturnValue(600);
            jest.spyOn(child, 'scrollWidth', 'get').mockReturnValue(100);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()).toBeNull();
        }));

        it('should open tooltip for vertical overflow', fakeAsync(() => {
            const fixture = createComponent(VerticalOverflowTooltipTitleComponent);
            const host = fixture.debugElement.query(By.css('.vertical-overflow')).nativeElement;

            jest.spyOn(host, 'offsetHeight', 'get').mockReturnValue(40);
            jest.spyOn(host, 'scrollHeight', 'get').mockReturnValue(80);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()).not.toBeNull();
        }));
    });

    describe('explicit content input ([kbq-title])', () => {
        it('should use the bound TemplateRef as tooltip content', () => {
            const { debugElement } = createComponent(TemplateContentTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.content).toBeInstanceOf(TemplateRef);
        });

        it('should use a bound string as tooltip content', () => {
            const { debugElement } = createComponent(StringContentTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.content).toBe('Explicit tooltip');
        });

        it('should fall back to host textContent for a bare kbq-title attribute', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.content).toBe('Hello World');
        });

        it('should render the TemplateRef content inside the tooltip on overflow', fakeAsync(() => {
            const fixture = createComponent(TemplateContentTitleComponent);
            const host = fixture.debugElement.query(By.css('#tpl-overflow')).nativeElement;
            const textEl = fixture.debugElement.query(By.css('.tpl-text')).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(150);
            jest.spyOn(textEl, 'scrollWidth', 'get').mockReturnValue(300);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();

            const tooltip = getTooltipElement();

            expect(tooltip).not.toBeNull();
            expect(tooltip?.textContent).toContain('Custom tooltip');
        }));

        it('should push a rebound value into an already open tooltip', fakeAsync(() => {
            const fixture = createComponent(BoundContentTitleComponent);
            const host = fixture.debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(host, 'scrollWidth', 'get').mockReturnValue(200);

            dispatchMouseEvent(host, 'mouseenter');
            fixture.detectChanges();
            flush();
            expect(getTooltipElement()?.textContent).toContain('First');

            fixture.componentInstance.tooltipText = 'Second';
            fixture.detectChanges();
            flush();

            expect(getTooltipElement()?.textContent).toContain('Second');
        }));

        it('should re-evaluate the overflow verdict when the bound value changes', fakeAsync(() => {
            const fixture = createComponent(BoundContentTitleComponent);
            const directive = getTitleDirective(fixture.debugElement);
            const host = fixture.debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(host, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(host, 'scrollWidth', 'get').mockReturnValue(200);

            fixture.componentInstance.tooltipText = 'Second';
            fixture.detectChanges();
            flush();

            expect(directive.content).toBe('Second');
            expect(directive.disabled).toBe(false);
        }));
    });

    describe('multiple #kbqTitleText children', () => {
        it('should be overflown when any child overflows', () => {
            const { debugElement } = createComponent(MultiChildTitleComponent);
            const directive = getTitleDirective(debugElement);
            const parentEl = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const valueEl = debugElement.query(By.css('.child-value')).nativeElement;

            jest.spyOn(parentEl, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(valueEl, 'scrollWidth', 'get').mockReturnValue(200);

            expect(directive.isOverflown).toBe(true);
        });

        it('should not be overflown when all children fit', () => {
            const { debugElement } = createComponent(MultiChildTitleComponent);
            const directive = getTitleDirective(debugElement);
            const parentEl = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const nameEl = debugElement.query(By.css('.child-name')).nativeElement;
            const valueEl = debugElement.query(By.css('.child-value')).nativeElement;

            jest.spyOn(parentEl, 'offsetWidth', 'get').mockReturnValue(300);
            jest.spyOn(nameEl, 'scrollWidth', 'get').mockReturnValue(100);
            jest.spyOn(valueEl, 'scrollWidth', 'get').mockReturnValue(150);

            expect(directive.isOverflown).toBe(false);
        });

        it('should NOT report a sub-pixel clip on a child without ellipsis', () => {
            const { debugElement } = createComponent(MultiChildTitleComponent);
            const directive = getTitleDirective(debugElement);
            const parentEl = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const nameEl = debugElement.query(By.css('.child-name')).nativeElement;
            const valueEl = debugElement.query(By.css('.child-value')).nativeElement;

            // Equal integer widths send both children down the sub-pixel branch, which multi-text hosts
            // used to skip entirely — a 0.4px clip is invisible under `text-overflow: clip`.
            jest.spyOn(parentEl, 'offsetWidth', 'get').mockReturnValue(124);
            jest.spyOn(nameEl, 'scrollWidth', 'get').mockReturnValue(124);
            jest.spyOn(valueEl, 'scrollWidth', 'get').mockReturnValue(124);

            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'clip' } as CSSStyleDeclaration);
            const rectSpy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
                this: Element
            ) {
                const width = this === parentEl ? 124 : 124.4;

                return { width, height: 20, top: 0, left: 0, right: width, bottom: 20 } as DOMRect;
            });

            expect(directive.isOverflown).toBe(false);

            rectSpy.mockRestore();
            cssSpy.mockRestore();
        });

        it('should report a sub-pixel overflow on a child with ellipsis', () => {
            const { debugElement } = createComponent(MultiChildTitleComponent);
            const directive = getTitleDirective(debugElement);
            const parentEl = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const nameEl = debugElement.query(By.css('.child-name')).nativeElement;
            const valueEl = debugElement.query(By.css('.child-value')).nativeElement;

            jest.spyOn(parentEl, 'offsetWidth', 'get').mockReturnValue(124);
            jest.spyOn(nameEl, 'scrollWidth', 'get').mockReturnValue(124);
            jest.spyOn(valueEl, 'scrollWidth', 'get').mockReturnValue(124);

            const cssSpy = jest
                .spyOn(window, 'getComputedStyle')
                .mockReturnValue({ textOverflow: 'ellipsis' } as CSSStyleDeclaration);
            const rectSpy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
                this: Element
            ) {
                const width = this === parentEl ? 124 : 124.4;

                return { width, height: 20, top: 0, left: 0, right: width, bottom: 20 } as DOMRect;
            });

            expect(directive.isOverflown).toBe(true);

            rectSpy.mockRestore();
            cssSpy.mockRestore();
        });
    });

    describe('teardown', () => {
        it('should unsubscribe from the shared resize observer', () => {
            const fixture = createComponent(SimpleTitleComponent, [provideMockResizeObserver()]);
            const resizeObserver = getResizeObserver();

            expect(resizeObserver.changes.observed).toBe(true);

            fixture.destroy();

            expect(resizeObserver.changes.observed).toBe(false);
        });

        it('should unsubscribe from the content observer', () => {
            const contentObserverSubject = new Subject<MutationRecord[]>();
            const fixture = createComponent(SimpleTitleComponent, [
                { provide: ContentObserver, useValue: { observe: () => contentObserverSubject.asObservable() } }
            ]);

            expect(contentObserverSubject.observed).toBe(true);

            fixture.destroy();

            expect(contentObserverSubject.observed).toBe(false);
        });

        it('should stop monitoring focus on destroy', () => {
            const fixture = createComponent(SimpleTitleComponent);

            getTitleDirective(fixture.debugElement);
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(focusMonitor, 'stopMonitoring');

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
        });

        it('should not re-evaluate overflow after destroy', fakeAsync(() => {
            const fixture = createComponent(SimpleTitleComponent, [provideMockResizeObserver()]);
            const directive = getTitleDirective(fixture.debugElement);
            const resizeObserver = getResizeObserver();

            // Nothing is overflown under JSDOM, so a surviving subscription would flip `disabled` to true.
            expect(directive.disabled).not.toBe(true);

            fixture.destroy();
            resizeObserver.changes.next([]);
            tick(100);

            expect(directive.disabled).not.toBe(true);
        }));
    });

    describe('default placementPriority', () => {
        it('should default to center-aligned placements for a bare kbq-title', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            // Only top/bottom (centered horizontally) and right/left (centered vertically) — no corner positions.
            expect(directive['placementPriority']).toEqual(['top', 'bottom', 'right', 'left']);
        });

        it('should respect an explicit kbqPlacementPriority', () => {
            const { debugElement } = createComponent(ExplicitPriorityTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive['placementPriority']).toEqual(['bottom']);
        });

        it('should not set the default priority when an explicit kbqPlacement is provided', () => {
            const { debugElement } = createComponent(ExplicitPlacementTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive['placementPriority']).toBeNull();
        });
    });
});

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title>Hello World</div>
    `
})
class SimpleTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title></div>
    `
})
class EmptyTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title><span>Some text</span></div>
    `
})
class ElementChildTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title>
            <div #kbqTitleContainer class="container-el">
                <div #kbqTitleText class="text-el">Container text</div>
            </div>
        </div>
    `
})
class WithRefsTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <button kbq-title>Focus me</button>
    `
})
class FocusTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title>{{ text }}</div>
    `
})
class ContentObserverTitleComponent {
    text = 'Initial';
}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div class="parent" id="overflow-text" kbq-title>
            {{ longValue }}
        </div>
        <div class="parent wide" id="wide-text" kbq-title>
            {{ defaultValue }}
        </div>
        <div class="parent" id="inline-overflow" kbq-title>
            <span>{{ longValue }}</span>
        </div>
    `,
    styles: `
        .parent {
            display: inline-block;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .wide {
            max-width: 600px;
        }
    `
})
class OverflowTooltipTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div id="complex-overflow" kbq-title>
            <div #kbqTitleContainer class="parent">
                <div #kbqTitleText class="child">
                    {{ longValue }}
                </div>
            </div>
        </div>

        <div id="complex-wide" kbq-title>
            <div #kbqTitleContainer class="parent wide">
                <div #kbqTitleText class="child">
                    {{ defaultValue }}
                </div>
            </div>
        </div>
    `,
    styles: `
        :host > div {
            max-width: 150px;
        }

        .parent {
            align-items: center;
            box-sizing: border-box;
            display: flex;
            flex-direction: row;
            max-width: 100%;
            position: relative;
        }

        .child {
            display: inline-block;
            flex-grow: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .wide {
            width: 600px;
        }
    `
})
class ComplexTooltipTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title class="vertical-overflow">
            {{ longValue }}
        </div>
    `,
    styles: `
        .vertical-overflow {
            display: -webkit-box;
            overflow: hidden;
            overflow-wrap: break-word;
            text-overflow: ellipsis;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            width: 200px;
        }
    `
})
class VerticalOverflowTooltipTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text and a long text and a long text`;
}

@Component({
    selector: 'title-text-ref-host',
    standalone: true,
    template: `
        <span #kbqTitleTextInner class="text-ref-inner">Inner ref text</span>
    `,
    providers: [{ provide: KBQ_TITLE_TEXT_REF, useExisting: TitleTextRefHostComponent }]
})
class TitleTextRefHostComponent implements KbqTitleTextRef {
    @ViewChild('kbqTitleTextInner', { static: true }) textElement: ElementRef;
}

@Component({
    imports: [KbqTitleDirective, TitleTextRefHostComponent],
    standalone: true,
    template: `
        <title-text-ref-host kbq-title />
    `
})
class TitleTextRefHostWrapperComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div id="tpl-overflow" [kbq-title]="tooltipTpl">
            <span #kbqTitleText class="tpl-text">{{ longValue }}</span>
        </div>
        <ng-template #tooltipTpl>
            <span class="custom-tooltip-content">Custom tooltip</span>
        </ng-template>
    `
})
class TemplateContentTitleComponent {
    defaultValue = 'Just a text';
    longValue = `${this.defaultValue} and a long text and a long text and a long text and a long text`;
}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div [kbq-title]="'Explicit tooltip'">Hello World</div>
    `
})
class StringContentTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title>
            <span #kbqTitleText class="child-name">Name</span>
            <span #kbqTitleText class="child-value">Value</span>
        </div>
    `
})
class MultiChildTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div [kbq-title]="tooltipText">Hello World</div>
    `
})
class BoundContentTitleComponent {
    tooltipText = 'First';
}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title [kbqPlacementPriority]="['bottom']">Hello World</div>
    `
})
class ExplicitPriorityTitleComponent {}

@Component({
    imports: [KbqTitleDirective],
    standalone: true,
    template: `
        <div kbq-title [kbqPlacement]="'left'">Hello World</div>
    `
})
class ExplicitPlacementTitleComponent {}

/**
 * Stand-in for a popover or dropdown sharing the host element with the title tooltip. Closing and detaching
 * are separate steps because the real pop-ups restore focus to their trigger in between.
 */
@Directive({
    selector: '[siblingPopup]',
    providers: [kbqSiblingPopupProvider(SiblingPopup)]
})
class SiblingPopup implements KbqSiblingPopup {
    isAttached = false;

    readonly openedChange = new Subject<boolean>();

    open(): void {
        this.isAttached = true;
        this.openedChange.next(true);
    }

    close(): void {
        this.openedChange.next(false);
    }

    detach(): void {
        this.isAttached = false;
    }
}

@Component({
    imports: [KbqTitleDirective, SiblingPopup],
    template: `
        <button kbq-title siblingPopup>Focus me</button>
    `
})
class SiblingPopupTitleComponent {}
