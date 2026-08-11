import { TestBed } from '@angular/core/testing';
import { KbqMarkdownService } from '@koobiq/components/markdown';

describe(KbqMarkdownService.name, () => {
    let service: KbqMarkdownService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [KbqMarkdownService] });

        service = TestBed.inject(KbqMarkdownService);
    });

    it('should alias the tags marked emits itself', () => {
        expect(service.parseToHtml('paragraph')).toContain('<p class="kbq-markdown__p">');
        expect(service.parseToHtml('[title](https://koobiq.io)')).toContain('<a class="kbq-markdown__a ');
    });

    // `marked` hands raw HTML through untouched, so an author's own markup is what reaches the tag
    // aliasing — including the spacing a generated document would never produce.
    it('should alias a whole tag written with whitespace before the closing bracket', () => {
        expect(service.parseToHtml('<p >spaced</p>')).toBe('<p class="kbq-markdown__p">spaced</p>');
        // Containment, not equality: a tab is enough for `marked` to read the tag as inline and wrap
        // it in a paragraph of its own, which is its decision to make and not what is under test.
        expect(service.parseToHtml('<th\t>spaced</th>')).toContain('<th class="kbq-markdown__th">spaced</th>');
    });

    // The reason `th` and `p` are aliased on the whole tag rather than on the opening `<th`/`<p`:
    // `thead` and `pre` start with them and have aliases of their own to keep.
    it('should leave a tag whose name merely starts with a whole-tag name to its own alias', () => {
        const table = service.parseToHtml('| a |\n| - |\n| 1 |');

        expect(table).toContain('<thead class="kbq-markdown__thead">');
        expect(table).toContain('<th class="kbq-markdown__th">');
        expect(table).not.toContain('<thead class="kbq-markdown__th">');

        const code = service.parseToHtml('```\nx\n```');

        expect(code).toContain('<pre class="kbq-markdown__pre">');
        expect(code).not.toContain('<pre class="kbq-markdown__p">');
    });
});
