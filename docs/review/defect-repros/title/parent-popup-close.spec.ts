import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, Directive, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { dispatchMouseEvent, KBQ_PARENT_POPUP, KbqParentPopup } from '@koobiq/components/core';
import { KbqTitleDirective } from '@koobiq/components/title';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { Subject } from 'rxjs';

/** Stand-in for the select/tree-select panel, which provides `KBQ_PARENT_POPUP` to the options inside it. */
@Directive({
    selector: '[parentPopup]',
    providers: [{ provide: KBQ_PARENT_POPUP, useExisting: ParentPopup }]
})
class ParentPopup implements KbqParentPopup {
    readonly closedStream = new Subject<boolean>();
}

@Component({
    imports: [KbqTitleDirective, KbqTooltipTrigger, ParentPopup],
    template: `
        <div parentPopup>
            <div #title kbq-title>A long option text that the panel truncates</div>
            <span #plain [kbqTooltip]="'PLAIN'">Plain tooltip</span>
        </div>
    `
})
class TitleInsideParentPopup {
    readonly titleElement = viewChild.required<ElementRef<HTMLElement>>('title');
    readonly title = viewChild.required('title', { read: KbqTitleDirective });
    readonly plainElement = viewChild.required<ElementRef<HTMLElement>>('plain');
    readonly plain = viewChild.required('plain', { read: KbqTooltipTrigger });
    readonly parentPopup = viewChild.required(ParentPopup);
}

const showByHover = async (fixture: ComponentFixture<unknown>, element: HTMLElement) => {
    dispatchMouseEvent(element, 'mouseenter');
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(500);
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);
    fixture.detectChanges();
};

const getTooltipElement = (): Element | null =>
    TestBed.inject(OverlayContainer).getContainerElement().querySelector('.kbq-tooltip');

describe('KbqTitleDirective triage: parent pop-up close', () => {
    afterEach(() => vi.useRealTimers());

    it('control: a plain kbqTooltip inside the same parent pop-up hides when it closes', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TitleInsideParentPopup);

        fixture.detectChanges();
        const { plainElement, plain, parentPopup } = fixture.componentInstance;

        await showByHover(fixture, plainElement().nativeElement);
        expect(plain().isOpen).toBe(true);

        parentPopup().closedStream.next(false);
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();

        expect(plain().isOpen).toBe(false);

        await vi.runOnlyPendingTimersAsync();
    });

    it('DEFECT: a kbq-title tooltip stays open after the parent pop-up closes', async () => {
        vi.useFakeTimers();

        const fixture = TestBed.createComponent(TitleInsideParentPopup);

        fixture.detectChanges();
        const { titleElement, title, parentPopup } = fixture.componentInstance;
        const host = titleElement().nativeElement;

        vi.spyOn(host, 'offsetWidth', 'get').mockReturnValue(100);
        vi.spyOn(host, 'scrollWidth', 'get').mockReturnValue(200);

        await showByHover(fixture, host);
        expect(title().isOpen).toBe(true);
        expect(getTooltipElement()?.textContent).toContain('A long option text');

        parentPopup().closedStream.next(false);
        await vi.advanceTimersByTimeAsync(500);
        fixture.detectChanges();

        expect(title().isOpen).toBe(true);
        expect(getTooltipElement()).not.toBeNull();

        await vi.runOnlyPendingTimersAsync();
    });
});
