import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, ElementRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { dispatchMouseEvent } from '@koobiq/components/core';
import { KbqTitleDirective } from '@koobiq/components/title';

/** The markup of the `title-multiple-text` docs example, without its stylesheet. */
@Component({
    imports: [KbqTitleDirective],
    template: `
        <div #title kbq-title>
            <div #kbqTitleContainer>
                <span #kbqTitleText>{{ name }}:</span>
                <span #kbqTitleText class="value">{{ value }}</span>
            </div>
        </div>
    `
})
class MultipleTextTitle {
    readonly name = 'Status';
    readonly value = 'A long value that does not fit and is truncated with an ellipsis';
    readonly titleElement = viewChild.required<ElementRef<HTMLElement>>('title');
    readonly title = viewChild.required('title', { read: KbqTitleDirective });
}

const getTooltipElement = (): Element | null =>
    TestBed.inject(OverlayContainer).getContainerElement().querySelector('.kbq-tooltip');

describe('KbqTitleDirective triage: several #kbqTitleText elements', () => {
    afterEach(() => vi.useRealTimers());

    it('DEFECT: the default tooltip runs the texts together with no space after the colon', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(MultipleTextTitle);

        fixture.detectChanges();
        const { titleElement, title } = fixture.componentInstance;
        const container = titleElement().nativeElement.firstElementChild as HTMLElement;
        const value = titleElement().nativeElement.querySelector('.value') as HTMLElement;

        expect(title().content).toBe('Status:A long value that does not fit and is truncated with an ellipsis');

        vi.spyOn(container, 'offsetWidth', 'get').mockReturnValue(100);
        vi.spyOn(value, 'scrollWidth', 'get').mockReturnValue(300);

        dispatchMouseEvent(titleElement().nativeElement, 'mouseenter');
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();
        await vi.advanceTimersByTimeAsync(0);
        fixture.detectChanges();

        expect(getTooltipElement()?.textContent?.trim()).toBe(
            'Status:A long value that does not fit and is truncated with an ellipsis'
        );

        await vi.runOnlyPendingTimersAsync();
    });
});
