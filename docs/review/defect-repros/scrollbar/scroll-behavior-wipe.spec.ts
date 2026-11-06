import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchFakeEvent, dispatchMouseEvent } from '@koobiq/components/core';
import { KbqScrollbarViewport } from '@koobiq/components/scrollbar';

@Component({
    selector: 'test-scroll-behavior-wipe',
    imports: [KbqScrollbarViewport],
    template: `
        <div
            #viewport
            kbqScrollbarViewport
            kbqScrollbarMode="always"
            style="overflow-x: auto; overflow-y: auto; scroll-behavior: smooth"
        ></div>
    `
})
class TestApp {
    readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
}

const setRect = (el: HTMLElement, rect: Partial<DOMRect>): void => {
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
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

describe('triage: a bar press resets the inline scroll-behavior of the viewport', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('DEFECT: the consumer inline scroll-behavior "smooth" is wiped to "" after a press on the bar', async () => {
        TestBed.configureTestingModule({ imports: [TestApp] });
        const fixture = TestBed.createComponent(TestApp);

        fixture.autoDetectChanges();

        const viewport = fixture.componentInstance.viewport().nativeElement;

        for (const [key, value] of Object.entries({
            clientHeight: 100,
            scrollHeight: 300,
            clientWidth: 100,
            scrollWidth: 100
        })) {
            Object.defineProperty(viewport, key, { configurable: true, value });
        }

        await vi.advanceTimersByTimeAsync(16);
        fixture.detectChanges();

        const bar = viewport.querySelector<HTMLElement>('.kbq-scrollbar-track__bar_vertical')!;
        const thumb = bar.querySelector<HTMLElement>('.kbq-scrollbar-track__thumb')!;

        Object.defineProperty(thumb, 'offsetHeight', { configurable: true, value: 0 });
        Object.defineProperty(thumb, 'offsetWidth', { configurable: true, value: 0 });
        setRect(bar, { top: 0, left: 0, height: 100, width: 100, right: 100, bottom: 100 });

        expect(viewport.style.scrollBehavior).toBe('smooth');

        dispatchMouseEvent(bar, 'mousedown', 50, 50);
        dispatchFakeEvent(window, 'mouseup');
        await vi.advanceTimersByTimeAsync(0);

        expect(viewport.scrollTop).toBe(100);
        expect(viewport.style.scrollBehavior).toBe('');
    });
});
