import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqDlComponent } from '@koobiq/components/dl';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    readonly changes = new BehaviorSubject<ResizeObserverEntry[]>([]);

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }
}

describe('triage dl: automatic layout before the first measurement', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: a 320 px list in automatic mode renders horizontally, with its separator, for the first 100 ms and then jumps to the vertical layout', async () => {
        vi.useFakeTimers();
        TestBed.configureTestingModule({
            imports: [KbqDlComponent],
            providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
        });

        const fixture = TestBed.createComponent(KbqDlComponent);
        const host: HTMLElement = fixture.nativeElement;

        Object.defineProperty(host, 'getClientRects', { configurable: true, value: () => [{ width: 320 } as DOMRect] });
        fixture.autoDetectChanges();
        fixture.componentRef.setInput('resizable', true);
        fixture.detectChanges();

        // Rendered, the list already measures 320 px, below the 400 px breakpoint, yet it is horizontal.
        expect(host.classList).not.toContain('kbq-dl_vertical');
        expect(host.querySelector('.kbq-dl__resize-handle')).not.toBeNull();

        await vi.advanceTimersByTimeAsync(99);
        fixture.detectChanges();

        expect(host.classList).not.toContain('kbq-dl_vertical');

        await vi.advanceTimersByTimeAsync(1);
        fixture.detectChanges();

        expect(host.classList).toContain('kbq-dl_vertical');
        expect(host.querySelector('.kbq-dl__resize-handle')).toBeNull();
        await vi.runOnlyPendingTimersAsync();
    });
});
