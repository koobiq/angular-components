import { FocusMonitor } from '@angular/cdk/a11y';
import { Direction, Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, Injectable, Provider, signal, Type, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { enUSLocaleData, kbqA11yLocaleConfigurationProvider } from '@koobiq/components/core';
import { EMPTY, Observable, Subject } from 'rxjs';
import {
    KbqDd,
    KbqDdComponent,
    KbqDl,
    KbqDlAlign,
    KbqDlComponent,
    kbqDlOptionsProvider,
    KbqDt,
    KbqDtComponent
} from './dl';
import { KbqDlModule } from './dl.module';

/**
 * `SharedResizeObserver` stand-in: the real one never emits in jsdom, where `ResizeObserver` is a no-op stub. Like a
 * real observer it reports nothing on subscription, only when a test replays an observation.
 */
@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    changes = new Subject<ResizeObserverEntry[]>();

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

const createComponent = <T>(component: Type<T>, providers: Provider[] = []): ComponentFixture<T> => {
    TestBed.configureTestingModule({
        imports: [component],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }, ...providers]
    });
    const fixture = TestBed.createComponent<T>(component);

    fixture.autoDetectChanges();

    return fixture;
};

const getDlElement = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement => nativeElement;
const getResizeHandle = ({ nativeElement }: ComponentFixture<unknown>): HTMLElement | null => {
    return nativeElement.querySelector('.kbq-dl__resize-handle');
};

const provideDirectionality = (valueSignal: WritableSignal<Direction>): Provider => ({
    provide: Directionality,
    useValue: { value: valueSignal(), valueSignal, change: EMPTY }
});

/** Replays the resize observation that follows a real layout: jsdom never lays anything out. */
const notifyResize = (fixture: ComponentFixture<unknown>): void => {
    (TestBed.inject(SharedResizeObserver) as MockResizeObserver).changes.next([]);
    fixture.detectChanges();
};

/** Lays the list out the way a browser would: the geometry jsdom lacks is stubbed and the observation replayed. */
const layOut = (fixture: ComponentFixture<unknown>, { host, track }: { host: number; track?: number }): void => {
    const dl = getDlElement(fixture);

    Object.defineProperty(dl, 'clientWidth', { configurable: true, value: host });
    Object.defineProperty(dl, 'getClientRects', { configurable: true, value: () => [{ width: host } as DOMRect] });

    const resizeTrack = dl.querySelector('.kbq-dl__resize-track');

    if (resizeTrack && track !== undefined) {
        Object.defineProperty(resizeTrack, 'clientWidth', { configurable: true, value: track });
    }

    notifyResize(fixture);
};

describe(KbqDl.name, () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should use start alignment by default', () => {
        const fixture = createComponent(KbqDl);

        expect(fixture.componentInstance.verticalAlign()).toBe('start');
        expect(fixture.componentInstance.horizontalAlign()).toBe('start');
        expect(getDlElement(fixture).className).toBe('kbq-dl');
    });

    it.each<{ align: Exclude<KbqDlAlign, 'start'>; className: string }>([
        { align: 'center', className: 'kbq-dl_vertical-align-center' },
        { align: 'end', className: 'kbq-dl_vertical-align-end' }
    ])('should apply $align vertical alignment', ({ align, className }) => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('verticalAlign', align);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain(className);
    });

    it.each<{ align: Exclude<KbqDlAlign, 'start'>; className: string }>([
        { align: 'center', className: 'kbq-dl_horizontal-align-center' },
        { align: 'end', className: 'kbq-dl_horizontal-align-end' }
    ])('should apply $align horizontal alignment', ({ align, className }) => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('horizontalAlign', align);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain(className);
    });

    it('should apply layout classes', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('wide', true);
        fixture.componentRef.setInput('vertical', true);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_wide');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should render resize handle only when resizing is enabled for horizontal layout', () => {
        const fixture = createComponent(KbqDl);

        expect(getResizeHandle(fixture)).toBeNull();

        fixture.componentRef.setInput('resizable', true);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)).not.toBeNull();

        fixture.componentRef.setInput('vertical', true);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)).toBeNull();
    });

    it('should constrain the resize track to the configured widths once a width is set', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 120);
        fixture.componentRef.setInput('ddMinWidth', 200);
        fixture.componentRef.setInput('dtWidth', 300);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        fixture.detectChanges();

        const resizeTrack = getDlElement(fixture).querySelector<HTMLElement>('.kbq-dl__resize-track')!;

        expect(resizeTrack.style.width).toBe('300px');
        expect(resizeTrack.style.minWidth).toBe('120px');
        expect(resizeTrack.style.maxWidth).toBe('400px');
    });

    it('should expose the dt min width as a CSS variable so the resting grid honors it', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 200);
        fixture.detectChanges();

        expect(getDlElement(fixture).style.getPropertyValue('--kbq-description-list-dt-min-width')).toBe('200px');
    });

    it('should not constrain the resting track before a width is set, so the separator stays on the column border', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        // A min width wider than the natural column must not inflate the resting track into the second column.
        fixture.componentRef.setInput('dtMinWidth', 200);
        fixture.componentRef.setInput('ddMinWidth', 200);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        fixture.detectChanges();

        const resizeTrack = getDlElement(fixture).querySelector<HTMLElement>('.kbq-dl__resize-track')!;

        expect(resizeTrack.style.width).toBe('');
        expect(resizeTrack.style.minWidth).toBe('');
        expect(resizeTrack.style.maxWidth).toBe('');
    });

    it('should resize the first column with keyboard and expose separator semantics', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 96);
        fixture.detectChanges();

        const resizeHandle = getResizeHandle(fixture)!;

        resizeHandle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        fixture.detectChanges();

        // The configured min width (96) is also the max here (host width is 0 in jsdom), so it clamps to 96.
        expect(fixture.componentInstance.dtWidth()).toBe(96);
        expect(resizeHandle.getAttribute('role')).toBe('separator');
        expect(resizeHandle.getAttribute('aria-orientation')).toBe('vertical');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_resized');
    });

    it('should collapse to the minimum width on double click, then reset on the next one', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 120);
        fixture.componentRef.setInput('dtWidth', 200);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        fixture.detectChanges();

        const resizeHandle = getResizeHandle(fixture)!;

        // The width the term column returns to at the default ratio, between the bounds.
        Object.defineProperty(resizeHandle.parentElement, 'clientWidth', { configurable: true, value: 150 });

        resizeHandle.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(120);
        expect(resizeHandle.style.cursor).toBe('e-resize');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_resized');

        resizeHandle.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBeNull();
        expect(resizeHandle.style.cursor).toBe('col-resize');
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_resized');
    });

    it('should coerce a string dtWidth and clamp it against dtMinWidth', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 200);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        // What a consumer without `strictTemplates` sends with `<kbq-dl dtWidth="120">`.
        fixture.componentRef.setInput('dtWidth', '120');
        notifyResize(fixture);

        // Untransformed the string never reached the clamp: `setDtWidth` opens with
        // `Number.isFinite(width)`, which is false for '120', so the column stayed below its own minimum.
        expect(fixture.componentInstance.dtWidth()).toBe(200);
    });

    it('should report a dtWidth that is not a finite number as null', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('dtWidth', 'abc');
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBeNull();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_resized');
    });

    it('should emit dtWidthChange when the component writes the width itself', () => {
        const fixture = createComponent(KbqDl);
        const emitted: (number | null)[] = [];

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 120);
        fixture.componentRef.setInput('dtWidth', 200);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        fixture.detectChanges();

        fixture.componentInstance.dtWidthChange.subscribe((width) => emitted.push(width));

        const resizeHandle = getResizeHandle(fixture)!;

        resizeHandle.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        resizeHandle.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        // `linkedSignal` does not notify the way `model()` did, so `[(dtWidth)]` depends on this emit.
        expect(emitted).toEqual([120, null]);
    });

    it('should update the shared dt width on pointer drag', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        const resizeTrack = getDlElement(fixture).querySelector<HTMLElement>('.kbq-dl__resize-track')!;
        const resizeHandle = getResizeHandle(fixture)!;

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        // The resizer captures the base size via `getResizableSize()`; force its border-box branch to report 120.
        resizeTrack.style.boxSizing = 'border-box';
        Object.defineProperty(resizeTrack, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({ width: 120, height: 0 }) as DOMRect
        });

        resizeHandle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 120 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 200 }));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(200);
    });

    it('should demote the separator focus to the pointer origin when a mouse drag starts', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        const focusMonitor = TestBed.inject(FocusMonitor);
        const resizeHandle = getResizeHandle(fixture)!;

        // Keyboard focus keeps the frame.
        focusMonitor.focusVia(resizeHandle, 'keyboard');
        fixture.detectChanges();
        expect(resizeHandle.classList).toContain('cdk-keyboard-focused');

        // Grabbing the separator with the mouse demotes the origin, so the frame does not linger after the drag.
        resizeHandle.dispatchEvent(new MouseEvent('pointerdown'));
        fixture.detectChanges();

        expect(resizeHandle.classList).not.toContain('cdk-keyboard-focused');
        expect(resizeHandle.classList).toContain('cdk-mouse-focused');
    });

    it('should reverse horizontal resize direction in RTL', () => {
        const fixture = createComponent(KbqDl, [provideDirectionality(signal('rtl'))]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        const resizeTrack = getDlElement(fixture).querySelector('.kbq-dl__resize-track')!;

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        Object.defineProperty(resizeTrack, 'clientWidth', { configurable: true, value: 200 });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(208);
    });

    it('should apply the col-resize cursor to the separator at rest', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();
        layOut(fixture, { host: 600, track: 150 });

        expect(getResizeHandle(fixture)!.style.cursor).toBe('col-resize');
    });

    it('should advertise the grow-only direction with an e-resize cursor at the minimum width', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(100);
        expect(getResizeHandle(fixture)!.style.cursor).toBe('e-resize');
    });

    it('should advertise the shrink-only direction with a w-resize cursor at the maximum width', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(500);
        expect(getResizeHandle(fixture)!.style.cursor).toBe('w-resize');
    });

    it('should keep the col-resize cursor while the width is between the bounds', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        Object.defineProperty(getResizeHandle(fixture)!.parentElement, 'clientWidth', {
            configurable: true,
            value: 300
        });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('col-resize');
    });

    it('should fall back to the default cursor when there is no room to resize', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 600);
        fixture.detectChanges();

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('default');
    });

    it('should mirror the grow-only cursor to w-resize at the minimum width in RTL', () => {
        const fixture = createComponent(KbqDl, [provideDirectionality(signal('rtl'))]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('w-resize');
    });

    it('should mirror the shrink-only cursor to e-resize at the maximum width in RTL', () => {
        const fixture = createComponent(KbqDl, [provideDirectionality(signal('rtl'))]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('e-resize');
    });

    it.each<{
        boundary: string;
        boundaryCursor: string;
        boundaryPointerX: number;
        boundaryWidth: number;
        beyondPointerX: number;
        returnPointerX: number;
        returnWidth: number;
    }>([
        {
            boundary: 'minimum',
            boundaryCursor: 'e-resize',
            boundaryPointerX: 0,
            boundaryWidth: 100,
            beyondPointerX: -100,
            returnPointerX: 200,
            returnWidth: 200
        },
        {
            boundary: 'maximum',
            boundaryCursor: 'w-resize',
            boundaryPointerX: 600,
            boundaryWidth: 500,
            beyondPointerX: 700,
            returnPointerX: 400,
            returnWidth: 400
        }
    ])(
        'should keep the $boundaryCursor cursor through the $boundary boundary and restore it after drag',
        ({ boundaryCursor, boundaryPointerX, boundaryWidth, beyondPointerX, returnPointerX, returnWidth }) => {
            const fixture = createComponent(KbqDl);

            fixture.componentRef.setInput('resizable', true);
            fixture.componentRef.setInput('vertical', false);
            fixture.componentRef.setInput('dtMinWidth', 100);
            fixture.componentRef.setInput('ddMinWidth', 100);
            fixture.detectChanges();

            const resizeTrack = getDlElement(fixture).querySelector<HTMLElement>('.kbq-dl__resize-track')!;
            const resizeHandle = getResizeHandle(fixture)!;

            // The resizer captures the base size via `getResizableSize()`; force its border-box branch to report 300.
            resizeTrack.style.boxSizing = 'border-box';
            Object.defineProperty(resizeTrack, 'getBoundingClientRect', {
                configurable: true,
                value: () => ({ width: 300, height: 0 }) as DOMRect
            });
            layOut(fixture, { host: 600, track: 300 });

            resizeHandle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 300 }));
            expect(document.body.style.cursor).toBe('col-resize');

            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: boundaryPointerX }));
            fixture.detectChanges();

            expect(fixture.componentInstance.dtWidth()).toBe(boundaryWidth);
            expect(resizeHandle.style.cursor).toBe(boundaryCursor);
            expect(document.body.style.cursor).toBe(boundaryCursor);

            // Moving past the stationary handle keeps the resize cursor and the clamped width.
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: beyondPointerX }));
            fixture.detectChanges();

            expect(fixture.componentInstance.dtWidth()).toBe(boundaryWidth);
            expect(document.body.style.cursor).toBe(boundaryCursor);

            // Moving back into the available range resumes resizing without starting a new gesture.
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: returnPointerX }));
            fixture.detectChanges();

            expect(fixture.componentInstance.dtWidth()).toBe(returnWidth);
            expect(document.body.style.cursor).toBe('col-resize');

            document.dispatchEvent(new MouseEvent('pointerup'));

            expect(document.body.style.cursor).toBe('');
        }
    );

    it('should fall back to the localized separator name for the aria-label', () => {
        const fixture = createComponent(KbqDl, [
            kbqA11yLocaleConfigurationProvider({ ...enUSLocaleData.a11y, resizeColumns: 'Resize the columns' })
        ]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.getAttribute('aria-label')).toBe('Resize the columns');
    });

    it('should prefer the provided resizer aria-label over the localized default', () => {
        const fixture = createComponent(KbqDl, [
            kbqA11yLocaleConfigurationProvider({ ...enUSLocaleData.a11y, resizeColumns: 'Localized default' })
        ]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('resizerAriaLabel', 'Custom label');
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.getAttribute('aria-label')).toBe('Custom label');
    });

    it('should clamp a negative dt min width to zero', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', -50);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should auto-detect the vertical layout from the host width via the resize observer', () => {
        const fixture = createComponent(KbqDl);

        // The layout decision reads `getClientRects()`; report a width below the default `verticalBreakpoint` (400).
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 320 } as DOMRect]
        });

        // Flush the resize-observer debounce so the initial `startWith(null)` emission runs `updateLayout`.
        notifyResize(fixture);

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
        expect(getResizeHandle(fixture)).toBeNull();
    });

    it('should keep the horizontal layout when the host is wider than verticalBreakpoint', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 800 } as DOMRect]
        });

        notifyResize(fixture);

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
        expect(getResizeHandle(fixture)).not.toBeNull();
    });

    it('should let an explicit vertical input override the auto-detection', () => {
        const fixture = createComponent(KbqDl);

        // Host is narrow (auto-detection would choose vertical), but the explicit input forces horizontal.
        fixture.componentRef.setInput('vertical', false);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 200 } as DOMRect]
        });

        notifyResize(fixture);

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should re-evaluate the layout against verticalBreakpoint on every resize while in auto mode', () => {
        const fixture = createComponent(KbqDl);
        let width = 800;

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width } as DOMRect]
        });

        notifyResize(fixture);
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        // Shrink below the threshold: the layout must switch to vertical, not stay locked to the first measurement.
        width = 300;
        notifyResize(fixture);
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');

        // Grow back above the threshold: it must switch back to horizontal.
        width = 800;
        notifyResize(fixture);
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should honor a custom verticalBreakpoint as the vertical-layout threshold', () => {
        const fixture = createComponent(KbqDl);

        // 600px is above the default threshold (400) but below the custom one (700), so only a working
        // `verticalBreakpoint` input makes the layout switch to vertical here.
        fixture.componentRef.setInput('verticalBreakpoint', 700);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        notifyResize(fixture);

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should stay horizontal when the host is wider than a custom verticalBreakpoint', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('verticalBreakpoint', 500);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        notifyResize(fixture);

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
    });

    it('should re-evaluate the layout when the breakpoint changes', () => {
        const fixture = createComponent(KbqDl);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        notifyResize(fixture);

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        // The comparison used to run only on resize, so a new breakpoint left the old answer in place.
        fixture.componentRef.setInput('verticalBreakpoint', 700);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should hand the decision back to the breakpoint when vertical returns to null', () => {
        const fixture = createComponent(KbqDl);

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        // The default breakpoint is 400, so the first measurement answers "horizontal" - that is the stale
        // answer the decision must not fall back to at the end.
        notifyResize(fixture);

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        // Raised while `vertical` is explicit, so nothing re-measures: only a derived decision picks it up.
        fixture.componentRef.setInput('verticalBreakpoint', 700);
        fixture.componentRef.setInput('vertical', null);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should treat a valueless wide attribute as true', () => {
        const fixture = createComponent(DlWithValuelessAttributes);

        fixture.detectChanges();

        const dl = fixture.debugElement.query(By.directive(KbqDl)).nativeElement as HTMLElement;

        expect(dl.classList).toContain('kbq-dl_wide');
    });

    it('should keep a bound null as the decide-for-me state', () => {
        const fixture = createComponent(KbqDl);

        fixture.detectChanges();

        fixture.componentRef.setInput('vertical', true);
        fixture.detectChanges();

        expect(fixture.componentInstance.vertical()).toBe(true);

        // Angular never runs the transform over a declared default, so only a bound `null` observes it.
        fixture.componentRef.setInput('vertical', null);
        fixture.detectChanges();

        expect(fixture.componentInstance.vertical()).toBeNull();
    });

    it('should report undefined for a non-numeric width rather than NaN', () => {
        const fixture = createComponent(DlWithInvalidWidths);

        fixture.detectChanges();

        const dl = fixture.debugElement.query(By.directive(KbqDl)).componentInstance as KbqDl;

        // `numberAttribute('')` is NaN, which is not nullish: it walked past every `??` into the grid and
        // rendered `NaNpx`, dropping the whole `grid-template-columns` declaration.
        expect(dl.dtMinWidth()).toBeUndefined();
        expect(dl.ddMinWidth()).toBeUndefined();
    });

    it('should treat a bound falsy non-boolean wide as true', () => {
        const fixture = createComponent(KbqDl);

        fixture.detectChanges();

        fixture.componentRef.setInput('wide', 0);
        fixture.detectChanges();

        // `booleanAttribute` is true for anything that is neither nullish nor the string `false`.
        expect(fixture.componentInstance.wide()).toBe(true);

        fixture.componentRef.setInput('wide', 'false');
        fixture.detectChanges();

        expect(fixture.componentInstance.wide()).toBe(false);
    });

    it('should treat a valueless vertical attribute as true', () => {
        const fixture = createComponent(DlWithValuelessAttributes);

        fixture.detectChanges();

        const dl = fixture.debugElement.query(By.directive(KbqDl)).nativeElement as HTMLElement;

        expect(dl.classList).toContain('kbq-dl_vertical');
    });

    it('should coerce the numeric width attributes', () => {
        const fixture = createComponent(DlWithStringWidths);

        fixture.detectChanges();

        const dl = fixture.debugElement.query(By.directive(KbqDl)).componentInstance as KbqDl;

        expect(dl.verticalBreakpoint()).toBe(700);
        expect(dl.dtMinWidth()).toBe(120);
        expect(dl.ddMinWidth()).toBe(80);
    });

    it('should leave the optional widths undefined when bound to undefined', () => {
        const fixture = createComponent(KbqDl);

        fixture.detectChanges();

        fixture.componentRef.setInput('dtMinWidth', 120);
        fixture.detectChanges();

        expect(fixture.componentInstance.dtMinWidth()).toBe(120);

        fixture.componentRef.setInput('dtMinWidth', undefined);
        fixture.detectChanges();

        expect(fixture.componentInstance.dtMinWidth()).toBeUndefined();
    });

    it('should take its defaults from kbqDlOptionsProvider', () => {
        const fixture = createComponent(KbqDl, [
            kbqDlOptionsProvider({
                verticalBreakpoint: 700,
                vertical: false,
                wide: true,
                resizable: true,
                dtWidth: 180,
                dtMinWidth: 120,
                ddMinWidth: 240,
                verticalAlign: 'center',
                horizontalAlign: 'end'
            })
        ]);
        const dl = fixture.componentInstance;

        expect(dl.verticalBreakpoint()).toBe(700);
        expect(dl.vertical()).toBe(false);
        expect(dl.dtWidth()).toBe(180);
        expect(dl.dtMinWidth()).toBe(120);
        expect(dl.ddMinWidth()).toBe(240);
        expect(getDlElement(fixture).classList).toContain('kbq-dl_wide');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical-align-center');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_horizontal-align-end');
        expect(getResizeHandle(fixture)).not.toBeNull();
    });

    it('should keep the defaults of the options the provider leaves out', () => {
        const fixture = createComponent(KbqDl, [kbqDlOptionsProvider({ wide: true })]);
        const dl = fixture.componentInstance;

        expect(dl.wide()).toBe(true);
        expect(dl.verticalBreakpoint()).toBe(400);
        expect(dl.vertical()).toBeNull();
        expect(dl.resizable()).toBe(false);
        expect(dl.dtWidth()).toBeNull();
        expect(dl.dtMinWidth()).toBeUndefined();
        expect(dl.verticalAlign()).toBe('start');
    });

    it('should keep the default of an option provided as undefined', () => {
        const fixture = createComponent(KbqDl, [
            kbqDlOptionsProvider({ dtWidth: undefined, verticalBreakpoint: undefined, wide: true })
        ]);
        const dl = fixture.componentInstance;

        expect(dl.dtWidth()).toBeNull();
        expect(dl.verticalBreakpoint()).toBe(400);
        expect(dl.wide()).toBe(true);
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_resized');
    });

    it('should add a nested provider to the options of the parent injector', () => {
        const fixture = createComponent(DlWithNestedOptions, [kbqDlOptionsProvider({ resizable: true, wide: true })]);
        const dl = fixture.debugElement.query(By.directive(KbqDl)).componentInstance as KbqDl;

        expect(dl.resizable()).toBe(true);
        expect(dl.wide()).toBe(false);
        expect(dl.verticalAlign()).toBe('center');
    });

    it('should let an input override the provided default', () => {
        const fixture = createComponent(KbqDl, [kbqDlOptionsProvider({ wide: true, verticalAlign: 'end' })]);

        fixture.componentRef.setInput('wide', false);
        fixture.componentRef.setInput('verticalAlign', 'center');
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_wide');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical-align-center');
    });

    it('should provide the list, terms and descriptions through KbqDlModule', () => {
        const fixture = createComponent(DlFromModule);

        expect(fixture.debugElement.query(By.directive(KbqDl))).not.toBeNull();
        expect(fixture.debugElement.query(By.directive(KbqDt)).nativeElement.classList).toContain('kbq-dt');
        expect(fixture.debugElement.query(By.directive(KbqDd)).nativeElement.classList).toContain('kbq-dd');
    });

    it('should keep the deprecated names working as the same classes', () => {
        const fixture = createComponent(DlWithDeprecatedNames);

        expect(KbqDlComponent).toBe(KbqDl);
        expect(KbqDtComponent).toBe(KbqDt);
        expect(KbqDdComponent).toBe(KbqDd);
        expect(fixture.debugElement.query(By.directive(KbqDl)).nativeElement.classList).toContain('kbq-dl');
    });

    it('should mirror the separator cursor when the direction changes at runtime', () => {
        const direction = signal<Direction>('ltr');
        const fixture = createComponent(KbqDl, [provideDirectionality(direction)]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        fixture.detectChanges();

        getResizeHandle(fixture)!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('e-resize');

        direction.set('rtl');
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('w-resize');
    });

    it('should refresh the separator bounds when the host resizes', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();
        layOut(fixture, { host: 600, track: 150 });

        const resizeHandle = getResizeHandle(fixture)!;

        expect(resizeHandle.getAttribute('aria-valuemax')).toBe('500');
        expect(resizeHandle.getAttribute('aria-valuenow')).toBe('150');

        layOut(fixture, { host: 800, track: 200 });

        expect(resizeHandle.getAttribute('aria-valuemax')).toBe('700');
        expect(resizeHandle.getAttribute('aria-valuenow')).toBe('200');
    });

    it('should clamp a bound dtWidth beyond the bounds and report the clamped value', () => {
        const fixture = createComponent(KbqDl);
        const emitted: (number | null)[] = [];

        fixture.componentInstance.dtWidthChange.subscribe((width) => emitted.push(width));
        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.detectChanges();
        layOut(fixture, { host: 600 });

        fixture.componentRef.setInput('dtWidth', 1000);
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(500);
        expect(getDlElement(fixture).style.getPropertyValue('--kbq-description-list-dt-width')).toBe('500px');
        expect(getResizeHandle(fixture)!.getAttribute('aria-valuenow')).toBe('500');
        expect(emitted).toEqual([500]);
    });

    it('should not clamp a bound dtWidth before the layout is decided', () => {
        const fixture = createComponent(KbqDl);
        const emitted: (number | null)[] = [];

        fixture.componentInstance.dtWidthChange.subscribe((width) => emitted.push(width));
        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 200);
        fixture.componentRef.setInput('dtWidth', 150);
        // Too narrow for both minimums, and below the breakpoint. Without a box (jsdom) the layout stays undecided
        // and horizontal until the observation turns it vertical: the bounds of that render must not reach `dtWidth`.
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 300 });
        fixture.detectChanges();
        layOut(fixture, { host: 300 });

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
        expect(fixture.componentInstance.dtWidth()).toBe(150);
        expect(emitted).toEqual([]);
    });

    it('should decide the layout with the first render, without waiting for the resize observer', () => {
        vi.spyOn(Element.prototype, 'getClientRects').mockReturnValue([{ width: 300 }] as unknown as DOMRectList);

        const fixture = createComponent(KbqDl);

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should keep the layout and the width of a list that gets hidden', () => {
        const fixture = createComponent(KbqDl);
        const emitted: (number | null)[] = [];

        fixture.componentInstance.dtWidthChange.subscribe((width) => emitted.push(width));
        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
        fixture.componentRef.setInput('dtWidth', 300);
        fixture.detectChanges();
        layOut(fixture, { host: 600 });

        // `display: none` on an ancestor, as in an inactive tab: no box, and zero sizes.
        Object.defineProperty(getDlElement(fixture), 'getClientRects', { configurable: true, value: () => [] });
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 0 });
        notifyResize(fixture);

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
        expect(fixture.componentInstance.dtWidth()).toBe(300);
        expect(getResizeHandle(fixture)!.getAttribute('aria-valuemax')).toBe('500');

        // A new minimum re-measures the bounds after the render, still without a box to measure.
        fixture.componentRef.setInput('dtMinWidth', 120);
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(300);
        expect(emitted).toEqual([]);
    });

    it('should take the default minimum from the term once a list created hidden is shown', () => {
        const fixture = createComponent(ResizableDl);
        const dl = fixture.debugElement.query(By.directive(KbqDl)).nativeElement as HTMLElement;
        const term = dl.querySelector<HTMLElement>('.kbq-dt')!;

        // Created without a box, so the term had no width to take.
        expect(getResizeHandle(fixture)!.getAttribute('aria-valuemin')).toBe('0');

        Object.defineProperty(dl, 'getClientRects', { configurable: true, value: () => [{ width: 600 }] });
        Object.defineProperty(term, 'getBoundingClientRect', { configurable: true, value: () => ({ width: 120 }) });
        notifyResize(fixture);

        expect(getResizeHandle(fixture)!.getAttribute('aria-valuemin')).toBe('120');
    });

    it('should not take the default minimum from a term spanning the vertical layout', () => {
        const fixture = createComponent(ResizableDl);
        const dl = fixture.debugElement.query(By.directive(KbqDl)).nativeElement as HTMLElement;
        const term = dl.querySelector<HTMLElement>('.kbq-dt')!;
        let termWidth = 600;

        fixture.componentInstance.vertical.set(true);
        fixture.detectChanges();
        Object.defineProperty(dl, 'getClientRects', { configurable: true, value: () => [{ width: 600 }] });
        Object.defineProperty(term, 'getBoundingClientRect', {
            configurable: true,
            value: () => ({ width: termWidth })
        });
        notifyResize(fixture);

        // Switching the layout changes the list height, which the resize observer reports.
        termWidth = 150;
        fixture.componentInstance.vertical.set(false);
        fixture.detectChanges();
        notifyResize(fixture);

        expect(getResizeHandle(fixture)!.getAttribute('aria-valuemin')).toBe('150');
    });

    it('should re-measure the term column when wide changes its share of the list', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.detectChanges();
        layOut(fixture, { host: 600, track: 140 });

        const resizeHandle = getResizeHandle(fixture)!;

        expect(resizeHandle.getAttribute('aria-valuenow')).toBe('140');

        // Two columns instead of four: the term column widens while the host keeps its size, so nothing is observed.
        Object.defineProperty(resizeHandle.parentElement, 'clientWidth', { configurable: true, value: 292 });
        fixture.componentRef.setInput('wide', true);
        fixture.detectChanges();

        expect(resizeHandle.getAttribute('aria-valuenow')).toBe('292');
    });

    it('should report a bound width within the separator bounds before the host is measured', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('dtWidth', 500);
        fixture.detectChanges();

        const resizeHandle = getResizeHandle(fixture)!;

        // jsdom has no layout, as a server render or a hidden list: the upper bound falls back to the minimum.
        expect(resizeHandle.getAttribute('aria-valuemax')).toBe('100');
        expect(resizeHandle.getAttribute('aria-valuenow')).toBe('100');
        expect(fixture.componentInstance.dtWidth()).toBe(500);
    });

    it('should leave the keys it does not handle to the browser', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        const getComputedStyle = vi.spyOn(window, 'getComputedStyle');
        const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });

        getResizeHandle(fixture)!.dispatchEvent(event);

        expect(event.defaultPrevented).toBe(false);
        expect(getComputedStyle).not.toHaveBeenCalled();
        expect(fixture.componentInstance.dtWidth()).toBeNull();
    });

    it('should not read the layout during change detection', () => {
        const fixture = createComponent(KbqDl);

        fixture.componentRef.setInput('resizable', true);
        fixture.detectChanges();
        layOut(fixture, { host: 600, track: 150 });

        const getComputedStyle = vi.spyOn(window, 'getComputedStyle');
        const clientWidth = vi.fn(() => 600);

        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, get: clientWidth });

        fixture.componentRef.setInput('verticalAlign', 'center');
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical-align-center');
        expect(getComputedStyle).not.toHaveBeenCalled();
        expect(clientWidth).not.toHaveBeenCalled();
    });
});

@Component({
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl wide vertical>
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `
})
class DlWithValuelessAttributes {}

@Component({
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl dtMinWidth ddMinWidth="abc">
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `
})
class DlWithInvalidWidths {}

@Component({
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl verticalBreakpoint="700" dtMinWidth="120" ddMinWidth="80">
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `
})
class DlWithStringWidths {}

@Component({
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl resizable [vertical]="vertical()">
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `
})
class ResizableDl {
    readonly vertical = signal<boolean | null>(null);
}

@Component({
    imports: [KbqDlModule],
    template: `
        <kbq-dl>
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `
})
class DlFromModule {}

@Component({
    imports: [KbqDlComponent, KbqDtComponent, KbqDdComponent],
    template: `
        <kbq-dl>
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `
})
class DlWithDeprecatedNames {}

@Component({
    imports: [KbqDl, KbqDt, KbqDd],
    template: `
        <kbq-dl>
            <kbq-dt>term</kbq-dt>
            <kbq-dd>description</kbq-dd>
        </kbq-dl>
    `,
    providers: [kbqDlOptionsProvider({ wide: false, verticalAlign: 'center' })]
})
class DlWithNestedOptions {}
