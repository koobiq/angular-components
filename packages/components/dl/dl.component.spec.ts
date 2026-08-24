import { Directionality } from '@angular/cdk/bidi';
import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Injectable, Provider, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { enUSLocaleData, kbqA11yLocaleConfigurationProvider } from '@koobiq/components/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { KbqDlAlign, KbqDlComponent } from './dl.component';

/** `SharedResizeObserver` stand-in: the real one never emits in jsdom, where `ResizeObserver` is a no-op stub. */
@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

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

describe(KbqDlComponent.name, () => {
    it('should use start alignment by default', () => {
        const fixture = createComponent(KbqDlComponent);

        expect(fixture.componentInstance.verticalAlign()).toBe('start');
        expect(fixture.componentInstance.horizontalAlign()).toBe('start');
        expect(getDlElement(fixture).className).toBe('kbq-dl');
    });

    it.each<{ align: Exclude<KbqDlAlign, 'start'>; className: string }>([
        { align: 'center', className: 'kbq-dl_vertical-align-center' },
        { align: 'end', className: 'kbq-dl_vertical-align-end' }
    ])('should apply $align vertical alignment', ({ align, className }) => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('verticalAlign', align);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain(className);
    });

    it.each<{ align: Exclude<KbqDlAlign, 'start'>; className: string }>([
        { align: 'center', className: 'kbq-dl_horizontal-align-center' },
        { align: 'end', className: 'kbq-dl_horizontal-align-end' }
    ])('should apply $align horizontal alignment', ({ align, className }) => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('horizontalAlign', align);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain(className);
    });

    it('should apply layout classes', () => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('wide', true);
        fixture.componentRef.setInput('vertical', true);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_wide');
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
    });

    it('should render resize handle only when resizing is enabled for horizontal layout', () => {
        const fixture = createComponent(KbqDlComponent);

        expect(getResizeHandle(fixture)).toBeNull();

        fixture.componentRef.setInput('resizable', true);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)).not.toBeNull();

        fixture.componentRef.setInput('vertical', true);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)).toBeNull();
    });

    it('should constrain the resize track to the configured widths once a width is set', () => {
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 200);
        fixture.detectChanges();

        expect(getDlElement(fixture).style.getPropertyValue('--kbq-description-list-column-min-width')).toBe('200px');
    });

    it('should not constrain the resting track before a width is set, so the separator stays on the column border', () => {
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 120);
        fixture.componentRef.setInput('dtWidth', 200);
        Object.defineProperty(getDlElement(fixture), 'clientWidth', { configurable: true, value: 600 });
        fixture.detectChanges();

        const resizeHandle = getResizeHandle(fixture)!;

        resizeHandle.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(120);
        expect(getDlElement(fixture).classList).toContain('kbq-dl_resized');

        resizeHandle.dispatchEvent(new MouseEvent('dblclick'));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBeNull();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_resized');
    });

    it('should update the shared dt width on pointer drag', () => {
        const fixture = createComponent(KbqDlComponent);

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

    it('should reverse horizontal resize direction in RTL', () => {
        const fixture = createComponent(KbqDlComponent, [
            { provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }
        ]);

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
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.style.cursor).toBe('col-resize');
    });

    it('should advertise the grow-only direction with an e-resize cursor at the minimum width', () => {
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent);

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
        const fixture = createComponent(KbqDlComponent, [
            { provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }
        ]);

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
        const fixture = createComponent(KbqDlComponent, [
            { provide: Directionality, useValue: { value: 'rtl', change: EMPTY } }
        ]);

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

    it('should switch the cursor to grow-only when a pointer drag collapses the column to its minimum', () => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', 100);
        fixture.componentRef.setInput('ddMinWidth', 100);
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

        // Drag left past the minimum: the width clamps to 100 and the cursor must advertise the grow-only direction.
        resizeHandle.dispatchEvent(new MouseEvent('pointerdown', { clientX: 120 }));
        document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX: 50 }));
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(100);
        expect(resizeHandle.style.cursor).toBe('e-resize');
    });

    it('should fall back to the localized separator name for the aria-label', () => {
        const fixture = createComponent(KbqDlComponent, [
            kbqA11yLocaleConfigurationProvider({ ...enUSLocaleData.a11y, resizeColumns: 'Resize the columns' })
        ]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.getAttribute('aria-label')).toBe('Resize the columns');
    });

    it('should prefer the provided resizer aria-label over the localized default', () => {
        const fixture = createComponent(KbqDlComponent, [
            kbqA11yLocaleConfigurationProvider({ ...enUSLocaleData.a11y, resizeColumns: 'Localized default' })
        ]);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('resizerAriaLabel', 'Custom label');
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.getAttribute('aria-label')).toBe('Custom label');
    });

    it('should clamp a negative dt min width to zero', () => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', -50);
        fixture.detectChanges();

        expect(getResizeHandle(fixture)!.getAttribute('aria-valuemin')).toBe('0');
    });

    it('should auto-detect the vertical layout from the host width via the resize observer', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);

        // The layout decision reads `getClientRects()`; report a width below the default `verticalBreakpoint` (400).
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 320 } as DOMRect]
        });

        // Flush the resize-observer debounce so the initial `startWith(null)` emission runs `updateLayout`.
        tick(100);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
        expect(getResizeHandle(fixture)).toBeNull();
        flush();
    }));

    it('should keep the horizontal layout when the host is wider than verticalBreakpoint', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('resizable', true);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 800 } as DOMRect]
        });

        tick(100);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
        expect(getResizeHandle(fixture)).not.toBeNull();
        flush();
    }));

    it('should let an explicit vertical input override the auto-detection', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);

        // Host is narrow (auto-detection would choose vertical), but the explicit input forces horizontal.
        fixture.componentRef.setInput('vertical', false);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 200 } as DOMRect]
        });

        tick(100);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
        flush();
    }));

    it('should re-evaluate the layout against verticalBreakpoint on every resize while in auto mode', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);
        const observer = TestBed.inject(SharedResizeObserver) as MockResizeObserver;

        let width = 800;

        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width } as DOMRect]
        });

        tick(100);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');

        // Shrink below the threshold: the layout must switch to vertical, not stay locked to the first measurement.
        width = 300;
        observer.changes.next([]);
        tick(100);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');

        // Grow back above the threshold: it must switch back to horizontal.
        width = 800;
        observer.changes.next([]);
        tick(100);
        fixture.detectChanges();
        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
        flush();
    }));

    it('should honor a custom verticalBreakpoint as the vertical-layout threshold', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);

        // 600px is above the default threshold (400) but below the custom one (700), so only a working
        // `verticalBreakpoint` input makes the layout switch to vertical here.
        fixture.componentRef.setInput('verticalBreakpoint', 700);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        tick(100);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
        flush();
    }));

    it('should stay horizontal when the host is wider than a custom verticalBreakpoint', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);

        fixture.componentRef.setInput('verticalBreakpoint', 500);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        tick(100);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).not.toContain('kbq-dl_vertical');
        flush();
    }));

    it('should still honor the deprecated minWidth alias as the vertical-layout threshold', fakeAsync(() => {
        const fixture = createComponent(KbqDlComponent);

        // 600px is above the default (400) but below the alias value, so only a working `minWidth` makes it vertical.
        fixture.componentRef.setInput('minWidth', 700);
        Object.defineProperty(getDlElement(fixture), 'getClientRects', {
            configurable: true,
            value: () => [{ width: 600 } as DOMRect]
        });

        tick(100);
        fixture.detectChanges();

        expect(getDlElement(fixture).classList).toContain('kbq-dl_vertical');
        flush();
    }));
});
