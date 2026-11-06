import { Component, Provider, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextarea, KbqTextareaModule } from '@koobiq/components/textarea';

const LINE_HEIGHT = 20;
const PADDING = 5;
const MAX_ROWS = 5;

/** A borderless textarea with the Koobiq vertical padding: computed `height` equals `clientHeight` (0 in jsdom). */
const measuredStyles = (): Provider => ({
    provide: KBQ_WINDOW,
    useValue: {
        ...window,
        getComputedStyle: (element: Element) => ({
            ...window.getComputedStyle(element),
            lineHeight: `${LINE_HEIGHT}px`,
            height: '0px',
            paddingTop: `${PADDING}px`,
            paddingBottom: `${PADDING}px`
        })
    }
});

@Component({
    imports: [KbqFormFieldModule, KbqTextareaModule],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [maxRows]="5"></textarea>
        </kbq-form-field>
    `
})
class TestApp {
    readonly textarea = viewChild.required(KbqTextarea);
}

describe('KbqTextarea triage: clamp at the row limit', () => {
    let scrollHeight = 0;
    let original: PropertyDescriptor | undefined;

    beforeEach(() => {
        original = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'scrollHeight');
        // The measurement reads a detached clone, so the stub sits on the prototype.
        Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', {
            get: () => scrollHeight,
            configurable: true
        });
    });

    afterEach(() => {
        if (original) Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', original);
        else delete (HTMLTextAreaElement.prototype as any).scrollHeight;
    });

    it('DEFECT: reaching maxRows clamps min-height to maxRows * lineHeight without the padding, shrinking the field', async () => {
        TestBed.configureTestingModule({ imports: [TestApp], providers: [measuredStyles()] });

        const fixture = TestBed.createComponent(TestApp);

        fixture.detectChanges();
        await fixture.whenStable();

        const textarea = fixture.componentInstance.textarea();
        const element: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');

        // Four lines of text: the browser reports the content plus the vertical padding.
        scrollHeight = 4 * LINE_HEIGHT + 2 * PADDING;
        textarea['grow']();
        fixture.detectChanges();

        const heightBelowLimit = parseInt(element.style.minHeight, 10);

        expect(textarea.maxRowLimitReached()).toBe(false);
        // 4 lines + the free row + padding.
        expect(heightBelowLimit).toBe(5 * LINE_HEIGHT + 2 * PADDING);

        // The fifth line.
        scrollHeight = 5 * LINE_HEIGHT + 2 * PADDING;
        textarea['grow']();
        fixture.detectChanges();

        const heightAtLimit = parseInt(element.style.minHeight, 10);

        expect(textarea.maxRowLimitReached()).toBe(true);
        expect(element.classList).toContain('kbq-textarea_max-row-limit-reached');
        expect(heightAtLimit).toBe(MAX_ROWS * LINE_HEIGHT);
        // The box (border-box) holds less than maxRows lines once the padding is taken out: 4.5 lines.
        expect((heightAtLimit - 2 * PADDING) / LINE_HEIGHT).toBe(4.5);
        // And it is shorter than it was one line earlier, by the padding.
        expect(heightBelowLimit - heightAtLimit).toBe(2 * PADDING);
    });
});
