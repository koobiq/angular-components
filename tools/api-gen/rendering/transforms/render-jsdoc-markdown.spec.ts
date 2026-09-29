import { renderJsDocMarkdown } from './render-jsdoc-markdown';

const paragraph = (html: string) => ({ type: 'html', html: `<p class="kbq-markdown__p">${html}</p>` });

describe(renderJsDocMarkdown.name, () => {
    it('compiles the prose into one block of HTML', () => {
        expect(renderJsDocMarkdown('Shows a `hint`.\n\n- one\n- two', 'KbqAlert')).toEqual([
            {
                type: 'html',
                html:
                    '<p class="kbq-markdown__p">Shows a <code class="kbq-markdown__code">hint</code>.</p>' +
                    '<ul class="kbq-markdown__ul"><li class="kbq-markdown__li">one</li><li class="kbq-markdown__li">two</li></ul>'
            }
        ]);
    });

    it('sets the code apart, for the page to highlight it', () => {
        expect(
            renderJsDocMarkdown('Before.\n\n```html\n<kbq-alert />\n```\n\nAfter.\n\n```\nplain\n```', 'KbqAlert')
        ).toEqual([
            paragraph('Before.'),
            { type: 'code', code: '<kbq-alert />', language: 'html' },
            paragraph('After.'),
            { type: 'code', code: 'plain', language: 'plaintext' }
        ]);
    });

    it('renders a link tag as inline code', () => {
        expect(
            renderJsDocMarkdown('See {@link KbqAlert} and {@link KbqAlertModule | the module}.', 'KbqAlert')
        ).toEqual([
            paragraph(
                'See <code class="kbq-markdown__code">KbqAlert</code> and <code class="kbq-markdown__code">the module</code>.'
            )
        ]);
    });

    it('renders the headings of a comment below the heading of its entry', () => {
        expect(renderJsDocMarkdown('## Usage', 'KbqAlert')).toEqual([
            { type: 'html', html: '<h4 class="kbq-markdown__h4">Usage</h4>' }
        ]);
    });

    it('renders no blocks for a blank comment', () => {
        expect(renderJsDocMarkdown(' \n', 'KbqAlert')).toEqual([]);
    });

    it('fails on code it cannot set apart', () => {
        expect(() => renderJsDocMarkdown('- item\n\n  ```ts\n  code\n  ```', 'KbqAlert.color')).toThrow(
            'KbqAlert.color: a block of code has to stand on its own, outside a list or a quote'
        );
    });

    it('names the declaration in what it cannot compile', () => {
        expect(() => renderJsDocMarkdown('Keep <nobr>together</nobr>.', 'KbqAlert.color')).toThrow(
            'KbqAlert.color:1:6: <nobr> is not supported'
        );
    });
});
