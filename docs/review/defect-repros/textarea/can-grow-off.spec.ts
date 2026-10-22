import { Component, Provider, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqTextarea, KbqTextareaModule } from '@koobiq/components/textarea';

const LINE_HEIGHT = 20;

const measuredStyles = (): Provider => ({
    provide: KBQ_WINDOW,
    useValue: {
        ...window,
        getComputedStyle: (element: Element) => ({
            ...window.getComputedStyle(element),
            lineHeight: `${LINE_HEIGHT}px`,
            height: '0px',
            paddingTop: '0px',
            paddingBottom: '0px'
        })
    }
});

@Component({
    imports: [KbqFormFieldModule, KbqTextareaModule],
    template: `
        <kbq-form-field>
            <textarea kbqTextarea [canGrow]="canGrow()" [maxRows]="maxRows()"></textarea>
        </kbq-form-field>
    `
})
class TestApp {
    readonly textarea = viewChild.required(KbqTextarea);
    readonly canGrow = signal(true);
    readonly maxRows = signal<number | undefined>(undefined);
}

describe('KbqTextarea triage: switching canGrow off', () => {
    let original: PropertyDescriptor | undefined;

    beforeEach(() => {
        original = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'scrollHeight');
        Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', { get: () => 200, configurable: true });
        TestBed.configureTestingModule({ imports: [TestApp], providers: [measuredStyles()] });
    });

    afterEach(() => {
        if (original) Object.defineProperty(HTMLTextAreaElement.prototype, 'scrollHeight', original);
        else delete (HTMLTextAreaElement.prototype as any).scrollHeight;
    });

    const setup = async (maxRows: number | undefined) => {
        const fixture = TestBed.createComponent(TestApp);

        fixture.componentInstance.maxRows.set(maxRows);
        fixture.detectChanges();
        await fixture.whenStable();

        const textarea = fixture.componentInstance.textarea();
        const element: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');

        textarea['grow']();
        fixture.detectChanges();

        return { fixture, textarea, element };
    };

    it('DEFECT: the min-height of the last measurement stays once canGrow is switched off', async () => {
        const { fixture, textarea, element } = await setup(undefined);

        // 200px of content plus the free row.
        expect(element.style.minHeight).toBe('220px');

        fixture.componentInstance.canGrow.set(false);
        fixture.detectChanges();
        await fixture.whenStable();
        textarea['grow']();

        expect(textarea.canGrow()).toBe(false);
        expect(element.classList).toContain('kbq-textarea-resizable');
        // The resizable field cannot be dragged below its last grown height.
        expect(element.style.minHeight).toBe('220px');
    });

    it('DEFECT: the row limit state and its class stay once canGrow is switched off', async () => {
        const { fixture, textarea, element } = await setup(3);

        expect(textarea.maxRowLimitReached()).toBe(true);
        expect(element.style.minHeight).toBe('60px');

        fixture.componentInstance.canGrow.set(false);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(textarea.canGrow()).toBe(false);
        expect(textarea.maxRowLimitReached()).toBe(true);
        // Both classes: `kbq-textarea_max-row-limit-reached` sets `resize: unset` after `resize: vertical`, so no handle.
        expect(element.classList).toContain('kbq-textarea-resizable');
        expect(element.classList).toContain('kbq-textarea_max-row-limit-reached');
        expect(element.style.minHeight).toBe('60px');
    });
});
