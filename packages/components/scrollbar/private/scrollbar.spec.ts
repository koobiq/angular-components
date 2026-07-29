import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
    Provider,
    Type,
    viewChild
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { Subject } from 'rxjs';
import { KBQ_SCROLLBAR_CONFIG, KbqScrollbar, KbqScrollbarViewport, KbqScrollbarVisibility } from './scrollbar';

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({ imports: [component], providers });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const setMetrics = (el: HTMLElement, metrics: Record<string, number>): void => {
    for (const [key, value] of Object.entries(metrics)) {
        Object.defineProperty(el, key, { configurable: true, writable: true, value });
    }
};

/**
 * The actual scroll element for the non-delegated case: `KbqScrollbar` moves the host's content
 * into an auto-created `.kbq-private-scrollbar-viewport` wrapper so the track/thumb (siblings on the
 * host) aren't clipped/scrolled away by the host's own `overflow`. Scroll metrics belong on this
 * wrapper, not the host.
 */
const getAutoViewport = (host: HTMLElement): HTMLElement => host.querySelector('.kbq-private-scrollbar-viewport')!;

class MockDirectionality {
    value: 'ltr' | 'rtl' = 'ltr';
    readonly change = new Subject<'ltr' | 'rtl'>();
}

const coarsePointerWindowProvider: Provider = {
    provide: KBQ_WINDOW,
    useValue: {
        matchMedia: () => ({ matches: true }) as MediaQueryList,
        getComputedStyle: (...args: Parameters<Window['getComputedStyle']>) => window.getComputedStyle(...args)
    }
};

@Component({
    selector: 'test-scrollbar-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar data-testid="host" style="height: 100px; overflow: auto">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-disable-interaction-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar kbqScrollbarDisableInteraction data-testid="host" style="height: 100px; overflow: auto">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarDisableInteractionHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-non-floating-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar data-testid="host" style="height: 100px; overflow: auto" [kbqScrollbarFloating]="false">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarNonFloatingHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-visibility-host',
    imports: [KbqScrollbar],
    template: `
        <div
            kbqScrollbar
            data-testid="host"
            style="height: 100px; overflow: auto"
            [kbqScrollbarVisibility]="visibility"
        >
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarVisibilityHost {
    // `visibility` is a plain (non-signal) field read through an OnPush host, so writes need an
    // explicit `markForCheck()` — via this component's own injected `ChangeDetectorRef`;
    // `fixture.changeDetectorRef.markForCheck()` from outside does not mark this view dirty.
    private readonly cdr = inject(ChangeDetectorRef);
    private _visibility: KbqScrollbarVisibility = 'hover';

    get visibility(): KbqScrollbarVisibility {
        return this._visibility;
    }

    set visibility(value: KbqScrollbarVisibility) {
        this._visibility = value;
        this.cdr.markForCheck();
    }

    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-dual-overflow-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar data-testid="host" style="height: 100px; width: 100px">
            <div style="height: 500px; width: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarDualOverflowHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-viewport-host',
    imports: [KbqScrollbar, KbqScrollbarViewport],
    template: `
        <div kbqScrollbar data-testid="host">
            <div kbqScrollbarViewport data-testid="viewport" style="height: 100px; overflow: auto">
                <div style="height: 500px">content</div>
            </div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarViewportHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-virtual-host',
    imports: [KbqScrollbar, KbqScrollbarViewport, ScrollingModule],
    template: `
        <div kbqScrollbar data-testid="host">
            <cdk-virtual-scroll-viewport
                kbqScrollbarViewport
                itemSize="20"
                data-testid="viewport"
                style="height: 100px"
            >
                <div *cdkVirtualFor="let item of items" style="height: 20px">{{ item }}</div>
            </cdk-virtual-scroll-viewport>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarVirtualHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
    readonly items = Array.from({ length: 100 }, (_, i) => i);
}

@Component({
    selector: 'test-scrollbar-composed-host',
    template: `
        <div style="height: 500px">content</div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    hostDirectives: [KbqScrollbar]
})
class TestScrollbarComposedHost {}

describe(KbqScrollbar.name, () => {
    describe('basic rendering', () => {
        it('creates a vertical track and thumb by default; builds but hides the horizontal track since there is no horizontal overflow', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const horizontalTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;

            expect(host.querySelector('.kbq-private-scrollbar-track_vertical')).toBeTruthy();
            expect(host.querySelector('.kbq-private-scrollbar-thumb')).toBeTruthy();
            expect(horizontalTrack).toBeTruthy();
            expect(horizontalTrack.style.display).toBe('none');
        });

        it('keeps the track as a direct child of the host, not inside the scrolling wrapper — otherwise it would be clipped/scrolled away with the content instead of staying a fixed overlay', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;

            expect(track.parentElement).toBe(host);
            expect(scrollEl.contains(track)).toBe(false);
            expect(scrollEl.style.overflowY).toBe('auto');
        });

        it('creates both vertical and horizontal tracks by default', () => {
            const fixture = createComponent(TestScrollbarDualOverflowHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.querySelector('.kbq-private-scrollbar-track_vertical')).toBeTruthy();
            expect(host.querySelector('.kbq-private-scrollbar-track_horizontal')).toBeTruthy();
        });

        it('marks both tracks with the corner-avoidance modifier when both actually overflow', () => {
            const fixture = createComponent(TestScrollbarDualOverflowHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const verticalTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const horizontalTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;

            setMetrics(scrollEl, { clientHeight: 100, scrollHeight: 500, clientWidth: 100, scrollWidth: 500 });
            setMetrics(verticalTrack, { clientHeight: 100 });
            setMetrics(horizontalTrack, { clientWidth: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(verticalTrack.classList.contains('kbq-private-scrollbar-track_has-horizontal')).toBe(true);
            expect(horizontalTrack.classList.contains('kbq-private-scrollbar-track_has-vertical')).toBe(true);
        });

        it('does not mark the corner-avoidance modifier when only one axis actually overflows', () => {
            const fixture = createComponent(TestScrollbarDualOverflowHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const verticalTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const horizontalTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;

            // Only the vertical axis overflows this time — equal client/scroll width.
            setMetrics(scrollEl, { clientHeight: 100, scrollHeight: 500, clientWidth: 100, scrollWidth: 100 });
            setMetrics(verticalTrack, { clientHeight: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(horizontalTrack.style.display).toBe('none');
            expect(verticalTrack.classList.contains('kbq-private-scrollbar-track_has-horizontal')).toBe(false);
        });

        it('does not create track/thumb when KBQ_SCROLLBAR_CONFIG sets native: true', () => {
            const fixture = createComponent(TestScrollbarHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.querySelector('.kbq-private-scrollbar-track')).toBeNull();
        });

        it('still tracks isAtTop/isAtBottom and fires reachTop/reachBottom when native: true, despite having no track/thumb of its own', () => {
            const fixture = createComponent(TestScrollbarHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollbar = fixture.componentInstance.scrollbar();
            const topSpy = jest.fn();
            const bottomSpy = jest.fn();

            scrollbar.reachTop.subscribe(topSpy);
            scrollbar.reachBottom.subscribe(bottomSpy);

            // `native: true` never creates an auto-viewport wrapper — the host itself is the
            // effective scroll element.
            setMetrics(host, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            scrollbar.update();

            expect(scrollbar.isAtTop()).toBe(true);
            expect(scrollbar.isAtBottom()).toBe(false);
            expect(topSpy).toHaveBeenCalled();
            expect(bottomSpy).not.toHaveBeenCalled();

            setMetrics(host, { scrollTop: 400 });
            scrollbar.update();

            expect(scrollbar.isAtTop()).toBe(false);
            expect(scrollbar.isAtBottom()).toBe(true);
            expect(bottomSpy).toHaveBeenCalled();
        });

        it('adds the disable-interaction class when kbqScrollbarDisableInteraction is set', () => {
            const fixture = createComponent(TestScrollbarDisableInteractionHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.classList.contains('kbq-private-scrollbar_disable-interaction')).toBe(true);
        });

        it('does not create track/thumb on a coarse pointer', () => {
            const fixture = createComponent(TestScrollbarHost, [coarsePointerWindowProvider]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.querySelector('.kbq-private-scrollbar-track')).toBeNull();
        });

        it('hides the track when content does not overflow', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;

            setMetrics(scrollEl, { clientHeight: 500, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 500 });
            fixture.componentInstance.scrollbar().update();

            expect(track.style.display).toBe('none');
        });

        it('recovers when content overflow is detected late instead of getting stuck hidden — e.g. a CdkVirtualScrollViewport whose real scrollHeight is not known on the very first pass', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;

            // In a real browser, `clientHeight` is 0 while `display: none` and the host's real
            // size otherwise — jsdom doesn't compute layout, so this getter simulates that
            // coupling to exercise the exact trap the un-hide-before-measure ordering guards
            // against: hiding once must not make every later measurement read 0 forever after.
            Object.defineProperty(track, 'clientHeight', {
                configurable: true,
                get(this: HTMLElement) {
                    return this.style.display === 'none' ? 0 : 200;
                }
            });

            setMetrics(scrollEl, { clientHeight: 200, scrollHeight: 200 });
            fixture.componentInstance.scrollbar().update();
            expect(track.style.display).toBe('none');

            setMetrics(scrollEl, { clientHeight: 200, scrollHeight: 2000 });
            fixture.componentInstance.scrollbar().update();

            expect(track.style.display).not.toBe('none');
        });

        it('sizes the thumb proportionally to the visible ratio, clamped to the min size', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 200, scrollHeight: 500 });
            // 206, not 200: the thumb travels within the track minus a 3px gap at each end (jsdom
            // can't resolve --kbq-private-scrollbar-size-track-padding, so it falls back to the
            // same 3px default scrollbar.scss ships), so travelLength = 206 - 2*3 = 200.
            setMetrics(track, { clientHeight: 206 });
            fixture.componentInstance.scrollbar().update();

            // ratio = ceil(200/500 * 100) / 100 = 0.4; thumbSize = max(0.4 * 200, minThumbSize) = 80
            expect(thumb.style.height).toBe('80px');
            expect(thumb.style.top).toBe('3px');
        });

        it("keeps the thumb inset from the track's own start/end edges by cssTrackPadding at both scroll extremes", () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 106 });
            fixture.componentInstance.scrollbar().update();

            expect(thumb.style.top).toBe('3px');

            setMetrics(scrollEl, { scrollTop: 400 });
            fixture.componentInstance.scrollbar().update();

            const thumbBottom = parseFloat(thumb.style.top) + parseFloat(thumb.style.height);

            expect(thumbBottom).toBe(103);
        });
    });

    describe('floating', () => {
        it('reserves no layout space by default — the track/thumb float over the content', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.style.paddingRight).toBe('');
            expect(scrollEl.style.paddingBottom).toBe('');
        });

        it('kbqScrollbarFloating="false" reserves a gutter equal to the track dimension instead', () => {
            const fixture = createComponent(TestScrollbarNonFloatingHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.style.paddingRight).toBe('var(--kbq-private-scrollbar-size-track-dimension)');
            expect(scrollEl.style.paddingBottom).toBe('var(--kbq-private-scrollbar-size-track-dimension)');
        });
    });

    describe('scrollTo / scrollToElement', () => {
        it('scrollTo sets scrollTop on the effective scroll element', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            setMetrics(scrollEl, { scrollTop: 0 });
            fixture.componentInstance.scrollbar().scrollTo({ top: 42 });

            expect(scrollEl.scrollTop).toBe(42);
        });

        it('scrollToTop / scrollToBottom scroll the vertical axis', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            setMetrics(scrollEl, { scrollTop: 250, scrollHeight: 500 });

            fixture.componentInstance.scrollbar().scrollToTop();
            expect(scrollEl.scrollTop).toBe(0);

            fixture.componentInstance.scrollbar().scrollToBottom();
            expect(scrollEl.scrollTop).toBe(500);
        });

        it('scrollToElement computes independent top/left offsets from the target bounding rect', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const target = scrollEl.querySelector('div') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, scrollLeft: 0 });
            jest.spyOn(scrollEl, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 } as DOMRect);
            jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 150, left: 200 } as DOMRect);

            // Only a `top` offset is given — `left` must stay unaffected, proving the two axes are
            // independent rather than sharing a single offset value.
            fixture.componentInstance.scrollbar().scrollToElement(target, { top: 10 });

            expect(scrollEl.scrollTop).toBe(140);
            expect(scrollEl.scrollLeft).toBe(200);
        });

        it('scrollStart / scrollEnd scroll the horizontal axis', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            setMetrics(scrollEl, { scrollLeft: 40, clientWidth: 100, scrollWidth: 500 });

            fixture.componentInstance.scrollbar().scrollEnd();
            expect(scrollEl.scrollLeft).toBe(400);

            fixture.componentInstance.scrollbar().scrollStart();
            expect(scrollEl.scrollLeft).toBe(0);
        });

        it('routes scrollTo through CdkVirtualScrollViewport.scrollToOffset when delegated', () => {
            const fixture = createComponent(TestScrollbarVirtualHost);
            const scrollToOffsetSpy = jest
                .spyOn(CdkVirtualScrollViewport.prototype, 'scrollToOffset')
                .mockImplementation(() => {});

            fixture.componentInstance.scrollbar().scrollTo({ top: 123 });

            expect(scrollToOffsetSpy).toHaveBeenCalledWith(123, 'auto');
        });
    });

    describe('RTL', () => {
        it('toggles the _rtl class when Directionality changes', () => {
            const mockDir = new MockDirectionality();
            const fixture = createComponent(TestScrollbarHost, [{ provide: Directionality, useValue: mockDir }]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.classList.contains('kbq-private-scrollbar_rtl')).toBe(false);

            mockDir.value = 'rtl';
            mockDir.change.next('rtl');
            fixture.detectChanges();

            expect(host.classList.contains('kbq-private-scrollbar_rtl')).toBe(true);
        });

        it('scrollEnd scrolls to a negative scrollLeft, and scrollStart back to 0, per the CSSOM View spec', () => {
            const mockDir = new MockDirectionality();

            mockDir.value = 'rtl';

            const fixture = createComponent(TestScrollbarHost, [{ provide: Directionality, useValue: mockDir }]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            setMetrics(scrollEl, { clientWidth: 100, scrollWidth: 500 });

            fixture.componentInstance.scrollbar().scrollEnd();
            expect(scrollEl.scrollLeft).toBe(-400);

            fixture.componentInstance.scrollbar().scrollStart();
            expect(scrollEl.scrollLeft).toBe(0);
        });

        it("positions the horizontal thumb from the physical left, normalizing RTL's negative scrollLeft — at scrollLeft 0 (RTL start) the thumb sits flush with the track's physical right edge", () => {
            const mockDir = new MockDirectionality();

            mockDir.value = 'rtl';

            const fixture = createComponent(TestScrollbarHost, [{ provide: Directionality, useValue: mockDir }]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const thumb = track.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, {
                scrollLeft: 0,
                clientWidth: 100,
                scrollWidth: 500,
                clientHeight: 100,
                scrollHeight: 100
            });
            setMetrics(track, { clientWidth: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(thumb.style.width).toBe('32px');
            expect(thumb.style.left).toBe('65px');
        });
    });

    describe('visibility', () => {
        // `TestBed.tick()` is needed on top of `detectChanges()` because the mode-change reaction
        // runs in an `effect()`, which doesn't flush synchronously as part of `detectChanges()`.
        const setVisibility = (
            fixture: ComponentFixture<TestScrollbarVisibilityHost>,
            value: KbqScrollbarVisibility
        ) => {
            fixture.componentInstance.visibility = value;
            fixture.detectChanges();
            TestBed.tick();
        };

        it("reacts to kbqScrollbarVisibility switching to 'always' at runtime, without needing a hover", () => {
            const fixture = createComponent(TestScrollbarVisibilityHost);
            const visibleSpy = jest.fn();

            fixture.componentInstance.scrollbar().visibilityChange.subscribe(visibleSpy);

            setVisibility(fixture, 'always');

            expect(visibleSpy).toHaveBeenCalledWith(true);
        });

        it("hides again when switching away from 'always'", () => {
            const fixture = createComponent(TestScrollbarVisibilityHost);

            setVisibility(fixture, 'always');

            const visibleSpy = jest.fn();

            fixture.componentInstance.scrollbar().visibilityChange.subscribe(visibleSpy);

            setVisibility(fixture, 'scroll');

            expect(visibleSpy).toHaveBeenCalledWith(false);
        });

        it("switching to 'hover' while the pointer is already over the host shows it immediately, instead of waiting for the next pointerenter", () => {
            const fixture = createComponent(TestScrollbarVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            setVisibility(fixture, 'scroll');
            host.dispatchEvent(new Event('pointerenter'));

            const visibleSpy = jest.fn();

            fixture.componentInstance.scrollbar().visibilityChange.subscribe(visibleSpy);

            setVisibility(fixture, 'hover');

            expect(visibleSpy).toHaveBeenCalledWith(true);
        });

        it("stays invisible in 'hidden' mode even when hovered", () => {
            const fixture = createComponent(TestScrollbarVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            setVisibility(fixture, 'hidden');

            const visibleSpy = jest.fn();

            fixture.componentInstance.scrollbar().visibilityChange.subscribe(visibleSpy);
            host.dispatchEvent(new Event('pointerenter'));

            expect(visibleSpy).not.toHaveBeenCalledWith(true);
            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);
        });
    });

    describe('kbqScrollbarViewport delegation', () => {
        it('measures and scrolls the delegated viewport instead of the host', () => {
            const fixture = createComponent(TestScrollbarViewportHost);
            const viewport = fixture.debugElement.nativeElement.querySelector(
                '[data-testid="viewport"]'
            ) as HTMLElement;

            setMetrics(viewport, { scrollTop: 0 });

            expect(fixture.componentInstance.scrollbar().getScrollElement()).toBe(viewport);

            fixture.componentInstance.scrollbar().scrollTo({ top: 42 });

            expect(viewport.scrollTop).toBe(42);
        });
    });

    describe('composed via hostDirectives', () => {
        it('initializes when used as hostDirectives: [KbqScrollbar] rather than the [kbqScrollbar] attribute', () => {
            const fixture = createComponent(TestScrollbarComposedHost);
            const host = fixture.debugElement.nativeElement as HTMLElement;
            const scrollbar = fixture.debugElement.injector.get(KbqScrollbar);

            expect(host.classList.contains('kbq-private-scrollbar')).toBe(true);
            expect(host.querySelector('.kbq-private-scrollbar-track_vertical')).toBeTruthy();

            const scrollEl = getAutoViewport(host);

            setMetrics(scrollEl, { scrollTop: 0 });
            scrollbar.scrollTo({ top: 10 });

            expect(scrollEl.scrollTop).toBe(10);
        });
    });

    describe('reach edges', () => {
        it('reachTop / reachBottom fire for the vertical axis', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const topSpy = jest.fn();
            const bottomSpy = jest.fn();

            fixture.componentInstance.scrollbar().reachTop.subscribe(topSpy);
            fixture.componentInstance.scrollbar().reachBottom.subscribe(bottomSpy);

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(topSpy).toHaveBeenCalled();
            expect(bottomSpy).not.toHaveBeenCalled();

            setMetrics(scrollEl, { scrollTop: 400 });
            fixture.componentInstance.scrollbar().update();

            expect(bottomSpy).toHaveBeenCalled();
        });

        it('reachStart / reachEnd fire for the horizontal axis in LTR, matching the physical left/right edges', () => {
            const fixture = createComponent(TestScrollbarDualOverflowHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const vTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const hTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const startSpy = jest.fn();
            const endSpy = jest.fn();

            fixture.componentInstance.scrollbar().reachStart.subscribe(startSpy);
            fixture.componentInstance.scrollbar().reachEnd.subscribe(endSpy);

            setMetrics(scrollEl, {
                scrollLeft: 0,
                clientWidth: 100,
                scrollWidth: 500,
                clientHeight: 100,
                scrollHeight: 500
            });
            setMetrics(vTrack, { clientHeight: 100 });
            setMetrics(hTrack, { clientWidth: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(startSpy).toHaveBeenCalled();
            expect(endSpy).not.toHaveBeenCalled();

            setMetrics(scrollEl, { scrollLeft: 400 });
            fixture.componentInstance.scrollbar().update();

            expect(endSpy).toHaveBeenCalled();
        });

        it('reachStart / reachEnd flip which physical edge they fire on in RTL, matching scrollStart()/scrollEnd()', () => {
            const mockDir = new MockDirectionality();

            mockDir.value = 'rtl';

            const fixture = createComponent(TestScrollbarDualOverflowHost, [
                { provide: Directionality, useValue: mockDir }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const vTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const hTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const startSpy = jest.fn();
            const endSpy = jest.fn();

            fixture.componentInstance.scrollbar().reachStart.subscribe(startSpy);
            fixture.componentInstance.scrollbar().reachEnd.subscribe(endSpy);

            // scrollLeft: 0 is RTL's logical start — physically the right edge.
            setMetrics(scrollEl, {
                scrollLeft: 0,
                clientWidth: 100,
                scrollWidth: 500,
                clientHeight: 100,
                scrollHeight: 500
            });
            setMetrics(vTrack, { clientHeight: 100 });
            setMetrics(hTrack, { clientWidth: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(startSpy).toHaveBeenCalled();
            expect(endSpy).not.toHaveBeenCalled();

            // scrollLeft: -400 is RTL's logical end — physically the left edge.
            setMetrics(scrollEl, { scrollLeft: -400 });
            fixture.componentInstance.scrollbar().update();

            expect(endSpy).toHaveBeenCalled();
        });
    });

    describe('isAtTop / isAtBottom / isAtStart / isAtEnd', () => {
        it('isAtTop / isAtBottom track the current vertical position, not just the moment it was reached', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const scrollbar = fixture.componentInstance.scrollbar();

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 100 });
            scrollbar.update();

            expect(scrollbar.isAtTop()).toBe(true);
            expect(scrollbar.isAtBottom()).toBe(false);

            setMetrics(scrollEl, { scrollTop: 200 });
            scrollbar.update();

            expect(scrollbar.isAtTop()).toBe(false);
            expect(scrollbar.isAtBottom()).toBe(false);

            setMetrics(scrollEl, { scrollTop: 400 });
            scrollbar.update();

            expect(scrollbar.isAtBottom()).toBe(true);
        });

        it('isAtStart / isAtEnd track the current horizontal position in LTR', () => {
            const fixture = createComponent(TestScrollbarDualOverflowHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const vTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const hTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const scrollbar = fixture.componentInstance.scrollbar();

            setMetrics(scrollEl, {
                scrollLeft: 0,
                clientWidth: 100,
                scrollWidth: 500,
                clientHeight: 100,
                scrollHeight: 500
            });
            setMetrics(vTrack, { clientHeight: 100 });
            setMetrics(hTrack, { clientWidth: 100 });
            scrollbar.update();

            expect(scrollbar.isAtStart()).toBe(true);
            expect(scrollbar.isAtEnd()).toBe(false);

            setMetrics(scrollEl, { scrollLeft: 400 });
            scrollbar.update();

            expect(scrollbar.isAtStart()).toBe(false);
            expect(scrollbar.isAtEnd()).toBe(true);
        });

        it('isAtStart / isAtEnd flip which physical edge they track in RTL', () => {
            const mockDir = new MockDirectionality();

            mockDir.value = 'rtl';

            const fixture = createComponent(TestScrollbarDualOverflowHost, [
                { provide: Directionality, useValue: mockDir }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const vTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const hTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const scrollbar = fixture.componentInstance.scrollbar();

            // scrollLeft: 0 is RTL's logical start — physically the right edge.
            setMetrics(scrollEl, {
                scrollLeft: 0,
                clientWidth: 100,
                scrollWidth: 500,
                clientHeight: 100,
                scrollHeight: 500
            });
            setMetrics(vTrack, { clientHeight: 100 });
            setMetrics(hTrack, { clientWidth: 100 });
            scrollbar.update();

            expect(scrollbar.isAtStart()).toBe(true);
            expect(scrollbar.isAtEnd()).toBe(false);

            // scrollLeft: -400 is RTL's logical end — physically the left edge.
            setMetrics(scrollEl, { scrollLeft: -400 });
            scrollbar.update();

            expect(scrollbar.isAtStart()).toBe(false);
            expect(scrollbar.isAtEnd()).toBe(true);
        });

        it('reads as both at-start and at-end when there is no overflow to scroll at all', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const scrollbar = fixture.componentInstance.scrollbar();

            setMetrics(scrollEl, { clientHeight: 500, scrollHeight: 500 });
            scrollbar.update();

            expect(scrollbar.isAtTop()).toBe(true);
            expect(scrollbar.isAtBottom()).toBe(true);
        });
    });

    describe('update()', () => {
        it('recomputes and emits kbqScrollbarUpdate', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;
            const updateSpy = jest.fn();

            fixture.componentInstance.scrollbar().updated.subscribe(updateSpy);

            setMetrics(scrollEl, { scrollTop: 250, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(updateSpy).toHaveBeenCalled();
            expect(thumb.style.top).not.toBe('0px');
        });
    });
});
