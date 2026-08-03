import { Directionality } from '@angular/cdk/bidi';
import { CdkVirtualScrollViewport, ScrollDispatcher, ScrollingModule } from '@angular/cdk/scrolling';
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
import { KBQ_SCROLLBAR_CONFIG, KbqScrollbar, KbqScrollbarVirtualViewport, KbqScrollbarVisibility } from './scrollbar';

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
    selector: 'test-scrollbar-padding-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar data-testid="host" style="height: 100px; overflow: auto; padding: 10px 20px 30px 40px">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarPaddingHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-disable-drag-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar kbqScrollbarDisableDrag data-testid="host" style="height: 100px; overflow: auto">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarDisableDragHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

@Component({
    selector: 'test-scrollbar-disable-click-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar kbqScrollbarDisableClick data-testid="host" style="height: 100px; overflow: auto">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarDisableClickHost {
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
    selector: 'test-scrollbar-dynamic-floating-host',
    imports: [KbqScrollbar],
    template: `
        <div kbqScrollbar data-testid="host" style="height: 100px; overflow: auto" [kbqScrollbarFloating]="floating">
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarDynamicFloatingHost {
    // Same `markForCheck()` requirement as `TestScrollbarVisibilityHost` — a plain (non-signal)
    // field read through an OnPush host needs it, and `fixture.changeDetectorRef.markForCheck()`
    // from outside doesn't mark this view dirty.
    private readonly cdr = inject(ChangeDetectorRef);
    private _floating = true;

    get floating(): boolean {
        return this._floating;
    }

    set floating(value: boolean) {
        this._floating = value;
        this.cdr.markForCheck();
    }

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
    selector: 'test-scrollbar-virtual-host',
    imports: [KbqScrollbar, KbqScrollbarVirtualViewport, ScrollingModule],
    template: `
        <div kbqScrollbar data-testid="host">
            <cdk-virtual-scroll-viewport
                kbqScrollbarVirtualViewport
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
    selector: 'test-scrollbar-virtual-horizontal-host',
    imports: [KbqScrollbar, KbqScrollbarVirtualViewport, ScrollingModule],
    template: `
        <div kbqScrollbar data-testid="host">
            <cdk-virtual-scroll-viewport
                kbqScrollbarVirtualViewport
                orientation="horizontal"
                itemSize="20"
                data-testid="viewport"
                style="width: 100px"
            >
                <div *cdkVirtualFor="let item of items" style="width: 20px">{{ item }}</div>
            </cdk-virtual-scroll-viewport>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarVirtualHorizontalHost {
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

@Component({
    selector: 'test-scrollbar-initialized-host',
    imports: [KbqScrollbar],
    template: `
        <div
            kbqScrollbar
            data-testid="host"
            style="height: 100px; overflow: auto"
            (kbqScrollbarInitialized)="initializedCount = initializedCount + 1"
        >
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarInitializedHost {
    initializedCount = 0;
}

@Component({
    selector: 'test-scrollbar-scroll-visibility-host',
    imports: [KbqScrollbar],
    template: `
        <div
            kbqScrollbar
            kbqScrollbarVisibility="scroll"
            kbqScrollbarAutoHideDelay="50"
            data-testid="host"
            style="height: 100px; overflow: auto"
        >
            <div style="height: 500px">content</div>
        </div>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class TestScrollbarScrollVisibilityHost {
    readonly scrollbar = viewChild.required(KbqScrollbar);
}

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

        it('sizes the thumb against the track size AFTER corner-avoidance shrinks it, not a stale pre-shrink size', () => {
            const fixture = createComponent(TestScrollbarDualOverflowHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const verticalTrack = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const horizontalTrack = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const thumb = verticalTrack.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            // jsdom doesn't run layout, so this getter stands in for what a real browser would do:
            // once corner-avoidance's `_has-horizontal` modifier lands, `scrollbar.scss`'s
            // `bottom: var(--...)` rule shrinks the track's real clientHeight.
            Object.defineProperty(verticalTrack, 'clientHeight', {
                configurable: true,
                get(this: HTMLElement) {
                    return this.classList.contains('kbq-private-scrollbar-track_has-horizontal') ? 92 : 106;
                }
            });

            setMetrics(scrollEl, { clientHeight: 250, scrollHeight: 500, clientWidth: 100, scrollWidth: 500 });
            setMetrics(horizontalTrack, { clientWidth: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(verticalTrack.classList.contains('kbq-private-scrollbar-track_has-horizontal')).toBe(true);
            // Correct (post-shrink 92px track): travelLength 92-2*3=86, ratio ceil(250/500*100)/100
            // = 0.5, thumbSize max(0.5*86, 32) = 43. A stale pre-shrink 106px track would instead
            // give travelLength 100 and thumbSize 50.
            expect(thumb.style.height).toBe('43px');
        });

        it('does not create track/thumb when KBQ_SCROLLBAR_CONFIG sets native: true', () => {
            const fixture = createComponent(TestScrollbarHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.querySelector('.kbq-private-scrollbar-track')).toBeNull();
        });

        it('still tracks isTopReached/isBottomReached and fires reachTop/reachBottom when native: true, despite having no track/thumb of its own', () => {
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

            expect(scrollbar.isTopReached()).toBe(true);
            expect(scrollbar.isBottomReached()).toBe(false);
            expect(topSpy).toHaveBeenCalled();
            expect(bottomSpy).not.toHaveBeenCalled();

            setMetrics(host, { scrollTop: 400 });
            scrollbar.update();

            expect(scrollbar.isTopReached()).toBe(false);
            expect(scrollbar.isBottomReached()).toBe(true);
            expect(bottomSpy).toHaveBeenCalled();
        });

        it('adds the disable-drag class when kbqScrollbarDisableDrag is set, independent of disable-click', () => {
            const fixture = createComponent(TestScrollbarDisableDragHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.classList.contains('kbq-private-scrollbar_disable-drag')).toBe(true);
            expect(host.classList.contains('kbq-private-scrollbar_disable-click')).toBe(false);
        });

        it('adds the disable-click class when kbqScrollbarDisableClick is set, independent of disable-drag', () => {
            const fixture = createComponent(TestScrollbarDisableClickHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.classList.contains('kbq-private-scrollbar_disable-click')).toBe(true);
            expect(host.classList.contains('kbq-private-scrollbar_disable-drag')).toBe(false);
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

        it('clamps the thumb to 0 rather than a negative size when the track is shorter than 2 * cssTrackPadding', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 200, scrollHeight: 500 });
            // 4px track: shorter than 2 * the 3px cssTrackPadding default (6px), so travelLength
            // would go negative (4 - 6 = -2) without the clamp.
            setMetrics(track, { clientHeight: 4 });
            fixture.componentInstance.scrollbar().update();

            expect(thumb.style.height).toBe('0px');
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

        it('establishes native scroll on both axes, not just vertical', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.style.overflowY).toBe('auto');
            expect(scrollEl.style.overflowX).toBe('auto');
        });

        it('hides the native scrollbar on the effective scroll element when building the custom UI', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.classList.contains('kbq-private-scrollbar_hide-native')).toBe(true);
        });

        it('does not hide the native scrollbar when KBQ_SCROLLBAR_CONFIG sets native: true', () => {
            const fixture = createComponent(TestScrollbarHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            // `native: true` never creates an auto-viewport wrapper — the host itself is the
            // effective scroll element.
            expect(host.classList.contains('kbq-private-scrollbar_hide-native')).toBe(false);
        });

        it('reads a real, resolvable --kbq-private-scrollbar-size-thumb-min-size CSS token over the hardcoded fallback', () => {
            const customTokenProvider: Provider = {
                provide: KBQ_WINDOW,
                useValue: {
                    getComputedStyle: () => ({
                        getPropertyValue: (property: string) =>
                            property === '--kbq-private-scrollbar-size-thumb-min-size' ? '60px' : ''
                    })
                }
            };

            const fixture = createComponent(TestScrollbarHost, [customTokenProvider]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            // A very small viewport ratio so the min-size clamp is what actually determines thumb
            // size, not the ratio itself.
            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 10, scrollHeight: 1000 });
            setMetrics(track, { clientHeight: 106 });
            fixture.componentInstance.scrollbar().update();

            expect(thumb.style.height).toBe('60px');
        });

        it("publishes the host's own computed padding as CSS custom properties consumed by the track positioning rules", () => {
            const fixture = createComponent(TestScrollbarPaddingHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            fixture.componentInstance.scrollbar().update();

            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-top')).toBe('10px');
            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-right')).toBe('20px');
            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-bottom')).toBe('30px');
            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-left')).toBe('40px');
        });

        it('re-reads the host padding on every recompute(), picking up a runtime change with no resize of its own', () => {
            const fixture = createComponent(TestScrollbarPaddingHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            fixture.componentInstance.scrollbar().update();
            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-top')).toBe('10px');

            host.style.padding = '5px';
            fixture.componentInstance.scrollbar().update();

            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-top')).toBe('5px');
        });

        it('does not publish host padding CSS custom properties under native: true — there is no track to position', () => {
            const fixture = createComponent(TestScrollbarPaddingHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            fixture.componentInstance.scrollbar().update();

            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-top')).toBe('');
        });

        it('does not publish host padding CSS custom properties on a coarse pointer — there is no track to position', () => {
            const fixture = createComponent(TestScrollbarPaddingHost, [coarsePointerWindowProvider]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            fixture.componentInstance.scrollbar().update();

            expect(host.style.getPropertyValue('--kbq-private-scrollbar-host-padding-top')).toBe('');
        });
    });

    describe('drag interaction', () => {
        const mockRects = (track: HTMLElement, thumb: HTMLElement, axis: 'vertical' | 'horizontal') => {
            if (axis === 'vertical') {
                jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 106 } as DOMRect);
                jest.spyOn(thumb, 'getBoundingClientRect').mockReturnValue({ top: 3, height: 32 } as DOMRect);
            } else {
                jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({ left: 0, width: 106 } as DOMRect);
                jest.spyOn(thumb, 'getBoundingClientRect').mockReturnValue({ left: 3, width: 32 } as DOMRect);
            }
        };

        it('dragging the thumb scrolls proportionally and toggles the dragging class', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            // trackStart = 0 + padding(3) = 3; trackLength = 106 - 2*3 = 100; thumbSize = 32 (mocked
            // rect); trackTravel = 100 - 32 = 68. Grabbing exactly the thumb's own top edge (clientY:
            // 3) makes grabOffset 0, so pointer position maps 1:1 onto the [trackStart, trackStart +
            // trackTravel] range.
            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));

            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(true);

            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 37, buttons: 1, cancelable: true }));
            // ratio = (37 - 3 - 0) / 68 = 0.5; scrollRange = 500 - 100 = 400.
            expect(scrollEl.scrollTop).toBe(200);

            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 71, buttons: 1, cancelable: true }));
            expect(scrollEl.scrollTop).toBe(400);

            document.dispatchEvent(new MouseEvent('pointerup', { cancelable: true }));

            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);
        });

        it('clicking the track (not the thumb) jumps the thumb to the click point and continues as a drag', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            // grabOffset is hardcoded to thumbSize/2 (16) for a track click. clientY: 53 ->
            // pointerRelative = 53 - trackStart(3) = 50; ratio = (50 - 16) / trackTravel(68) = 0.5.
            track.dispatchEvent(new MouseEvent('pointerdown', { clientY: 53, bubbles: true, cancelable: true }));

            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(true);
            expect(scrollEl.scrollTop).toBe(200);
        });

        it('disableDrag blocks thumb drag but leaves track jump-to-click working as a one-shot, not a continued drag', () => {
            const fixture = createComponent(TestScrollbarDisableDragHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);
            expect(scrollEl.scrollTop).toBe(0);

            track.dispatchEvent(new MouseEvent('pointerdown', { clientY: 53, bubbles: true, cancelable: true }));
            // The jump itself still happens...
            expect(scrollEl.scrollTop).toBe(200);
            // ...but, unlike an ordinary track click, it must not arm a continued drag — otherwise
            // holding the mouse down past the jump would keep following the pointer exactly like a
            // real drag, despite disableDrag.
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);

            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 90, buttons: 1, cancelable: true }));
            expect(scrollEl.scrollTop).toBe(200);
        });

        it('disableClick blocks track jump-to-click but leaves thumb drag working', () => {
            const fixture = createComponent(TestScrollbarDisableClickHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            track.dispatchEvent(new MouseEvent('pointerdown', { clientY: 53, bubbles: true, cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);
            expect(scrollEl.scrollTop).toBe(0);

            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(true);

            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 37, buttons: 1, cancelable: true }));
            expect(scrollEl.scrollTop).toBe(200);
        });

        it('ignores pointermove events from a different pointerId than the one that started the drag', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            const downEvent = new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true });

            Object.defineProperty(downEvent, 'pointerId', { value: 1, configurable: true });
            thumb.dispatchEvent(downEvent);

            const moveEvent = new MouseEvent('pointermove', { clientY: 71, buttons: 1, cancelable: true });

            Object.defineProperty(moveEvent, 'pointerId', { value: 2, configurable: true });
            document.dispatchEvent(moveEvent);

            expect(scrollEl.scrollTop).toBe(0);
        });

        it('ends the drag if pointermove reports no buttons pressed, instead of continuing to scroll', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(true);

            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 71, buttons: 0, cancelable: true }));

            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);
            expect(scrollEl.scrollTop).toBe(0);
        });

        it('does not attempt to scroll when the thumb fills the entire track travel range', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            jest.spyOn(track, 'getBoundingClientRect').mockReturnValue({ top: 0, height: 106 } as DOMRect);
            // thumbSize (100) equals trackLength (106 - 2*3), so trackTravel is 0.
            jest.spyOn(thumb, 'getBoundingClientRect').mockReturnValue({ top: 3, height: 100 } as DOMRect);

            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 71, buttons: 1, cancelable: true }));

            expect(scrollEl.scrollTop).toBe(0);
        });

        it('drags correctly on the horizontal axis in RTL, inverting the physical ratio onto the negative scrollLeft range', () => {
            const mockDir = new MockDirectionality();

            mockDir.value = 'rtl';

            const fixture = createComponent(TestScrollbarDualOverflowHost, [
                { provide: Directionality, useValue: mockDir }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_horizontal') as HTMLElement;
            const thumb = track.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollLeft: 0, clientWidth: 100, scrollWidth: 500, clientHeight: 500 });
            mockRects(track, thumb, 'horizontal');

            // Dragging all the way to the track's physical left (ratio 0) must land on the most
            // negative scrollLeft (RTL's logical end) — not 0, which is what the LTR branch would
            // give at the same ratio.
            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientX: 3, bubbles: true, cancelable: true }));
            document.dispatchEvent(new MouseEvent('pointermove', { clientX: 3, buttons: 1, cancelable: true }));

            expect(scrollEl.scrollLeft).toBe(-400);
        });

        it('ignores pointerdown from a non-primary mouse button (e.g. right-click)', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            thumb.dispatchEvent(
                new MouseEvent('pointerdown', { clientY: 3, button: 2, bubbles: true, cancelable: true })
            );

            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);
        });

        it('ignores a pointerdown that is explicitly not the primary pointer', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            const event = new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true });

            Object.defineProperty(event, 'isPrimary', { value: false, configurable: true });
            thumb.dispatchEvent(event);

            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);
        });

        it('ends the drag on pointercancel, the same as pointerup, instead of leaving it stuck', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(true);

            document.dispatchEvent(new MouseEvent('pointercancel', { cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_dragging')).toBe(false);

            // A pointermove after the cancel must be a no-op — the drag already ended.
            document.dispatchEvent(new MouseEvent('pointermove', { clientY: 71, buttons: 1, cancelable: true }));
            expect(scrollEl.scrollTop).toBe(0);
        });

        it("hides the scrollbar once a drag ends in 'hover' mode if the pointer already left the host mid-drag", () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            host.dispatchEvent(new Event('pointerenter'));
            thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

            // Pointer leaves the host while still dragging — must not hide yet, a drag is active.
            host.dispatchEvent(new Event('pointerleave'));
            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

            document.dispatchEvent(new MouseEvent('pointerup', { cancelable: true }));

            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);
        });

        it("schedules the auto-hide once a drag ends in 'scroll' mode, instead of leaving the scrollbar visible forever", () => {
            const fixture = createComponent(TestScrollbarScrollVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            mockRects(track, thumb, 'vertical');

            jest.useFakeTimers();

            try {
                // A click-without-movement: `beginInteraction()` shows the scrollbar directly
                // (not via `showTemporarily()`), so without the fix nothing would ever schedule
                // hiding it.
                thumb.dispatchEvent(new MouseEvent('pointerdown', { clientY: 3, bubbles: true, cancelable: true }));
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

                document.dispatchEvent(new MouseEvent('pointerup', { cancelable: true }));

                jest.advanceTimersByTime(50);

                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);
            } finally {
                jest.useRealTimers();
            }
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

        it('reserves the gutter on the left in RTL instead of the right', () => {
            const mockDir = new MockDirectionality();

            mockDir.value = 'rtl';

            const fixture = createComponent(TestScrollbarNonFloatingHost, [
                { provide: Directionality, useValue: mockDir }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.style.paddingLeft).toBe('var(--kbq-private-scrollbar-size-track-dimension)');
            expect(scrollEl.style.paddingRight).toBe('');
        });

        it('reacts to kbqScrollbarFloating changing at runtime, not just its value at first render', () => {
            const fixture = createComponent(TestScrollbarDynamicFloatingHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.style.paddingRight).toBe('');

            fixture.componentInstance.floating = false;
            fixture.detectChanges();
            TestBed.tick();

            expect(scrollEl.style.paddingRight).toBe('var(--kbq-private-scrollbar-size-track-dimension)');

            fixture.componentInstance.floating = true;
            fixture.detectChanges();
            TestBed.tick();

            expect(scrollEl.style.paddingRight).toBe('');
        });

        it('moves the gutter to the other side when direction flips at runtime, instead of leaving both', () => {
            const mockDir = new MockDirectionality();
            const fixture = createComponent(TestScrollbarNonFloatingHost, [
                { provide: Directionality, useValue: mockDir }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(scrollEl.style.paddingRight).toBe('var(--kbq-private-scrollbar-size-track-dimension)');
            expect(scrollEl.style.paddingLeft).toBe('');

            mockDir.value = 'rtl';
            mockDir.change.next('rtl');
            fixture.detectChanges();
            TestBed.tick();

            expect(scrollEl.style.paddingLeft).toBe('var(--kbq-private-scrollbar-size-track-dimension)');
            expect(scrollEl.style.paddingRight).toBe('');
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

        it('scrollToElement applies an independent left offset', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const target = scrollEl.querySelector('div') as HTMLElement;

            setMetrics(scrollEl, { scrollTop: 0, scrollLeft: 0 });
            jest.spyOn(scrollEl, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 } as DOMRect);
            jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 150, left: 200 } as DOMRect);

            fixture.componentInstance.scrollbar().scrollToElement(target, { left: 20 });

            expect(scrollEl.scrollTop).toBe(150);
            expect(scrollEl.scrollLeft).toBe(180);
        });

        it('scrollToElement resolves a string target as a selector against the scroll element', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const target = scrollEl.querySelector('div') as HTMLElement;

            target.setAttribute('data-target', '');
            setMetrics(scrollEl, { scrollTop: 0, scrollLeft: 0 });
            jest.spyOn(scrollEl, 'getBoundingClientRect').mockReturnValue({ top: 0, left: 0 } as DOMRect);
            jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top: 150, left: 200 } as DOMRect);

            fixture.componentInstance.scrollbar().scrollToElement('[data-target]');

            expect(scrollEl.scrollTop).toBe(150);
            expect(scrollEl.scrollLeft).toBe(200);
        });

        it('scrollToElement does nothing when the string selector matches no element', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            setMetrics(scrollEl, { scrollTop: 55, scrollLeft: 33 });

            fixture.componentInstance.scrollbar().scrollToElement('.does-not-exist');

            expect(scrollEl.scrollTop).toBe(55);
            expect(scrollEl.scrollLeft).toBe(33);
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

        it('scrollStart/scrollEnd do NOT call scrollToOffset on a (default) vertical viewport — `left` is not this axis', () => {
            const fixture = createComponent(TestScrollbarVirtualHost);
            const scrollToOffsetSpy = jest
                .spyOn(CdkVirtualScrollViewport.prototype, 'scrollToOffset')
                .mockImplementation(() => {});

            fixture.componentInstance.scrollbar().scrollStart();
            fixture.componentInstance.scrollbar().scrollEnd();

            expect(scrollToOffsetSpy).not.toHaveBeenCalled();
        });

        it('scrollToTop/scrollToBottom do NOT call scrollToOffset on an orientation="horizontal" viewport — `top` is not this axis', () => {
            const fixture = createComponent(TestScrollbarVirtualHorizontalHost);
            const scrollToOffsetSpy = jest
                .spyOn(CdkVirtualScrollViewport.prototype, 'scrollToOffset')
                .mockImplementation(() => {});

            fixture.componentInstance.scrollbar().scrollToTop();
            fixture.componentInstance.scrollbar().scrollToBottom();

            expect(scrollToOffsetSpy).not.toHaveBeenCalled();
        });

        it('routes scrollTo({ left }) through scrollToOffset when the delegated viewport is orientation="horizontal"', () => {
            const fixture = createComponent(TestScrollbarVirtualHorizontalHost);
            const scrollToOffsetSpy = jest
                .spyOn(CdkVirtualScrollViewport.prototype, 'scrollToOffset')
                .mockImplementation(() => {});

            fixture.componentInstance.scrollbar().scrollTo({ left: 77 });

            expect(scrollToOffsetSpy).toHaveBeenCalledWith(77, 'auto');
        });

        it('scrollTo({ top }) is ignored (not just defaulted to 0) against an orientation="horizontal" viewport', () => {
            const fixture = createComponent(TestScrollbarVirtualHorizontalHost);
            const scrollToOffsetSpy = jest
                .spyOn(CdkVirtualScrollViewport.prototype, 'scrollToOffset')
                .mockImplementation(() => {});

            fixture.componentInstance.scrollbar().scrollTo({ top: 999 });

            expect(scrollToOffsetSpy).not.toHaveBeenCalled();
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

        it("'hover' mode (the default) shows on a real pointerenter and hides again on pointerleave", () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);

            host.dispatchEvent(new Event('pointerenter'));
            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

            host.dispatchEvent(new Event('pointerleave'));
            expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);
        });

        it("'scroll' mode temporarily reveals on a real scroll event and auto-hides after kbqScrollbarAutoHideDelay", () => {
            const fixture = createComponent(TestScrollbarScrollVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            jest.useFakeTimers();

            try {
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);

                scrollEl.dispatchEvent(new Event('scroll'));
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

                jest.advanceTimersByTime(49);
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

                jest.advanceTimersByTime(1);
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);
            } finally {
                jest.useRealTimers();
            }
        });

        it("'scroll' mode restarts the auto-hide timer on every subsequent scroll instead of hiding on the first timer", () => {
            const fixture = createComponent(TestScrollbarScrollVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            jest.useFakeTimers();

            try {
                scrollEl.dispatchEvent(new Event('scroll'));
                jest.advanceTimersByTime(30);

                scrollEl.dispatchEvent(new Event('scroll'));
                jest.advanceTimersByTime(30);

                // Only 30ms since the second scroll, not yet the full 50ms delay.
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

                jest.advanceTimersByTime(20);
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(false);
            } finally {
                jest.useRealTimers();
            }
        });

        it("switching away from 'scroll' clears its pending auto-hide timer, instead of that timer hiding the scrollbar later under the new mode", () => {
            const fixture = createComponent(TestScrollbarVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            jest.useFakeTimers();

            try {
                setVisibility(fixture, 'scroll');
                scrollEl.dispatchEvent(new Event('scroll'));
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

                setVisibility(fixture, 'always');
                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);

                // Well past the default autoHideDelay (100ms) — the stale 'scroll'-mode timer must
                // not fire and hide a scrollbar that's supposed to stay permanently visible now.
                jest.advanceTimersByTime(200);

                expect(host.classList.contains('kbq-private-scrollbar_visible')).toBe(true);
            } finally {
                jest.useRealTimers();
            }
        });
    });

    describe('kbqScrollbarVirtualViewport delegation', () => {
        it('measures the delegated virtual viewport instead of the host', () => {
            const fixture = createComponent(TestScrollbarVirtualHost);
            const viewport = fixture.debugElement.nativeElement.querySelector(
                '[data-testid="viewport"]'
            ) as HTMLElement;

            expect(fixture.componentInstance.scrollbar().getScrollElement()).toBe(viewport);
        });
    });

    describe('CdkScrollable / ScrollDispatcher integration', () => {
        const registeredElements = (): HTMLElement[] =>
            Array.from(TestBed.inject(ScrollDispatcher).scrollContainers.keys()).map(
                (scrollable) => scrollable.getElementRef().nativeElement
            );

        it('registers the auto-viewport (the real scroll element) with ScrollDispatcher', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            // `KbqScrollbar`'s own `hostDirectives: [CdkScrollable]` also still registers the host
            // itself — harmlessly: the host has no `overflow` of its own in this case (the
            // auto-viewport does), so its `CdkScrollable` never actually fires, it just stays
            // registered alongside the one that matters.
            expect(registeredElements()).toContain(scrollEl);
        });

        it('sees a delegated virtual viewport via its own built-in CdkScrollable', () => {
            const fixture = createComponent(TestScrollbarVirtualHost);
            const viewport = fixture.debugElement.nativeElement.querySelector(
                '[data-testid="viewport"]'
            ) as HTMLElement;

            expect(registeredElements()).toContain(viewport);
        });

        it('registers the host itself when it is the real scroll element (native: true)', () => {
            const fixture = createComponent(TestScrollbarHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(registeredElements()).toContain(host);
        });

        it('de-registers the auto-viewport from ScrollDispatcher on destroy', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);

            expect(registeredElements()).toContain(scrollEl);

            fixture.destroy();

            expect(registeredElements()).not.toContain(scrollEl);
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

        it('fires reachTop and reachBottom together when content shrinks to no longer overflow, mid-scroll', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const topSpy = jest.fn();
            const bottomSpy = jest.fn();

            fixture.componentInstance.scrollbar().reachTop.subscribe(topSpy);
            fixture.componentInstance.scrollbar().reachBottom.subscribe(bottomSpy);

            // Mid-scroll — neither edge reached yet.
            setMetrics(scrollEl, { scrollTop: 200, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(topSpy).not.toHaveBeenCalled();
            expect(bottomSpy).not.toHaveBeenCalled();

            // Content shrinks to fit the viewport — nothing left to scroll, trivially "at both
            // edges" at once, even though scrollTop itself never went anywhere near 0 or the max.
            setMetrics(scrollEl, { scrollHeight: 100 });
            fixture.componentInstance.scrollbar().update();

            expect(topSpy).toHaveBeenCalled();
            expect(bottomSpy).toHaveBeenCalled();
        });

        it('does not fire reachTop/reachBottom on construction, before this axis has ever overflowed', () => {
            const fixture = createComponent(TestScrollbarHost);
            const topSpy = jest.fn();
            const bottomSpy = jest.fn();

            fixture.componentInstance.scrollbar().reachTop.subscribe(topSpy);
            fixture.componentInstance.scrollbar().reachBottom.subscribe(bottomSpy);

            fixture.componentInstance.scrollbar().update();

            expect(topSpy).not.toHaveBeenCalled();
            expect(bottomSpy).not.toHaveBeenCalled();
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

        it('does not re-emit reachTop on subsequent updates while still at the top', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const topSpy = jest.fn();

            fixture.componentInstance.scrollbar().reachTop.subscribe(topSpy);

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 100 });
            fixture.componentInstance.scrollbar().update();
            fixture.componentInstance.scrollbar().update();
            fixture.componentInstance.scrollbar().update();

            expect(topSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe('outputs', () => {
        it('emits scrollChange with the current scroll position on a real scroll event', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const spy = jest.fn();

            fixture.componentInstance.scrollbar().scrollChange.subscribe(spy);

            setMetrics(scrollEl, { scrollTop: 77, scrollLeft: 12 });
            scrollEl.dispatchEvent(new Event('scroll'));

            expect(spy).toHaveBeenCalledWith({ top: 77, left: 12 });
        });

        it('onScroll (KbqOverflowShadowSource) emits on the same real scroll event as scrollChange', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const spy = jest.fn();

            fixture.componentInstance.scrollbar().onScroll.subscribe(spy);
            expect(fixture.componentInstance.scrollbar().getScrollElement()).toBe(scrollEl);

            scrollEl.dispatchEvent(new Event('scroll'));

            expect(spy).toHaveBeenCalled();
        });

        it('emits kbqScrollbarInitialized exactly once after initial setup', () => {
            const fixture = createComponent(TestScrollbarInitializedHost);

            expect(fixture.componentInstance.initializedCount).toBe(1);
        });

        it('emits kbqScrollbarInitialized even under native: true, where there is no track/thumb of its own to render', () => {
            const fixture = createComponent(TestScrollbarInitializedHost, [
                { provide: KBQ_SCROLLBAR_CONFIG, useValue: { native: true } }
            ]);

            expect(fixture.componentInstance.initializedCount).toBe(1);
        });
    });

    describe('ngOnDestroy', () => {
        it('removes the track/thumb DOM on destroy', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;

            expect(host.querySelector('.kbq-private-scrollbar-track')).toBeTruthy();

            fixture.destroy();

            expect(host.querySelector('.kbq-private-scrollbar-track')).toBeNull();
        });

        it('clears a pending auto-hide timeout on destroy', () => {
            const fixture = createComponent(TestScrollbarScrollVisibilityHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');

            scrollEl.dispatchEvent(new Event('scroll'));
            fixture.destroy();

            expect(clearTimeoutSpy).toHaveBeenCalled();
        });
    });

    describe('isTopReached / isBottomReached / isStartReached / isEndReached', () => {
        it('isTopReached / isBottomReached track the current vertical position, not just the moment it was reached', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
            const scrollbar = fixture.componentInstance.scrollbar();

            setMetrics(scrollEl, { scrollTop: 0, clientHeight: 100, scrollHeight: 500 });
            setMetrics(track, { clientHeight: 100 });
            scrollbar.update();

            expect(scrollbar.isTopReached()).toBe(true);
            expect(scrollbar.isBottomReached()).toBe(false);

            setMetrics(scrollEl, { scrollTop: 200 });
            scrollbar.update();

            expect(scrollbar.isTopReached()).toBe(false);
            expect(scrollbar.isBottomReached()).toBe(false);

            setMetrics(scrollEl, { scrollTop: 400 });
            scrollbar.update();

            expect(scrollbar.isBottomReached()).toBe(true);
        });

        it('isStartReached / isEndReached track the current horizontal position in LTR', () => {
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

            expect(scrollbar.isStartReached()).toBe(true);
            expect(scrollbar.isEndReached()).toBe(false);

            setMetrics(scrollEl, { scrollLeft: 400 });
            scrollbar.update();

            expect(scrollbar.isStartReached()).toBe(false);
            expect(scrollbar.isEndReached()).toBe(true);
        });

        it('isStartReached / isEndReached flip which physical edge they track in RTL', () => {
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

            expect(scrollbar.isStartReached()).toBe(true);
            expect(scrollbar.isEndReached()).toBe(false);

            // scrollLeft: -400 is RTL's logical end — physically the left edge.
            setMetrics(scrollEl, { scrollLeft: -400 });
            scrollbar.update();

            expect(scrollbar.isStartReached()).toBe(false);
            expect(scrollbar.isEndReached()).toBe(true);
        });

        it('reads as both at-start and at-end when there is no overflow to scroll at all', () => {
            const fixture = createComponent(TestScrollbarHost);
            const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
            const scrollEl = getAutoViewport(host);
            const scrollbar = fixture.componentInstance.scrollbar();

            setMetrics(scrollEl, { clientHeight: 500, scrollHeight: 500 });
            scrollbar.update();

            expect(scrollbar.isTopReached()).toBe(true);
            expect(scrollbar.isBottomReached()).toBe(true);
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

        it(
            'does NOT pick up a content-only growth automatically — this directive only recomputes on ' +
                "scroll, on a resize of the scroll element's own box, or on an explicit update() call. " +
                'A `scrollHeight` change with no box-size change (e.g. appending rows to a list) fires ' +
                'neither, so the thumb is left stale until something calls update() for it',
            () => {
                const fixture = createComponent(TestScrollbarHost);
                const host = fixture.debugElement.nativeElement.querySelector('[data-testid="host"]') as HTMLElement;
                const scrollEl = getAutoViewport(host);
                const track = host.querySelector('.kbq-private-scrollbar-track_vertical') as HTMLElement;
                const thumb = host.querySelector('.kbq-private-scrollbar-thumb') as HTMLElement;

                setMetrics(scrollEl, { scrollTop: 0, clientHeight: 200, scrollHeight: 500 });
                setMetrics(track, { clientHeight: 206 });
                fixture.componentInstance.scrollbar().update();

                // ratio = ceil(200/500*100)/100 = 0.4; thumbSize = max(0.4*200, 32) = 80.
                expect(thumb.style.height).toBe('80px');

                // Simulate content being appended: scrollHeight grows, clientHeight (the scroll
                // element's own box size) does not — this is exactly the shape of change a real
                // ResizeObserver never reports, since it only fires on box-size changes, not on
                // scrollHeight/scrollWidth. No scroll event happens either.
                setMetrics(scrollEl, { scrollHeight: 1000 });

                // Nothing re-measures on its own: no scroll fired, no resize fired, and no manual
                // update() was called — by design, there's no MutationObserver watching content
                // mutations here, so the thumb stays stale until update() is called explicitly.
                expect(thumb.style.height).toBe('80px');

                fixture.componentInstance.scrollbar().update();

                // ratio = ceil(200/1000*100)/100 = 0.2; thumbSize = max(0.2*200, 32) = 40 — only
                // reached once something explicitly calls update().
                expect(thumb.style.height).toBe('40px');
            }
        );
    });
});
