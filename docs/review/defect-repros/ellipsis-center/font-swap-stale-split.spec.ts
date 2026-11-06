import { SharedResizeObserver } from '@angular/cdk/observers/private';
import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KbqEllipsisCenterDirective, KbqEllipsisCenterModule } from '@koobiq/components/ellipsis-center';
import { Subject } from 'rxjs';

@Component({
    imports: [KbqEllipsisCenterModule],
    template: `
        <span [kbqEllipsisCenter]="name"></span>
    `
})
class TestApp {
    readonly directive = viewChild.required(KbqEllipsisCenterDirective);

    name = 'annual-report-for-the-fiscal-year-2024.pdf';
}

describe('triage: ellipsis-center re-measures only on a host width change', () => {
    let fixture: ComponentFixture<TestApp>;
    let host: HTMLElement;
    let resize$: Subject<ResizeObserverEntry[]>;
    let textWidth: number;

    const halves = () => ({
        start: (host.querySelector('.kbq-ellipsis-center_data-text-start') as HTMLElement).innerText,
        end: (host.querySelector('.kbq-ellipsis-center_data-text-end') as HTMLElement).innerText
    });

    beforeEach(async () => {
        vi.useFakeTimers();

        resize$ = new Subject<ResizeObserverEntry[]>();

        TestBed.configureTestingModule({
            imports: [TestApp],
            providers: [{ provide: SharedResizeObserver, useValue: { observe: () => resize$ } }]
        });

        fixture = TestBed.createComponent(TestApp);
        fixture.detectChanges();

        host = fixture.debugElement.query((el) => el.nativeElement.tagName === 'SPAN').nativeElement;

        // Host clamped to a 300px container; the text measures 280px in the fallback face, so it fits.
        textWidth = 280;
        vi.spyOn(host, 'clientWidth', 'get').mockReturnValue(300);
        vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockImplementation(() => textWidth);

        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('DEFECT: text that overflows after a web font swaps in keeps the stale unsplit layout and a disabled hint', async () => {
        const directive = fixture.componentInstance.directive();

        expect(halves()).toEqual({ start: fixture.componentInstance.name, end: '' });
        expect(directive.disabled).toBe(true);

        // The web font swaps in and the same text now renders 360px wide; the host keeps its 300px.
        textWidth = 360;

        // Nothing observes the text itself, so with the host size unchanged nothing re-measures.
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        expect(halves()).toEqual({ start: fixture.componentInstance.name, end: '' });
        expect(directive.disabled).toBe(true);

        // Even a size notification (e.g. the line height changed with the face) is dropped by the width guard.
        resize$.next([]);
        await vi.advanceTimersByTimeAsync(1000);
        fixture.detectChanges();

        expect(halves()).toEqual({ start: fixture.componentInstance.name, end: '' });
        expect(directive.disabled).toBe(true);

        // A fresh measurement with the same widths splits the text and enables the hint: the state above is stale.
        directive.refresh();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(halves().end).not.toBe('');
        expect(halves().start + halves().end).toBe(fixture.componentInstance.name);
        expect(directive.disabled).toBe(false);
    });
});
