import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KbqMarkdownModule, KbqMarkdownService } from '@koobiq/components/markdown';

const SOURCE = [
    '| Plain | Left |',
    '| ----- | :--- |',
    '| a     | b    |',
    '',
    '```bash',
    'npm install',
    '```',
    '',
    'A <a class="custom-link" href="#anchor">raw link</a>.'
].join('\n');

@Component({
    selector: 'markdown-with-attributes',
    imports: [KbqMarkdownModule],
    template: `
        <kbq-markdown [markdownText]="text" />
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
class MarkdownWithAttributes {
    readonly text = SOURCE;
}

const render = async (): Promise<HTMLElement> => {
    TestBed.configureTestingModule({ imports: [MarkdownWithAttributes] });
    const fixture = TestBed.createComponent(MarkdownWithAttributes);

    fixture.detectChanges();
    await fixture.whenStable();

    return fixture.nativeElement.querySelector('.kbq-markdown__output');
};

describe('triage: tag aliasing of KbqMarkdownService', () => {
    it('DEFECT: the header cell of an aligned column gets no kbq-markdown__th class', async () => {
        const output = await render();
        const [plainTh, alignedTh] = Array.from(output.querySelectorAll('th'));
        const [, alignedTd] = Array.from(output.querySelectorAll('td'));

        expect(plainTh.classList).toContain('kbq-markdown__th');

        expect(alignedTh.getAttribute('align')).toBe('left');
        expect(alignedTh.classList).not.toContain('kbq-markdown__th');

        // A body cell of the same column is aliased, because `td` is matched on its opening `<td` only.
        expect(alignedTd.getAttribute('align')).toBe('left');
        expect(alignedTd.classList).toContain('kbq-markdown__td');
    });

    it('DEFECT: the alias adds a second class attribute, so a fenced code block loses its language-* class', async () => {
        TestBed.configureTestingModule({ providers: [KbqMarkdownService] });
        const html = TestBed.inject(KbqMarkdownService).parseToHtml('```bash\nnpm install\n```');

        expect(html).toContain('<code class="kbq-markdown__code" class="language-bash">');

        TestBed.resetTestingModule();
        const output = await render();
        const code = output.querySelector('pre > code')!;

        expect(code.getAttribute('class')).toBe('kbq-markdown__code');
        expect(code.classList).not.toContain('language-bash');
    });

    it('DEFECT: a raw HTML element of a listed tag loses its own classes', async () => {
        const output = await render();
        const link = output.querySelector('a[href="#anchor"]')!;

        expect(link.classList).toContain('kbq-markdown__a');
        expect(link.classList).not.toContain('custom-link');
    });
});
