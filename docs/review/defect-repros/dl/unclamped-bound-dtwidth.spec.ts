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

/** A 600 px resizable list with `dtMinWidth` 200 and `ddMinWidth` 100 (bounds 200..500), measured once. */
const createMeasuredList = async (): Promise<ComponentFixture<KbqDlComponent>> => {
    TestBed.configureTestingModule({
        imports: [KbqDlComponent],
        providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
    });

    const fixture = TestBed.createComponent(KbqDlComponent);
    const host: HTMLElement = fixture.nativeElement;

    fixture.autoDetectChanges();
    fixture.componentRef.setInput('resizable', true);
    fixture.componentRef.setInput('dtMinWidth', 200);
    fixture.componentRef.setInput('ddMinWidth', 100);
    Object.defineProperty(host, 'clientWidth', { configurable: true, value: 600 });
    Object.defineProperty(host, 'getClientRects', { configurable: true, value: () => [{ width: 600 } as DOMRect] });
    fixture.detectChanges();

    // The first measurement.
    await vi.advanceTimersByTimeAsync(100);
    fixture.detectChanges();

    return fixture;
};

describe('triage dl: dtWidth bound after the first measurement', () => {
    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: a dtWidth below the minimum bound after the first measurement reaches the grid unclamped while the separator track is held at the minimum', async () => {
        vi.useFakeTimers();

        const fixture = await createMeasuredList();
        const host: HTMLElement = fixture.nativeElement;
        const emitted: (number | null)[] = [];

        fixture.componentInstance.dtWidthChange.subscribe((width) => emitted.push(width));

        fixture.componentRef.setInput('dtWidth', 50);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        const track = host.querySelector<HTMLElement>('.kbq-dl__resize-track')!;

        // Not clamped: the value stays below the 200 px minimum and nothing is reported back.
        expect(fixture.componentInstance.dtWidth()).toBe(50);
        expect(emitted).toEqual([]);
        // The grid column (`grid-template-columns: var(--kbq-description-list-dt-width) ...`) takes 50 px...
        expect(host.classList).toContain('kbq-dl_resized');
        expect(host.style.getPropertyValue('--kbq-description-list-dt-width')).toBe('50px');
        // ...while the separator track is held at 200 px by its min-width.
        expect(track.style.width).toBe('50px');
        expect(track.style.minWidth).toBe('200px');

        // Only the next size change of the list clamps it.
        (TestBed.inject(SharedResizeObserver) as MockResizeObserver).changes.next([]);
        await vi.advanceTimersByTimeAsync(100);
        fixture.detectChanges();

        expect(fixture.componentInstance.dtWidth()).toBe(200);
        expect(emitted).toEqual([200]);
        await vi.runOnlyPendingTimersAsync();
    });

    it('DEFECT: a dtWidth above the maximum bound after the first measurement makes the term column wider than the list allows while the separator stays at the maximum', async () => {
        vi.useFakeTimers();

        const fixture = await createMeasuredList();
        const host: HTMLElement = fixture.nativeElement;

        fixture.componentRef.setInput('dtWidth', 1000);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        const track = host.querySelector<HTMLElement>('.kbq-dl__resize-track')!;

        expect(fixture.componentInstance.dtWidth()).toBe(1000);
        expect(host.style.getPropertyValue('--kbq-description-list-dt-width')).toBe('1000px');
        expect(track.style.maxWidth).toBe('500px');
        await vi.runOnlyPendingTimersAsync();
    });
});
