import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { ChangeDetectionStrategy, Component, Injectable, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqClampedText } from '@koobiq/components/clamped-text';
import { Observable, Subject } from 'rxjs';

/**
 * Stands in for the browser's ResizeObserver: it delivers an entry only when the test says the content box
 * changed size. Changing `rows` while the clamp class is absent changes no layout, so a real observer stays silent.
 */
@Injectable()
class MockResizeObserver extends SharedResizeObserver {
    private readonly changes = new Subject<ResizeObserverEntry[]>();

    override observe(_target: Element, _options?: ResizeObserverOptions): Observable<ResizeObserverEntry[]> {
        return this.changes.asObservable();
    }

    emit(): void {
        this.changes.next([]);
    }
}

const mockRenderedRows = (rows: number): void => {
    const rects = Object.assign(
        Array.from({ length: rows }, (_, index) => ({ top: index * 20 })),
        { item: () => null }
    ) as unknown as DOMRectList;

    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue(rects);
};

@Component({
    selector: 'clamped-text-test',
    imports: [KbqClampedText],
    template: `
        <kbq-clamped-text [rows]="rows()" [scrollOnCollapse]="false">{{ text }}</kbq-clamped-text>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class ClampedTextTest {
    protected readonly text = Array.from({ length: 100 }, (_, index) => `Text ${index}`).join(' ');
    readonly rows = signal(5);
}

describe('triage: a change of rows that leaves the content box the same size is never measured', () => {
    let fixture: ComponentFixture<ClampedTextTest>;

    const measure = async () => {
        (TestBed.inject(SharedResizeObserver) as unknown as MockResizeObserver).emit();
        await new Promise((resolve) => setTimeout(resolve));
        await fixture.whenStable();
    };

    const toggle = (): HTMLElement | null => fixture.nativeElement.querySelector('.kbq-clamped-text__toggle');
    const content = (): HTMLElement => fixture.nativeElement.querySelector('.kbq-clamped-text__content');
    const clamped = () => content().classList.contains('kbq-clamped-text__content_collapsed');

    const create = async (rows: number, renderedRows: number) => {
        mockRenderedRows(renderedRows);
        TestBed.configureTestingModule({
            imports: [ClampedTextTest],
            providers: [{ provide: SharedResizeObserver, useClass: MockResizeObserver }]
        });
        fixture = TestBed.createComponent(ClampedTextTest);
        fixture.componentInstance.rows.set(rows);
        fixture.detectChanges();
        await fixture.whenStable();
        await measure();
    };

    afterEach(() => vi.restoreAllMocks());

    it('DEFECT: expanded 20-line text keeps a toggle that changes nothing after rows grows to 30', async () => {
        await create(5, 20);

        toggle()!.click();
        await fixture.whenStable();
        expect(clamped()).toBe(false);

        fixture.componentInstance.rows.set(30);
        await fixture.whenStable();

        // 20 rendered lines do not exceed 30 + 1, yet the toggle stays
        expect(toggle()).not.toBeNull();

        // Collapsing now clamps 20 lines to 30: nothing is hidden, but the toggle still offers "Expand"
        toggle()!.click();
        await fixture.whenStable();
        expect(clamped()).toBe(true);
        expect(content().style.getPropertyValue('--kbq-clamped-text-line-clamp')).toBe('30');
        expect(toggle()!.getAttribute('aria-expanded')).toBe('false');

        // Control: a measurement would have removed the toggle
        await measure();
        expect(toggle()).toBeNull();
        expect(clamped()).toBe(false);
    });

    it('DEFECT: lowering rows below the line count of text that fit leaves it unclamped and without a toggle', async () => {
        await create(30, 20);

        expect(toggle()).toBeNull();
        expect(clamped()).toBe(false);

        fixture.componentInstance.rows.set(5);
        await fixture.whenStable();

        expect(toggle()).toBeNull();
        expect(clamped()).toBe(false);

        // Control: a measurement would have clamped it and shown the toggle
        await measure();
        expect(toggle()).not.toBeNull();
        expect(clamped()).toBe(true);
    });
});
