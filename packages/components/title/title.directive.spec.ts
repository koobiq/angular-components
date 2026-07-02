import { FocusMonitor } from '@angular/cdk/a11y';
import { ContentObserver } from '@angular/cdk/observers';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, DebugElement, ElementRef, TemplateRef, Type, ViewChild } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { dispatchMouseEvent, KBQ_TITLE_TEXT_REF, KbqTitleTextRef, PopUpTriggers } from '@koobiq/components/core';
import { KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';
import { KbqTitleDirective } from './title.directive';

const createComponent = <T>(component: Type<T>, providers: any[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component, NoopAnimationsModule],
        providers: [KBQ_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER, ...providers]
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

            expect(directive.hasOnlyText).toBe(true);
        });

        it('should return false when host element has element children', () => {
            const { debugElement } = createComponent(ElementChildTitleComponent);
            const directive = getTitleDirective(debugElement);

            expect(directive.hasOnlyText).toBe(false);
        });
    });

    describe('isHorizontalOverflown getter', () => {
        it('should return true when parent offsetWidth < child scrollWidth', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);

            expect(directive.isHorizontalOverflown).toBe(true);
        });

        it('should return false when parent offsetWidth >= child scrollWidth', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(200);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(100);

            expect(directive.isHorizontalOverflown).toBe(false);
        });
    });

    describe('isVerticalOverflown getter', () => {
        it('should return true when parent offsetHeight < child scrollHeight', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetHeight', 'get').mockReturnValue(30);
            jest.spyOn(el, 'scrollHeight', 'get').mockReturnValue(60);

            expect(directive.isVerticalOverflown).toBe(true);
        });

        it('should return false when parent offsetHeight >= child scrollHeight', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetHeight', 'get').mockReturnValue(60);
            jest.spyOn(el, 'scrollHeight', 'get').mockReturnValue(30);

            expect(directive.isVerticalOverflown).toBe(false);
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
            directive.handleElementEnter();

            expect(directive.disabled).toBe(false);
        });

        it('should set disabled=true when content is not overflown', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            // JSDOM defaults: all sizing = 0 → isOverflown = false
            directive.handleElementEnter();

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
            directive.handleElementEnter();
            expect(directive.disabled).toBe(false);

            directive.hideTooltip();
            expect(directive.disabled).toBe(true);
        });
    });

    describe('mouseenter host binding', () => {
        it('should call handleElementEnter on mouseenter', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const spy = jest.spyOn(directive, 'handleElementEnter');

            dispatchMouseEvent(el, 'mouseenter');

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('mouseleave host binding', () => {
        it('should call hideTooltip on mouseleave', () => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const spy = jest.spyOn(directive, 'hideTooltip');

            dispatchMouseEvent(el, 'mouseleave');

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('resizeStream', () => {
        it('should update disabled=true after debounceTime(100) on window resize when not overflown', fakeAsync(() => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);

            // JSDOM defaults: all sizing = 0 → isOverflown = false → disabled = !false = true
            window.dispatchEvent(new Event('resize'));
            tick(100);

            expect(directive.disabled).toBe(true);
        }));

        it('should set disabled=false after resize when content is overflown', fakeAsync(() => {
            const { debugElement } = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;

            jest.spyOn(el, 'offsetWidth', 'get').mockReturnValue(100);
            jest.spyOn(el, 'scrollWidth', 'get').mockReturnValue(200);
            window.dispatchEvent(new Event('resize'));
            tick(100);

            expect(directive.disabled).toBe(false);
        }));
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

    describe('focusMonitor subscription', () => {
        it('should call handleElementEnter on keyboard focus', fakeAsync(() => {
            const { debugElement } = createComponent(FocusTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(directive, 'handleElementEnter');

            focusMonitor.focusVia(el, 'keyboard');
            tick();

            expect(spy).toHaveBeenCalled();
        }));

        it('should call hideTooltip on mouse focus', fakeAsync(() => {
            const { debugElement } = createComponent(FocusTitleComponent);
            const directive = getTitleDirective(debugElement);
            const el = debugElement.query(By.directive(KbqTitleDirective)).nativeElement;
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(directive, 'hideTooltip');

            focusMonitor.focusVia(el, 'mouse');
            tick();

            expect(spy).toHaveBeenCalled();
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

            expect(directive.isHorizontalOverflown).toBe(true);
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

            expect(directive.isHorizontalOverflown).toBe(true);
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
    });

    describe('ngOnDestroy', () => {
        it('should unsubscribe resizeSubscription', () => {
            const fixture = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(fixture.debugElement);
            const spy = jest.spyOn(directive['resizeSubscription'], 'unsubscribe');

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
        });

        it('should unsubscribe contentObserverSubscription', () => {
            const fixture = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(fixture.debugElement);
            const spy = jest.spyOn(directive['contentObserverSubscription'], 'unsubscribe');

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
        });

        it('should unsubscribe focusMonitorSubscription', () => {
            const fixture = createComponent(SimpleTitleComponent);
            const directive = getTitleDirective(fixture.debugElement);
            const spy = jest.spyOn(directive['focusMonitorSubscription'], 'unsubscribe');

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
        });

        it('should call focusMonitor.stopMonitoring on destroy', () => {
            const fixture = createComponent(SimpleTitleComponent);

            getTitleDirective(fixture.debugElement);
            const focusMonitor = TestBed.inject(FocusMonitor);
            const spy = jest.spyOn(focusMonitor, 'stopMonitoring');

            fixture.destroy();

            expect(spy).toHaveBeenCalled();
        });
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
