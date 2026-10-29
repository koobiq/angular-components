import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqDlComponent } from '@koobiq/components/dl';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    readonly changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

describe('triage dl: drag writes the raw pointer width onto the track', () => {
    let fixture: ComponentFixture<KbqDlComponent>;
    let host: HTMLElement;
    let hostWidth: number;

    const track = (): HTMLElement => host.querySelector<HTMLElement>('.kbq-dl__resize-track')!;
    const handle = (): HTMLElement => host.querySelector<HTMLElement>('.kbq-dl__resize-handle')!;

    const setUp = (dtMinWidth: number, ddMinWidth: number): void => {
        TestBed.configureTestingModule({
            imports: [KbqDlComponent],
            providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
        });

        fixture = TestBed.createComponent(KbqDlComponent);
        host = fixture.nativeElement;
        hostWidth = 600;

        fixture.autoDetectChanges();
        fixture.componentRef.setInput('resizable', true);
        fixture.componentRef.setInput('vertical', false);
        fixture.componentRef.setInput('dtMinWidth', dtMinWidth);
        fixture.componentRef.setInput('ddMinWidth', ddMinWidth);
        Object.defineProperty(host, 'clientWidth', { configurable: true, get: () => hostWidth });
        Object.defineProperty(host, 'getClientRects', {
            configurable: true,
            value: () => [{ width: hostWidth } as DOMRect]
        });
        fixture.detectChanges();

        // The resizer reads the start size through its border-box branch.
        track().style.boxSizing = 'border-box';
        Object.defineProperty(track(), 'getBoundingClientRect', {
            configurable: true,
            value: () => ({ width: 300, height: 0 }) as DOMRect
        });
    };

    const drag = (...pointerXs: number[]): void => {
        handle().dispatchEvent(new MouseEvent('pointerdown', { clientX: 300 }));

        for (const clientX of pointerXs) {
            document.dispatchEvent(new MouseEvent('pointermove', { buttons: 1, clientX }));
            fixture.detectChanges();
        }

        document.dispatchEvent(new MouseEvent('pointerup'));
        fixture.detectChanges();
    };

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: after a drag that ended past the minimum, a lower minimum leaves the separator track at the raw pointer width while the column keeps the clamped width', () => {
        // Bounds 150..500.
        setUp(150, 100);

        // Raw 120 (clamped to 150), then raw 110 (clamped to 150 again, so `dtWidth` does not change).
        drag(120, 110);

        expect(fixture.componentInstance.dtWidth()).toBe(150);
        // The resizer wrote the raw width; the `[style.width.px]` binding did not overwrite it because its value did not change.
        expect(track().style.width).toBe('110px');
        expect(track().style.minWidth).toBe('150px');

        fixture.componentRef.setInput('dtMinWidth', 50);
        fixture.detectChanges();

        // The track is no longer held by its min-width: the separator rests at 110 px, the column border at 150 px.
        expect(track().style.minWidth).toBe('50px');
        expect(track().style.width).toBe('110px');
        expect(host.style.getPropertyValue('--kbq-description-list-dt-width')).toBe('150px');
        expect(fixture.componentInstance.dtWidth()).toBe(150);
    });

    it('DEFECT: after a drag that ended past the maximum, a wider list leaves the separator track at the raw pointer width while the column keeps the clamped width', async () => {
        vi.useFakeTimers();
        // Bounds 100..500 at 600 px.
        setUp(100, 100);
        await vi.advanceTimersByTimeAsync(100);
        fixture.detectChanges();

        // Raw 550 (clamped to 500), then raw 580 (clamped to 500 again).
        drag(550, 580);

        expect(fixture.componentInstance.dtWidth()).toBe(500);
        expect(track().style.width).toBe('580px');
        expect(track().style.maxWidth).toBe('500px');

        // The list grows to 900 px: the maximum becomes 800.
        hostWidth = 900;
        (TestBed.inject(SharedResizeObserver) as MockResizeObserver).changes.next([]);
        await vi.advanceTimersByTimeAsync(100);
        fixture.detectChanges();

        expect(track().style.maxWidth).toBe('800px');
        expect(track().style.width).toBe('580px');
        expect(host.style.getPropertyValue('--kbq-description-list-dt-width')).toBe('500px');
        expect(fixture.componentInstance.dtWidth()).toBe(500);
        await vi.runOnlyPendingTimersAsync();
    });
});
