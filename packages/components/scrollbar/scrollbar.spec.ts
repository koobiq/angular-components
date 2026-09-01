import { Dir } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { CdkScrollable, ScrollDispatcher, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, ElementRef, Provider, Type, viewChild } from '@angular/core';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    createMouseEvent,
    dispatchFakeEvent,
    dispatchMouseEvent,
    KbqOverflowShadowContainer
} from '@koobiq/components/core';
import { Subject } from 'rxjs';
import {
    KbqNativeScrollbar,
    KbqScrollbar,
    KbqScrollbarMode,
    kbqScrollbarOptionsProvider,
    KbqScrollbarViewport
} from './scrollbar';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

type ElementMetrics = Partial<
    Record<
        | 'clientHeight'
        | 'scrollHeight'
        | 'clientWidth'
        | 'scrollWidth'
        | 'offsetHeight'
        | 'offsetWidth'
        | 'scrollTop'
        | 'scrollLeft',
        number
    >
>;

const setMetrics = (el: HTMLElement, metrics: ElementMetrics): void => {
    for (const [key, value] of Object.entries(metrics)) {
        Object.defineProperty(el, key, { configurable: true, value });
    }
};

/** `CdkScrollable` lives on `<kbq-scrollbar>`'s own element injector (via `KbqScrollbarViewport`'s hostDirectives), not the test host root. */
const getScrollable = (fixture: ComponentFixture<unknown>): CdkScrollable =>
    fixture.debugElement.query(By.directive(KbqScrollbar)).injector.get(CdkScrollable);

// Replaces jsdom's inactive `ResizeObserver` with a controllable stream.
const createResizeTrigger = (): { provider: Provider; triggerResize: () => void } => {
    const resizes = new Subject<ResizeObserverEntry[]>();

    return {
        provider: { provide: SharedResizeObserver, useValue: { observe: () => resizes } },
        triggerResize: () => resizes.next([])
    };
};

const setRect = (el: HTMLElement, rect: Partial<DOMRect>): void => {
    jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect
    } as DOMRect);
};

describe(KbqNativeScrollbar.name, () => {
    @Component({
        selector: 'test-native-scrollbar',
        imports: [KbqNativeScrollbar],
        template: `
            <div kbqNativeScrollbar [kbqNativeScrollbarDescendants]="includeDescendants"></div>
        `
    })
    class TestNativeScrollbar {
        includeDescendants: unknown = false;
        readonly directive = viewChild.required(KbqNativeScrollbar);
        readonly host = viewChild.required(KbqNativeScrollbar, { read: ElementRef<HTMLElement> });
    }

    it('customizes only its host by default', () => {
        const fixture = createComponent(TestNativeScrollbar);
        const host = fixture.componentInstance.host().nativeElement;

        expect(fixture.componentInstance.directive().descendants()).toBe(false);
        expect(host.classList).toContain('kbq-native-scrollbar');
        expect(host.classList).not.toContain('kbq-native-scrollbar_descendants');
        expect(host.querySelector('kbq-scrollbar-track')).toBeNull();
    });

    it('coerces kbqNativeScrollbarDescendants and updates the descendants modifier', () => {
        const fixture = createComponent(TestNativeScrollbar);
        const host = fixture.componentInstance.host().nativeElement;

        fixture.componentInstance.includeDescendants = '';
        fixture.detectChanges();

        expect(fixture.componentInstance.directive().descendants()).toBe(true);
        expect(host.classList).toContain('kbq-native-scrollbar_descendants');

        fixture.componentInstance.includeDescendants = 'false';
        fixture.detectChanges();

        expect(fixture.componentInstance.directive().descendants()).toBe(false);
        expect(host.classList).not.toContain('kbq-native-scrollbar_descendants');
    });

    it('customizes the browser scrollbar when combined with KbqScrollbar in native mode', () => {
        @Component({
            selector: 'test-native-scrollbar-with-viewport',
            imports: [KbqNativeScrollbar, KbqScrollbar],
            template: `
                <kbq-scrollbar kbqNativeScrollbar kbqScrollbarMode="native">content</kbq-scrollbar>
            `
        })
        class TestNativeScrollbarWithViewport {}

        const fixture = createComponent(TestNativeScrollbarWithViewport);
        const host: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar');

        expect(host.classList).toContain('kbq-native-scrollbar');
        expect(host.classList).toContain('kbq-scrollbar-viewport');
        expect(host.classList).not.toContain('kbq-scrollbar-viewport_native-scrollbar-hidden');
        expect(host.querySelector('kbq-scrollbar-track')).toBeNull();
    });
});

describe(KbqScrollbar.name, () => {
    describe('options', () => {
        @Component({
            selector: 'test-scrollbar-default-options',
            imports: [KbqScrollbar],
            template: `
                <kbq-scrollbar>content</kbq-scrollbar>
            `
        })
        class TestScrollbarDefaultOptions {
            readonly scrollbar = viewChild.required(KbqScrollbar);
        }

        it('defaults mode to "hover"', () => {
            const fixture = createComponent(TestScrollbarDefaultOptions);

            expect(fixture.componentInstance.scrollbar().mode()).toBe('hover');
        });

        it('honors kbqScrollbarOptionsProvider at the injector level', () => {
            const fixture = createComponent(TestScrollbarDefaultOptions, [
                kbqScrollbarOptionsProvider({ mode: 'always' })
            ]);

            expect(fixture.componentInstance.scrollbar().mode()).toBe('always');
        });

        it('lets a per-instance [kbqScrollbarMode] override the injected default', () => {
            @Component({
                selector: 'test-scrollbar-mode-override',
                imports: [KbqScrollbar],
                template: `
                    <kbq-scrollbar kbqScrollbarMode="native">content</kbq-scrollbar>
                `
            })
            class TestScrollbarModeOverride {
                readonly scrollbar = viewChild.required(KbqScrollbar);
            }

            const fixture = createComponent(TestScrollbarModeOverride, [
                kbqScrollbarOptionsProvider({ mode: 'always' })
            ]);

            expect(fixture.componentInstance.scrollbar().mode()).toBe('native');
        });
    });

    describe('mode-driven rendering', () => {
        @Component({
            selector: 'test-scrollbar-mode',
            imports: [KbqScrollbar],
            template: `
                <kbq-scrollbar [kbqScrollbarMode]="mode">content</kbq-scrollbar>
            `
        })
        class TestScrollbarMode {
            mode: KbqScrollbarMode = 'hover';
        }

        const getHost = (fixture: ComponentFixture<TestScrollbarMode>) =>
            fixture.nativeElement.querySelector('kbq-scrollbar');
        const getTrack = (fixture: ComponentFixture<TestScrollbarMode>) =>
            fixture.nativeElement.querySelector('kbq-scrollbar-track');

        it.each<[KbqScrollbarMode, boolean]>([
            ['hover', true],
            ['always', true],
            ['native', false],
            ['hidden', false]
        ])('renders the custom track for mode="%s": %s', (mode, expected) => {
            const fixture = createComponent(TestScrollbarMode);

            fixture.componentInstance.mode = mode;
            fixture.detectChanges();

            expect(!!getTrack(fixture)).toBe(expected);
        });

        it.each<[KbqScrollbarMode, boolean]>([
            ['hover', true],
            ['always', true],
            ['native', false],
            ['hidden', true]
        ])('sets kbq-scrollbar-viewport_native-scrollbar-hidden for mode="%s": %s', (mode, expected) => {
            const fixture = createComponent(TestScrollbarMode);

            fixture.componentInstance.mode = mode;
            fixture.detectChanges();

            expect(getHost(fixture).classList.contains('kbq-scrollbar-viewport_native-scrollbar-hidden')).toBe(
                expected
            );
        });

        it('reacts to mode changing at runtime, creating the track once it starts being needed', () => {
            const fixture = createComponent(TestScrollbarMode);

            fixture.componentInstance.mode = 'native';
            fixture.detectChanges();

            expect(getTrack(fixture)).toBeNull();

            fixture.componentInstance.mode = 'always';
            fixture.detectChanges();

            expect(getTrack(fixture)).not.toBeNull();
        });

        it('updates mode on the same track instance rather than recreating it when switching between hover and always', () => {
            const fixture = createComponent(TestScrollbarMode);

            fixture.componentInstance.mode = 'hover';
            fixture.detectChanges();

            const trackBeforeSwitch = getTrack(fixture);

            fixture.componentInstance.mode = 'always';
            fixture.detectChanges();

            expect(getTrack(fixture)).toBe(trackBeforeSwitch);
        });

        it('destroys and recreates the track when mode leaves and re-enters native/hidden', () => {
            const fixture = createComponent(TestScrollbarMode);

            fixture.componentInstance.mode = 'hover';
            fixture.detectChanges();

            const trackBeforeSwitch = getTrack(fixture);

            fixture.componentInstance.mode = 'hidden';
            fixture.detectChanges();

            expect(getTrack(fixture)).toBeNull();

            fixture.componentInstance.mode = 'always';
            fixture.detectChanges();

            expect(getTrack(fixture)).not.toBeNull();
            expect(getTrack(fixture)).not.toBe(trackBeforeSwitch);
        });
    });

    describe('KbqScrollbarTrack visibility', () => {
        @Component({
            selector: 'test-scrollbar-track-visibility',
            imports: [KbqScrollbar],
            template: `
                <kbq-scrollbar kbqScrollbarMode="always">content</kbq-scrollbar>
            `
        })
        class TestScrollbarTrackVisibility {
            readonly scrollbar = viewChild.required(KbqScrollbar, { read: ElementRef });
        }

        const getViewportEl = (fixture: ComponentFixture<TestScrollbarTrackVisibility>): HTMLElement =>
            fixture.componentInstance.scrollbar().nativeElement;

        it('shows only the vertical bar when content overflows vertically only', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarTrackVisibility);

            setMetrics(getViewportEl(fixture), {
                clientHeight: 100,
                scrollHeight: 500,
                clientWidth: 100,
                scrollWidth: 100
            });

            tick(300);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_vertical')).not.toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_horizontal')).toBeNull();

            discardPeriodicTasks();
        }));

        it('shows only the horizontal bar when content overflows horizontally only', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarTrackVisibility);

            setMetrics(getViewportEl(fixture), {
                clientHeight: 100,
                scrollHeight: 100,
                clientWidth: 100,
                scrollWidth: 500
            });

            tick(300);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_vertical')).toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_horizontal')).not.toBeNull();

            discardPeriodicTasks();
        }));

        it('marks both bars _has-horizontal/_has-vertical when both axes overflow', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarTrackVisibility);

            setMetrics(getViewportEl(fixture), {
                clientHeight: 100,
                scrollHeight: 500,
                clientWidth: 100,
                scrollWidth: 500
            });

            tick(300);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_has-horizontal')).not.toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_has-vertical')).not.toBeNull();

            discardPeriodicTasks();
        }));

        it('shows no bars when content does not overflow, even in "always" mode', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarTrackVisibility);

            setMetrics(getViewportEl(fixture), {
                clientHeight: 100,
                scrollHeight: 100,
                clientWidth: 100,
                scrollWidth: 100
            });

            tick(300);
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar')).toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__thumb')).toBeNull();

            discardPeriodicTasks();
        }));

        it('flashScrollIndicators paints no bar when the content cannot overflow', fakeAsync(() => {
            @Component({
                selector: 'test-flash-no-overflow',
                imports: [KbqScrollbar],
                template: `
                    <kbq-scrollbar>content</kbq-scrollbar>
                `
            })
            class TestFlashNoOverflow {
                readonly scrollbar = viewChild.required(KbqScrollbar);
                readonly scrollbarEl = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
            }

            const fixture = createComponent(TestFlashNoOverflow);

            setMetrics(fixture.componentInstance.scrollbarEl().nativeElement, {
                clientHeight: 100,
                scrollHeight: 100,
                clientWidth: 100,
                scrollWidth: 100
            });

            tick(300);
            fixture.detectChanges();

            fixture.componentInstance.scrollbar().flashScrollIndicators();
            tick();
            fixture.detectChanges();

            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar')).toBeNull();
            expect(fixture.nativeElement.querySelector('.kbq-scrollbar-track__thumb')).toBeNull();

            discardPeriodicTasks();
        }));

        it('mirrors the viewport clientHeight into block-size/margin-block-end, one pixel short', fakeAsync(() => {
            const { provider, triggerResize } = createResizeTrigger();
            const fixture = createComponent(TestScrollbarTrackVisibility, [provider]);
            const trackEl: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar-track');

            setMetrics(getViewportEl(fixture), { clientHeight: 50 });

            triggerResize();
            fixture.detectChanges();

            expect(trackEl.style.blockSize).toBe('49px');
            expect(trackEl.style.marginBlockEnd).toBe('-49px');

            discardPeriodicTasks();
        }));

        it('writes no inline geometry until the ResizeObserver emits', fakeAsync(() => {
            const { provider } = createResizeTrigger();
            const fixture = createComponent(TestScrollbarTrackVisibility, [provider]);
            const trackEl: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar-track');

            setMetrics(getViewportEl(fixture), { clientHeight: 50 });

            fixture.detectChanges();

            expect(trackEl.style.blockSize).toBe('');
            expect(trackEl.style.minInlineSize).toBe('');
            expect(trackEl.style.maxInlineSize).toBe('');
            expect(trackEl.style.marginBlockEnd).toBe('');
            expect(trackEl.style.marginInlineEnd).toBe('');

            discardPeriodicTasks();
        }));

        it('lifts the track over the viewport start padding on both axes so it spans the padding box, flush and without shifting content', fakeAsync(() => {
            const { provider, triggerResize } = createResizeTrigger();
            const fixture = createComponent(TestScrollbarTrackVisibility, [provider]);
            const viewportEl = getViewportEl(fixture);
            const trackEl: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar-track');

            setMetrics(viewportEl, { clientHeight: 50, clientWidth: 30 });
            const realGetComputedStyle = window.getComputedStyle.bind(window);

            jest.spyOn(window, 'getComputedStyle').mockImplementation((el) =>
                el === viewportEl
                    ? ({ paddingBlockStart: '8px', paddingInlineStart: '6px' } as CSSStyleDeclaration)
                    : realGetComputedStyle(el)
            );

            triggerResize();
            fixture.detectChanges();

            expect(trackEl.style.blockSize).toBe('49px');
            expect(trackEl.style.marginBlockStart).toBe('-8px');
            expect(trackEl.style.insetBlockStart).toBe('-8px');
            expect(trackEl.style.marginBlockEnd).toBe('-41px');

            expect(trackEl.style.minInlineSize).toBe('29px');
            expect(trackEl.style.maxInlineSize).toBe('29px');
            expect(trackEl.style.marginInlineStart).toBe('-6px');
            expect(trackEl.style.insetInlineStart).toBe('-6px');
            expect(trackEl.style.marginInlineEnd).toBe('-23px');

            discardPeriodicTasks();
        }));

        it('toggles kbq-scrollbar-track_revealed while scrolling and clears it after scrolling stops', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarTrackVisibility);
            const trackEl: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar-track');

            expect(trackEl.classList).not.toContain('kbq-scrollbar-track_revealed');

            getViewportEl(fixture).dispatchEvent(new Event('scroll'));
            fixture.detectChanges();
            expect(trackEl.classList).toContain('kbq-scrollbar-track_revealed');

            tick(1000);
            fixture.detectChanges();
            expect(trackEl.classList).not.toContain('kbq-scrollbar-track_revealed');

            discardPeriodicTasks();
        }));

        it('flashScrollIndicators() reveals the track and clears it after hideDelay, without any scroll', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarTrackVisibility);
            const trackEl: HTMLElement = fixture.nativeElement.querySelector('kbq-scrollbar-track');
            const scrollbar: KbqScrollbar = fixture.debugElement.query(By.directive(KbqScrollbar)).componentInstance;

            expect(trackEl.classList).not.toContain('kbq-scrollbar-track_revealed');

            scrollbar.flashScrollIndicators();
            fixture.detectChanges();
            expect(trackEl.classList).toContain('kbq-scrollbar-track_revealed');

            tick(1000);
            fixture.detectChanges();
            expect(trackEl.classList).not.toContain('kbq-scrollbar-track_revealed');

            discardPeriodicTasks();
        }));

        it('is inserted as the first child of the scrollable element', () => {
            const fixture = createComponent(TestScrollbarTrackVisibility);

            expect(getViewportEl(fixture).firstChild).toBe(fixture.nativeElement.querySelector('kbq-scrollbar-track'));
        });
    });

    describe('gesture click suppression', () => {
        @Component({
            selector: 'test-scrollbar-click-suppression',
            imports: [KbqScrollbar],
            template: `
                <div (click)="hostClick()">
                    <kbq-scrollbar [kbqScrollbarMode]="mode">
                        <button type="button" class="item">item</button>
                    </kbq-scrollbar>
                </div>
            `
        })
        class TestScrollbarClickSuppression {
            mode: KbqScrollbarMode = 'always';
            readonly scrollbar = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
            readonly hostClick = jest.fn();
        }

        const setup = (fixture: ComponentFixture<TestScrollbarClickSuppression>) => {
            setMetrics(fixture.componentInstance.scrollbar().nativeElement, {
                clientHeight: 100,
                scrollHeight: 500,
                clientWidth: 100,
                scrollWidth: 100
            });

            tick(300);
            fixture.detectChanges();

            return {
                bar: fixture.nativeElement.querySelector('.kbq-scrollbar-track__bar_vertical') as HTMLElement,
                item: fixture.nativeElement.querySelector('.item') as HTMLElement,
                hostClick: fixture.componentInstance.hostClick
            };
        };

        it('swallows the click a press+release on the bar produces, so it never reaches the host', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { bar, item, hostClick } = setup(fixture);

            dispatchMouseEvent(bar, 'mousedown');
            dispatchFakeEvent(window, 'mouseup');
            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).not.toHaveBeenCalled();

            discardPeriodicTasks();
        }));

        it('leaves a click untouched when no gesture started on the bar', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { item, hostClick } = setup(fixture);

            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).toHaveBeenCalledTimes(1);

            discardPeriodicTasks();
        }));

        it('swallows only the gesture’s own click; a later unrelated click reaches the host', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { bar, item, hostClick } = setup(fixture);

            dispatchMouseEvent(bar, 'mousedown');
            dispatchFakeEvent(window, 'mouseup');
            dispatchFakeEvent(item, 'click', true);
            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).toHaveBeenCalledTimes(1);

            discardPeriodicTasks();
        }));

        it('arms on the gesture mouseup no matter how long the drag lasts', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { bar, item, hostClick } = setup(fixture);

            dispatchMouseEvent(bar, 'mousedown');
            tick(5000);
            dispatchFakeEvent(window, 'mouseup');
            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).not.toHaveBeenCalled();

            discardPeriodicTasks();
        }));

        it('does not swallow a click when the gesture produced no mouseup (released off-window)', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { bar, item, hostClick } = setup(fixture);

            dispatchMouseEvent(bar, 'mousedown');
            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).toHaveBeenCalledTimes(1);

            discardPeriodicTasks();
        }));

        it('drops the suppressor after mouseup when no click follows it', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { bar, item, hostClick } = setup(fixture);

            dispatchMouseEvent(bar, 'mousedown');
            dispatchFakeEvent(window, 'mouseup');
            tick();

            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).toHaveBeenCalledTimes(1);

            discardPeriodicTasks();
        }));

        it('drops the armed suppressor when the track is destroyed mid-gesture', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarClickSuppression);
            const { bar, item, hostClick } = setup(fixture);

            dispatchMouseEvent(bar, 'mousedown');
            dispatchFakeEvent(window, 'mouseup');
            fixture.componentInstance.mode = 'native';
            fixture.detectChanges();

            dispatchFakeEvent(item, 'click', true);

            expect(hostClick).toHaveBeenCalledTimes(1);

            discardPeriodicTasks();
        }));
    });

    describe('KbqScrollbarThumb', () => {
        @Component({
            selector: 'test-scrollbar-thumb',
            imports: [KbqScrollbarViewport],
            template: `
                <div #viewport kbqScrollbarViewport kbqScrollbarMode="always"></div>
            `
        })
        class TestScrollbarThumb {
            readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
        }

        type ThumbOrientation = 'vertical' | 'horizontal';

        const getThumbElements = (
            fixture: ComponentFixture<TestScrollbarThumb>,
            orientation: ThumbOrientation
        ): { viewport: HTMLElement; bar: HTMLElement; thumb: HTMLElement } => {
            const viewport = fixture.componentInstance.viewport().nativeElement;

            setMetrics(viewport, {
                clientHeight: 100,
                scrollHeight: 300,
                clientWidth: 100,
                scrollWidth: 300
            });

            tick(300);
            fixture.detectChanges();

            const bar = (fixture.nativeElement as HTMLElement).querySelector<HTMLElement>(
                `.kbq-scrollbar-track__bar_${orientation}`
            );
            const thumb = bar?.querySelector<HTMLElement>('.kbq-scrollbar-track__thumb');

            if (!bar || !thumb) {
                throw new Error(`Expected the ${orientation} scrollbar thumb to be rendered`);
            }

            return { viewport, bar, thumb };
        };

        it('applies top/height to a vertical thumb, not insetInlineStart/width', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, thumb } = getThumbElements(fixture, 'vertical');

            setMetrics(viewport, { scrollTop: 50, scrollHeight: 200, clientHeight: 100 });
            viewport.dispatchEvent(new Event('scroll'));

            expect(thumb.style.top).not.toBe('');
            expect(thumb.style.height).not.toBe('');
            expect(thumb.style.insetInlineStart).toBe('');

            discardPeriodicTasks();
        }));

        it('applies insetInlineStart/width to a horizontal thumb, not top/height (orientation forwarding)', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, thumb } = getThumbElements(fixture, 'horizontal');

            setMetrics(viewport, { scrollLeft: 50, scrollWidth: 200, clientWidth: 100 });
            viewport.dispatchEvent(new Event('scroll'));

            expect(thumb.style.insetInlineStart).not.toBe('');
            expect(thumb.style.width).not.toBe('');
            expect(thumb.style.top).toBe('');

            discardPeriodicTasks();
        }));

        it('drags the vertical thumb to update the viewport scrollTop, not scrollLeft', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, bar, thumb } = getThumbElements(fixture, 'vertical');

            setMetrics(thumb, { offsetHeight: 0, offsetWidth: 0 });
            setRect(thumb, { top: 0, left: 0, height: 1, width: 1 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(thumb, 'mousedown', 0, 0);
            tick();
            dispatchMouseEvent(document, 'mousemove', 50, 50);
            tick();
            dispatchMouseEvent(document, 'mouseup');
            tick();

            expect(viewport.scrollTop).toBe(100);
            expect(viewport.scrollLeft).toBe(0);

            discardPeriodicTasks();
        }));

        it('jumps to the click position when clicking the track, not the thumb', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, bar, thumb } = getThumbElements(fixture, 'vertical');

            setMetrics(thumb, { offsetHeight: 0, offsetWidth: 0 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(bar, 'mousedown', 50, 50);
            tick();

            expect(viewport.scrollTop).toBe(100);

            discardPeriodicTasks();
        }));

        // Clicking the middle of the track lands in the middle of the scroll range whatever the thumb
        // measures — anchoring the thumb by its edge instead would make the result thumb-size dependent.
        it.each([20, 40])(
            'centers a %ipx thumb under the pointer when clicking the track',
            fakeAsync((thumbSize: number) => {
                const fixture = createComponent(TestScrollbarThumb);
                const { viewport, bar, thumb } = getThumbElements(fixture, 'vertical');

                setMetrics(thumb, { offsetHeight: thumbSize, offsetWidth: thumbSize });
                setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

                dispatchMouseEvent(bar, 'mousedown', 50, 50);
                tick();

                expect(viewport.scrollTop).toBe(100);

                discardPeriodicTasks();
            })
        );

        // Documents the current behavior: unlike native scrollbars, the track answers to every button.
        it.each<[string, number]>([
            ['left', 0],
            ['middle', 1],
            ['right', 2]
        ])(
            'scrolls on a track click made with the %s button',
            fakeAsync((_: string, button: number) => {
                const fixture = createComponent(TestScrollbarThumb);
                const { viewport, bar, thumb } = getThumbElements(fixture, 'vertical');

                setMetrics(thumb, { offsetHeight: 0, offsetWidth: 0 });
                setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

                dispatchMouseEvent(bar, 'mousedown', 50, 50, createMouseEvent('mousedown', 50, 50, button));
                tick();

                expect(viewport.scrollTop).toBe(100);

                discardPeriodicTasks();
            })
        );

        it('drags the horizontal thumb to update the viewport scrollLeft, not scrollTop', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, bar, thumb } = getThumbElements(fixture, 'horizontal');

            setMetrics(thumb, { offsetHeight: 0, offsetWidth: 0 });
            setRect(thumb, { top: 0, left: 0, height: 1, width: 1 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(thumb, 'mousedown', 0, 0);
            tick();
            dispatchMouseEvent(document, 'mousemove', 50, 50);
            tick();
            dispatchMouseEvent(document, 'mouseup');
            tick();

            expect(viewport.scrollLeft).toBe(100);
            expect(viewport.scrollTop).toBe(0);

            discardPeriodicTasks();
        }));

        it('negates the horizontal offset in RTL when clicking the track', fakeAsync(() => {
            @Component({
                selector: 'test-scrollbar-thumb-rtl',
                imports: [Dir, KbqScrollbarViewport],
                template: `
                    <div #viewport kbqScrollbarViewport kbqScrollbarMode="always" dir="rtl"></div>
                `
            })
            class TestScrollbarThumbRtl extends TestScrollbarThumb {}

            const fixture = createComponent(TestScrollbarThumbRtl);
            const { viewport, bar, thumb } = getThumbElements(fixture, 'horizontal');

            setMetrics(thumb, { offsetHeight: 0, offsetWidth: 0 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(bar, 'mousedown', 50, 50);
            tick();

            // Mirrors the LTR "jumps to the click position" test's +100, negated: RTL measures the
            // click offset from the track's right edge instead of its left.
            expect(viewport.scrollLeft).toBe(-100);

            discardPeriodicTasks();
        }));

        it('centers the thumb under the pointer when clicking the horizontal track', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, bar, thumb } = getThumbElements(fixture, 'horizontal');

            setMetrics(thumb, { offsetHeight: 20, offsetWidth: 20 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(bar, 'mousedown', 50, 50);
            tick();

            expect(viewport.scrollLeft).toBe(100);

            discardPeriodicTasks();
        }));

        it('centers the thumb under the pointer when clicking the horizontal track in RTL', fakeAsync(() => {
            @Component({
                selector: 'test-scrollbar-thumb-rtl-centering',
                imports: [Dir, KbqScrollbarViewport],
                template: `
                    <div #viewport kbqScrollbarViewport kbqScrollbarMode="always" dir="rtl"></div>
                `
            })
            class TestScrollbarThumbRtlCentering extends TestScrollbarThumb {}

            const fixture = createComponent(TestScrollbarThumbRtlCentering);
            const { viewport, bar, thumb } = getThumbElements(fixture, 'horizontal');

            setMetrics(thumb, { offsetHeight: 20, offsetWidth: 20 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(bar, 'mousedown', 50, 50);
            tick();

            // Half the thumb is added back towards the track's right edge, mirroring the LTR case:
            // subtracting it instead would overshoot to -150.
            expect(viewport.scrollLeft).toBe(-100);

            discardPeriodicTasks();
        }));

        it('detects RTL from a bare dir="rtl" ancestor without CDK Dir/BidiModule', fakeAsync(() => {
            @Component({
                selector: 'test-scrollbar-thumb-rtl-bare',
                imports: [KbqScrollbarViewport],
                template: `
                    <div dir="rtl">
                        <div #viewport kbqScrollbarViewport kbqScrollbarMode="always"></div>
                    </div>
                `
            })
            class TestScrollbarThumbRtlBare extends TestScrollbarThumb {}

            const fixture = createComponent(TestScrollbarThumbRtlBare);
            const { bar, thumb, viewport } = getThumbElements(fixture, 'horizontal');

            setMetrics(thumb, { offsetHeight: 0, offsetWidth: 0 });
            setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

            dispatchMouseEvent(bar, 'mousedown', 50, 50);
            tick();

            expect(viewport.scrollLeft).toBe(-100);

            discardPeriodicTasks();
        }));

        it('reserves top-offset room for the CSS-enforced min thumb size on very long content', fakeAsync(() => {
            const fixture = createComponent(TestScrollbarThumb);
            const { viewport, thumb } = getThumbElements(fixture, 'vertical');

            // Content is long enough that the natural view fraction (1%) is far below what the
            // CSS-enforced min thumb box size (32px min-size + 3px gap on each side = 38px) would
            // need — the compensation formula should reserve 38% of top-offset room so the
            // min-size thumb still reaches the track's bottom edge instead of overhanging it.
            setMetrics(viewport, { scrollTop: 9900, scrollHeight: 10000, clientHeight: 100 });
            viewport.dispatchEvent(new Event('scroll'));

            expect(parseFloat(thumb.style.top)).toBeCloseTo(62, 5);

            discardPeriodicTasks();
        }));

        describe('ARIA', () => {
            it('marks the thumb with role="scrollbar"', fakeAsync(() => {
                const fixture = createComponent(TestScrollbarThumb);
                const { thumb } = getThumbElements(fixture, 'vertical');

                expect(thumb.getAttribute('role')).toBe('scrollbar');

                discardPeriodicTasks();
            }));

            it.each<['vertical' | 'horizontal']>([['vertical'], ['horizontal']])(
                'sets aria-orientation to the current orientation: %s',
                fakeAsync((orientation) => {
                    const fixture = createComponent(TestScrollbarThumb);
                    const { thumb } = getThumbElements(fixture, orientation);

                    expect(thumb.getAttribute('aria-orientation')).toBe(orientation);

                    discardPeriodicTasks();
                })
            );

            it('points aria-controls at the viewport element', fakeAsync(() => {
                const fixture = createComponent(TestScrollbarThumb);
                const { viewport, thumb } = getThumbElements(fixture, 'vertical');

                expect(viewport.id).not.toBe('');
                expect(thumb.getAttribute('aria-controls')).toBe(viewport.id);

                discardPeriodicTasks();
            }));

            it('sets a fixed 0/100 aria-valuemin/aria-valuemax percentage range', fakeAsync(() => {
                const fixture = createComponent(TestScrollbarThumb);
                const { thumb } = getThumbElements(fixture, 'vertical');

                expect(thumb.getAttribute('aria-valuemin')).toBe('0');
                expect(thumb.getAttribute('aria-valuemax')).toBe('100');

                discardPeriodicTasks();
            }));

            it('sets aria-valuenow when the thumb is created', fakeAsync(() => {
                const fixture = createComponent(TestScrollbarThumb);
                const { thumb } = getThumbElements(fixture, 'vertical');

                expect(thumb.getAttribute('aria-valuenow')).not.toBeNull();

                discardPeriodicTasks();
            }));

            it('reflects the scrolled percentage in aria-valuenow', fakeAsync(() => {
                const fixture = createComponent(TestScrollbarThumb);
                const { viewport, thumb } = getThumbElements(fixture, 'vertical');

                setMetrics(viewport, { scrollTop: 0, scrollHeight: 300, clientHeight: 100 });
                viewport.dispatchEvent(new Event('scroll'));
                expect(thumb.getAttribute('aria-valuenow')).toBe('0');

                setMetrics(viewport, { scrollTop: 100, scrollHeight: 300, clientHeight: 100 });
                viewport.dispatchEvent(new Event('scroll'));
                expect(thumb.getAttribute('aria-valuenow')).toBe('50');

                setMetrics(viewport, { scrollTop: 200, scrollHeight: 300, clientHeight: 100 });
                viewport.dispatchEvent(new Event('scroll'));
                expect(thumb.getAttribute('aria-valuenow')).toBe('100');

                discardPeriodicTasks();
            }));

            it('defaults aria-valuenow to 0 rather than NaN when there is nothing to scroll', fakeAsync(() => {
                const fixture = createComponent(TestScrollbarThumb);
                const { viewport, thumb } = getThumbElements(fixture, 'vertical');

                setMetrics(viewport, { scrollTop: 0, scrollHeight: 100, clientHeight: 100 });
                viewport.dispatchEvent(new Event('scroll'));

                expect(thumb.getAttribute('aria-valuenow')).toBe('0');

                discardPeriodicTasks();
            }));
        });
    });

    describe('scroll-to API', () => {
        @Component({
            selector: 'test-scrollbar-scroll-to',
            imports: [KbqScrollbar],
            template: `
                <kbq-scrollbar kbqScrollbarMode="always" style="height: 100px">
                    <div #target style="margin-top: 40px">target</div>
                </kbq-scrollbar>
            `
        })
        class TestScrollbarScrollTo {
            readonly scrollbar = viewChild.required(KbqScrollbar);
            readonly scrollbarEl = viewChild.required(KbqScrollbar, { read: ElementRef<HTMLElement> });
            readonly target = viewChild.required<ElementRef<HTMLElement>>('target');
        }

        const spyOnScrollTo = (fixture: ComponentFixture<TestScrollbarScrollTo>) =>
            jest.spyOn(getScrollable(fixture), 'scrollTo').mockImplementation();

        it('scrollTo delegates to CdkScrollable.scrollTo', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollTo({ top: 10, left: 20, behavior: 'smooth' });

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 10, left: 20, behavior: 'smooth' });
        });

        it('scrollToTop scrolls to top: 0', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollToTop('smooth');

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        });

        it('scrollToBottom scrolls to top: scrollHeight', () => {
            const fixture = createComponent(TestScrollbarScrollTo);

            setMetrics(fixture.componentInstance.scrollbarEl().nativeElement, { scrollHeight: 999 });
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollToBottom();

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 999, behavior: undefined });
        });

        it('scrollStart scrolls to start: 0', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollStart();

            expect(scrollToSpy).toHaveBeenCalledWith({ start: 0, behavior: undefined });
        });

        it('scrollEnd scrolls to end: 0', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollEnd();

            expect(scrollToSpy).toHaveBeenCalledWith({ end: 0, behavior: undefined });
        });

        it('scrollToElement accepts an HTMLElement target', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollToElement(fixture.componentInstance.target().nativeElement);

            expect(scrollToSpy).toHaveBeenCalled();
        });

        it('scrollToElement accepts a selector string resolved against the scrollbar', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollToElement('div');

            expect(scrollToSpy).toHaveBeenCalled();
        });

        it('scrollToElement no-ops for an unmatched selector', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollToElement('.does-not-exist');

            expect(scrollToSpy).not.toHaveBeenCalled();
        });

        it('scrollToElement applies top/left gap options', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const target = fixture.componentInstance.target().nativeElement;

            Object.defineProperty(target, 'offsetTop', { configurable: true, value: 100 });
            Object.defineProperty(target, 'offsetLeft', { configurable: true, value: 100 });
            Object.defineProperty(target, 'offsetParent', { configurable: true, value: null });

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollToElement(target, { top: 16, left: 16 });

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 84, left: 84, behavior: undefined });
        });

        it('scrollIntoView centers the target within the viewport', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const scrollbarEl = fixture.componentInstance.scrollbarEl().nativeElement;
            const target = fixture.componentInstance.target().nativeElement;

            setMetrics(scrollbarEl, { clientHeight: 100, clientWidth: 100 });
            Object.defineProperty(target, 'offsetTop', { configurable: true, value: 200 });
            Object.defineProperty(target, 'offsetLeft', { configurable: true, value: 200 });
            Object.defineProperty(target, 'offsetParent', { configurable: true, value: null });
            Object.defineProperty(target, 'offsetHeight', { configurable: true, value: 50 });
            Object.defineProperty(target, 'offsetWidth', { configurable: true, value: 50 });

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollIntoView(target);

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 175, left: 175 });
        });

        /**
         * Places the scrollport and the target in one coordinate space, the way `scrollIntoViewNearest`
         * reads them: the scrollport's rect sits at y=0, and the target's rect is the position it would
         * paint at for the given `scrollTop` — i.e. its offset in the content, minus how far it is scrolled.
         */
        const placeTarget = (
            viewport: HTMLElement,
            target: HTMLElement,
            content: { offsetTop: number; height: number; offsetLeft: number; width: number },
            scroll: { top: number; left: number }
        ) => {
            setRect(viewport, { top: 0, left: 0, width: 100, height: 100 });
            setRect(target, {
                top: content.offsetTop - scroll.top,
                left: content.offsetLeft - scroll.left,
                width: content.width,
                height: content.height
            });
        };

        it('scrollIntoViewNearest aligns a target above the scrollport to its start edge', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const target = fixture.componentInstance.target().nativeElement;

            setMetrics(fixture.componentInstance.scrollbarEl().nativeElement, {
                clientHeight: 100,
                clientWidth: 100,
                scrollTop: 200,
                scrollLeft: 0
            });
            placeTarget(
                fixture.componentInstance.scrollbarEl().nativeElement,
                target,
                { offsetTop: 50, height: 50, offsetLeft: 0, width: 50 },
                { top: 200, left: 0 }
            );

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollIntoViewNearest(target);

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 50, left: 0 });
        });

        it('scrollIntoViewNearest aligns a target below the scrollport to its end edge', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const target = fixture.componentInstance.target().nativeElement;

            setMetrics(fixture.componentInstance.scrollbarEl().nativeElement, {
                clientHeight: 100,
                clientWidth: 100,
                scrollTop: 0,
                scrollLeft: 0
            });
            placeTarget(
                fixture.componentInstance.scrollbarEl().nativeElement,
                target,
                { offsetTop: 200, height: 50, offsetLeft: 0, width: 50 },
                { top: 0, left: 0 }
            );

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollIntoViewNearest(target);

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 150, left: 0 });
        });

        it('scrollIntoViewNearest leaves a fully visible target where it is', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const target = fixture.componentInstance.target().nativeElement;

            setMetrics(fixture.componentInstance.scrollbarEl().nativeElement, {
                clientHeight: 100,
                clientWidth: 100,
                scrollTop: 100,
                scrollLeft: 0
            });
            placeTarget(
                fixture.componentInstance.scrollbarEl().nativeElement,
                target,
                { offsetTop: 120, height: 20, offsetLeft: 0, width: 50 },
                { top: 100, left: 0 }
            );

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollIntoViewNearest(target);

            expect(scrollToSpy).not.toHaveBeenCalled();
        });

        it('scrollIntoViewNearest brings the inline axis into view as well', () => {
            const fixture = createComponent(TestScrollbarScrollTo);
            const target = fixture.componentInstance.target().nativeElement;

            setMetrics(fixture.componentInstance.scrollbarEl().nativeElement, {
                clientHeight: 100,
                clientWidth: 100,
                scrollTop: 0,
                scrollLeft: 0
            });
            placeTarget(
                fixture.componentInstance.scrollbarEl().nativeElement,
                target,
                { offsetTop: 0, height: 20, offsetLeft: 200, width: 50 },
                { top: 0, left: 0 }
            );

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.scrollbar().scrollIntoViewNearest(target);

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, left: 150 });
        });
    });

    describe('scrollChanges', () => {
        @Component({
            selector: 'test-scrollbar-scroll-changes',
            imports: [KbqScrollbar],
            template: `
                <kbq-scrollbar kbqScrollbarMode="always">content</kbq-scrollbar>
            `
        })
        class TestScrollbarScrollChanges {
            readonly scrollbar = viewChild.required(KbqScrollbar);
        }

        it('emits on the native scroll event', () => {
            const fixture = createComponent(TestScrollbarScrollChanges);
            const scrollbar = fixture.componentInstance.scrollbar();
            const handler = jest.fn();

            scrollbar.scrollChanges.subscribe(handler);
            scrollbar.getNativeElement().dispatchEvent(new Event('scroll'));

            expect(handler).toHaveBeenCalledTimes(1);
        });
    });

    describe('kbqOverflowShadowContainer integration', () => {
        it('a co-located kbqOverflowShadowContainer tracks scroll via the native fallback (no KBQ_OVERFLOW_SHADOW_SOURCE wiring needed — the scrollbar host is the scroll element itself)', () => {
            @Component({
                selector: 'test-scrollbar-overflow-shadow-container',
                imports: [KbqScrollbar, KbqOverflowShadowContainer],
                template: `
                    <kbq-scrollbar
                        #container="kbqOverflowShadowContainer"
                        kbqOverflowShadowContainer
                        kbqScrollbarMode="always"
                    >
                        content
                    </kbq-scrollbar>
                `
            })
            class TestScrollbarOverflowShadowContainer {
                readonly scrollbar = viewChild.required(KbqScrollbar);
                readonly container = viewChild.required(KbqOverflowShadowContainer);
            }

            const fixture = createComponent(TestScrollbarOverflowShadowContainer);
            const { scrollbar, container } = fixture.componentInstance;

            setMetrics(scrollbar().getNativeElement(), { scrollTop: 0, clientHeight: 100, scrollHeight: 300 });
            container().checkOverflow();

            expect(container().overflow()).toEqual({ top: false, bottom: true });

            setMetrics(scrollbar().getNativeElement(), { scrollTop: 50, clientHeight: 100, scrollHeight: 300 });
            scrollbar().getNativeElement().dispatchEvent(new Event('scroll'));

            expect(container().overflow()).toEqual({ top: true, bottom: true });
        });
    });

    describe(KbqScrollbarViewport.name, () => {
        @Component({
            selector: 'test-standalone-viewport',
            imports: [KbqScrollbarViewport],
            template: `
                <div kbqScrollbarViewport style="height: 100px" [kbqScrollbarMode]="mode">
                    <div #target style="margin-top: 40px">target</div>
                </div>
            `
        })
        class TestStandaloneViewport {
            mode: KbqScrollbarMode | undefined;
            readonly viewport = viewChild.required(KbqScrollbarViewport);
            readonly viewportEl = viewChild.required(KbqScrollbarViewport, { read: ElementRef<HTMLElement> });
            readonly scrollable = viewChild.required(CdkScrollable);
            readonly target = viewChild.required<ElementRef<HTMLElement>>('target');
        }

        const spyOnScrollTo = (fixture: ComponentFixture<TestStandaloneViewport>) =>
            jest
                .spyOn(
                    fixture.debugElement.query(By.directive(KbqScrollbarViewport)).injector.get(CdkScrollable),
                    'scrollTo'
                )
                .mockImplementation();

        describe('ScrollDispatcher registration', () => {
            @Component({
                selector: 'test-virtual-viewport-registration',
                imports: [ScrollingModule, KbqScrollbarViewport],
                template: `
                    <cdk-virtual-scroll-viewport kbqScrollbarViewport itemSize="20" style="height: 100px">
                        <div *cdkVirtualFor="let item of items" style="height: 20px">{{ item }}</div>
                    </cdk-virtual-scroll-viewport>
                `
            })
            class TestVirtualViewportRegistration {
                readonly items = Array.from({ length: 50 }, (_, i) => i);
                readonly viewport = viewChild.required(KbqScrollbarViewport);
                readonly viewportEl = viewChild.required(KbqScrollbarViewport, { read: ElementRef<HTMLElement> });
            }

            const registrationsFor = (el: HTMLElement): CdkScrollable[] =>
                [...TestBed.inject(ScrollDispatcher).scrollContainers.keys()].filter(
                    (scrollable) => scrollable.getElementRef().nativeElement === el
                );

            it('keeps a single registration for a virtual-scroll viewport, and it is the one the directive uses', () => {
                const fixture = createComponent(TestVirtualViewportRegistration);
                const el = fixture.componentInstance.viewportEl().nativeElement;
                const injected = fixture.debugElement
                    .query(By.directive(KbqScrollbarViewport))
                    .injector.get(CdkScrollable);

                const registered = registrationsFor(el);

                expect(registered).toEqual([injected]);
            });

            it('emits once per scroll for a virtual-scroll viewport', () => {
                const fixture = createComponent(TestVirtualViewportRegistration);
                const el = fixture.componentInstance.viewportEl().nativeElement;
                const scrolled = jest.fn();
                const subscription = TestBed.inject(ScrollDispatcher).scrolled(0).subscribe(scrolled);

                dispatchFakeEvent(el, 'scroll');

                expect(scrolled).toHaveBeenCalledTimes(1);

                subscription.unsubscribe();
            });

            it('leaves the sole registration of a plain viewport untouched', () => {
                @Component({
                    selector: 'test-plain-viewport-registration',
                    imports: [KbqScrollbarViewport],
                    template: `
                        <div kbqScrollbarViewport style="height: 100px"></div>
                    `
                })
                class TestPlainViewportRegistration {
                    readonly viewportEl = viewChild.required(KbqScrollbarViewport, { read: ElementRef<HTMLElement> });
                }

                const fixture = createComponent(TestPlainViewportRegistration);
                const el = fixture.componentInstance.viewportEl().nativeElement;

                expect(registrationsFor(el).length).toBe(1);
            });
        });

        it('exposes CdkScrollable on the same host element when used standalone', () => {
            const fixture = createComponent(TestStandaloneViewport);

            expect(fixture.componentInstance.scrollable().getElementRef().nativeElement).toBe(
                fixture.componentInstance.viewportEl().nativeElement
            );
        });

        describe('id', () => {
            it('generates an id when the host element does not already have one', () => {
                const fixture = createComponent(TestStandaloneViewport);

                expect(fixture.componentInstance.viewportEl().nativeElement.id).not.toBe('');
            });

            it('preserves an id the consumer already set instead of overwriting it', () => {
                @Component({
                    selector: 'test-standalone-viewport-existing-id',
                    imports: [KbqScrollbarViewport],
                    template: `
                        <div kbqScrollbarViewport id="consumer-id"></div>
                    `
                })
                class TestStandaloneViewportExistingId {
                    readonly viewportEl = viewChild.required(KbqScrollbarViewport, { read: ElementRef<HTMLElement> });
                }

                const fixture = createComponent(TestStandaloneViewportExistingId);

                expect(fixture.componentInstance.viewportEl().nativeElement.id).toBe('consumer-id');
            });

            it('preserves an id the consumer binds via [id] instead of overwriting it', () => {
                @Component({
                    selector: 'test-standalone-viewport-bound-id',
                    imports: [KbqScrollbarViewport],
                    template: `
                        <div kbqScrollbarViewport [id]="boundId"></div>
                    `
                })
                class TestStandaloneViewportBoundId {
                    boundId = 'bound-consumer-id';
                    readonly viewportEl = viewChild.required(KbqScrollbarViewport, { read: ElementRef<HTMLElement> });
                }

                const fixture = createComponent(TestStandaloneViewportBoundId);

                expect(fixture.componentInstance.viewportEl().nativeElement.id).toBe('bound-consumer-id');
            });

            it('generates different ids for different instances', () => {
                @Component({
                    selector: 'test-standalone-viewport-pair',
                    imports: [KbqScrollbarViewport],
                    template: `
                        <div kbqScrollbarViewport></div>
                        <div kbqScrollbarViewport></div>
                    `
                })
                class TestStandaloneViewportPair {}

                const fixture = createComponent(TestStandaloneViewportPair);
                const ids = fixture.debugElement
                    .queryAll(By.directive(KbqScrollbarViewport))
                    .map((debugEl) => debugEl.nativeElement.id);

                expect(ids[0]).not.toBe(ids[1]);
            });
        });

        it('defaults mode from KBQ_SCROLLBAR_OPTIONS when used standalone', () => {
            // No [kbqScrollbarMode] binding at all here — even binding to `undefined` counts as "a value was
            // provided" and would bypass input()'s default-value fallback.
            @Component({
                selector: 'test-standalone-viewport-default-mode',
                imports: [KbqScrollbarViewport],
                template: `
                    <div kbqScrollbarViewport></div>
                `
            })
            class TestStandaloneViewportDefaultMode {
                readonly viewport = viewChild.required(KbqScrollbarViewport);
            }

            const fixture = createComponent(TestStandaloneViewportDefaultMode, [
                kbqScrollbarOptionsProvider({ mode: 'always' })
            ]);

            expect(fixture.componentInstance.viewport().mode()).toBe('always');
        });

        it.each<[KbqScrollbarMode, boolean]>([
            ['hover', true],
            ['always', true],
            ['native', false],
            ['hidden', true]
        ])('sets kbq-scrollbar-viewport_native-scrollbar-hidden for mode="%s": %s', (mode, expected) => {
            const fixture = createComponent(TestStandaloneViewport);

            fixture.componentInstance.mode = mode;
            fixture.detectChanges();

            expect(
                fixture.componentInstance
                    .viewportEl()
                    .nativeElement.classList.contains('kbq-scrollbar-viewport_native-scrollbar-hidden')
            ).toBe(expected);
        });

        it.each<[KbqScrollbarMode, boolean]>([
            ['hover', true],
            ['always', true],
            ['native', false],
            ['hidden', false]
        ])('creates the track for the standalone viewport too, for mode="%s": %s', (mode, expected) => {
            const fixture = createComponent(TestStandaloneViewport);

            fixture.componentInstance.mode = mode;
            fixture.detectChanges();

            const trackEl = fixture.nativeElement.querySelector('kbq-scrollbar-track');

            expect(!!trackEl).toBe(expected);

            if (expected) {
                expect(fixture.componentInstance.viewportEl().nativeElement.firstChild).toBe(trackEl);
            }
        });

        it('scrollTo delegates to CdkScrollable.scrollTo', () => {
            const fixture = createComponent(TestStandaloneViewport);
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.viewport().scrollTo({ top: 10, left: 20, behavior: 'smooth' });

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 10, left: 20, behavior: 'smooth' });
        });

        it('scrollToBottom scrolls to top: scrollHeight', () => {
            const fixture = createComponent(TestStandaloneViewport);

            setMetrics(fixture.componentInstance.viewportEl().nativeElement, { scrollHeight: 999 });
            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.viewport().scrollToBottom();

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 999, behavior: undefined });
        });

        it('scrollToElement accepts an HTMLElement target and applies top/left gap options', () => {
            const fixture = createComponent(TestStandaloneViewport);
            const target = fixture.componentInstance.target().nativeElement;

            Object.defineProperty(target, 'offsetTop', { configurable: true, value: 100 });
            Object.defineProperty(target, 'offsetLeft', { configurable: true, value: 100 });
            Object.defineProperty(target, 'offsetParent', { configurable: true, value: null });

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.viewport().scrollToElement(target, { top: 16, left: 16 });

            expect(scrollToSpy).toHaveBeenCalledWith({ top: 84, left: 84, behavior: undefined });
        });

        it('scrollIntoView centers the target within the viewport', () => {
            const fixture = createComponent(TestStandaloneViewport);
            const viewportEl = fixture.componentInstance.viewportEl().nativeElement;
            const target = fixture.componentInstance.target().nativeElement;

            setMetrics(viewportEl, { clientHeight: 100, clientWidth: 100 });
            Object.defineProperty(target, 'offsetTop', { configurable: true, value: 200 });
            Object.defineProperty(target, 'offsetLeft', { configurable: true, value: 200 });
            Object.defineProperty(target, 'offsetParent', { configurable: true, value: null });
            Object.defineProperty(target, 'offsetHeight', { configurable: true, value: 50 });
            Object.defineProperty(target, 'offsetWidth', { configurable: true, value: 50 });

            const scrollToSpy = spyOnScrollTo(fixture);

            fixture.componentInstance.viewport().scrollIntoView(target);

            // top/left = offset + size/2 - viewportSize/2 = 200 + 25 - 50 = 175
            expect(scrollToSpy).toHaveBeenCalledWith({ top: 175, left: 175 });
        });
    });
});
