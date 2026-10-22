import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqEllipsisCenterDirective, KbqEllipsisCenterModule } from '@koobiq/components/ellipsis-center';

const NAME = 'annual-report-for-the-fiscal-year-2024.pdf';

@Component({
    imports: [KbqEllipsisCenterModule],
    template: `
        <span #withContent [kbqEllipsisCenter]="name"><b class="prefix">Draft:</b></span>
        <span #plain [kbqEllipsisCenter]="name"></span>
    `
})
class TestApp {
    readonly withContent = viewChild.required('withContent', { read: ElementRef });
    readonly withContentDirective = viewChild.required('withContent', { read: KbqEllipsisCenterDirective });
    readonly plain = viewChild.required('plain', { read: ElementRef });

    name = NAME;
}

describe('triage: ellipsis-center with content already inside the host', () => {
    let fixture: ComponentFixture<TestApp>;
    let overlayContainerElement: HTMLElement;

    const tooltipElement = () => overlayContainerElement.querySelector<HTMLElement>('.kbq-tooltip');

    const hover = async (element: HTMLElement) => {
        dispatchMouseEvent(element, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(410);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
    };

    beforeEach(async () => {
        vi.useFakeTimers();

        TestBed.configureTestingModule({ imports: [TestApp] });

        fixture = TestBed.createComponent(TestApp);
        overlayContainerElement = TestBed.inject(OverlayContainer).getContainerElement();
        fixture.detectChanges();

        const app = fixture.componentInstance;

        // Each host is 150px wide; the text alone needs 420px, so it overflows and gets split.
        vi.spyOn(app.withContent().nativeElement, 'clientWidth', 'get').mockReturnValue(150);
        vi.spyOn(app.plain().nativeElement, 'clientWidth', 'get').mockReturnValue(150);
        vi.spyOn(Element.prototype, 'scrollWidth', 'get').mockReturnValue(420);

        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();
    });

    afterEach(async () => {
        await vi.runOnlyPendingTimersAsync();
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('DEFECT: other content is kept beside the halves and is ignored by the tail length', () => {
        const host = fixture.componentInstance.withContent().nativeElement;
        const children = Array.from(host.children).map((child) => child.className);

        expect(children).toEqual([
            'prefix',
            'kbq-ellipsis-center_data-text-start',
            'kbq-ellipsis-center_data-text-end'
        ]);

        // The tail gets the same length as in a host with nothing else in it.
        const plainEnd = fixture.componentInstance
            .plain()
            .nativeElement.querySelector('.kbq-ellipsis-center_data-text-end') as HTMLElement;
        const withContentEnd = host.querySelector('.kbq-ellipsis-center_data-text-end') as HTMLElement;

        expect(withContentEnd.innerText).not.toBe('');
        expect(withContentEnd.innerText).toBe(plainEnd.innerText);
    });

    it('DEFECT: the open tooltip of a host with other content is linked through aria-describedby', async () => {
        const host = fixture.componentInstance.withContent().nativeElement;

        expect(fixture.componentInstance.withContentDirective().disabled).toBe(false);
        expect(host.textContent).toBe(`Draft:${NAME}`);

        await hover(host);

        expect(tooltipElement()?.textContent?.trim()).toBe(NAME);
        expect(host.getAttribute('aria-describedby')).toBe(tooltipElement()?.id);
    });

    it('control: the open tooltip of a host without other content is not linked', async () => {
        const host = fixture.componentInstance.plain().nativeElement;

        await hover(host);

        expect(tooltipElement()?.textContent?.trim()).toBe(NAME);
        expect(host.hasAttribute('aria-describedby')).toBe(false);
    });
});
