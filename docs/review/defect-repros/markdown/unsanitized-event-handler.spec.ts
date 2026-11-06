import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqMarkdownModule } from '@koobiq/components/markdown';

@Component({
    selector: 'markdown-with-user-text',
    imports: [KbqMarkdownModule],
    template: `
        <kbq-markdown [markdownText]="text" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class MarkdownWithUserText {
    // Stands for text a user typed: raw HTML is valid Markdown.
    readonly text = `Hello <img src="x" onerror="this.setAttribute('data-pwned', 'yes')"> world`;
}

describe('triage: KbqMarkdown does not sanitize its output', () => {
    it('DEFECT: an event-handler attribute in markdownText reaches the DOM and runs', async () => {
        TestBed.configureTestingModule({ imports: [MarkdownWithUserText] });
        const fixture = TestBed.createComponent(MarkdownWithUserText);

        fixture.detectChanges();
        await fixture.whenStable();

        const img: HTMLImageElement = fixture.nativeElement.querySelector('.kbq-markdown__output img');

        expect(img).not.toBeNull();
        expect(img.getAttribute('onerror')).toContain('data-pwned');

        img.dispatchEvent(new Event('error'));

        expect(img.getAttribute('data-pwned')).toBe('yes');
    });
});
