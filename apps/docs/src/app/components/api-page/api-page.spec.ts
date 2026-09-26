import { TestBed } from '@angular/core/testing';
import { axe } from 'jest-axe';
import { DocsApiPage } from './api-page';
import { DocsApiBlock, DocsApiEntryPoint } from './api-page.types';

const paragraph = (text: string): DocsApiBlock => ({ type: 'html', html: `<p class="kbq-markdown__p">${text}</p>` });

const ENTRY_POINT: DocsApiEntryPoint = {
    path: '@koobiq/components/alert',
    primaryExport: 'KbqAlertModule',
    entries: [
        {
            name: 'KbqAlert',
            kind: 'component',
            description: [
                paragraph('Shows important information.'),
                { type: 'code', code: '<kbq-alert alertColor="error" />', language: 'html' }
            ],
            signature: "@Component({ selector: 'kbq-alert' })\nclass KbqAlert {}",
            members: [
                {
                    id: 'KbqAlert-title',
                    name: '[title]',
                    type: 'string',
                    required: true,
                    description: [paragraph('The title.')]
                },
                {
                    id: 'KbqAlert-color',
                    name: '[color]',
                    type: 'string',
                    origin: 'KbqColorDirective',
                    deprecated: { reason: [paragraph('Use the style.')] }
                },
                {
                    id: 'KbqAlert-open',
                    name: 'open()',
                    type: 'boolean',
                    description: [paragraph('Opens it.')],
                    params: [{ name: 'delay?', type: 'number', description: [paragraph('The delay.')] }],
                    returns: { type: 'boolean', description: [paragraph('Whether it opened.')] }
                }
            ]
        },
        { name: 'KBQ_ALERT', kind: 'const', deprecated: {}, signature: 'const KBQ_ALERT: string;' }
    ]
};

describe(DocsApiPage.name, () => {
    const render = (entryPoint = ENTRY_POINT): HTMLElement => {
        const fixture = TestBed.createComponent(DocsApiPage);

        fixture.componentRef.setInput('entryPoint', entryPoint);
        fixture.detectChanges();

        return fixture.nativeElement;
    };

    const getTexts = (element: Element, selector: string): string[] =>
        Array.from(element.querySelectorAll(selector), (node) => node.textContent!.trim());

    it('renders the import of the module, then each entry anchored by its name, with its kind', () => {
        const page = render();

        expect(page.querySelector('.docs-api__import')?.textContent).toContain(
            "import { KbqAlertModule } from '@koobiq/components/alert';"
        );
        expect(Array.from(page.querySelectorAll('.docs-api__entry-name'), ({ id }) => id)).toEqual([
            'KbqAlert',
            'KBQ_ALERT'
        ]);
        expect(getTexts(page, '.docs-api__entry-header kbq-badge')).toEqual(['component', 'const', 'Deprecated']);
    });

    it('leaves the import out for an entry point without a module', () => {
        expect(render({ ...ENTRY_POINT, primaryExport: undefined }).querySelector('.docs-api__import')).toBeNull();
    });

    it('renders the HTML of a text as it is, and its code in a code block', () => {
        const description = render().querySelector('.docs-api__entry-description')!;

        expect(getTexts(description, '.kbq-markdown__p')).toEqual(['Shows important information.']);
        expect(description.querySelector('kbq-code-block')?.textContent).toContain('<kbq-alert alertColor="error" />');
    });

    it('lists the members anchored by their id, with their type and badges', () => {
        const members = Array.from(render().querySelectorAll('.docs-api__member'));

        expect(members.map(({ id }) => id)).toEqual(['KbqAlert-title', 'KbqAlert-color', 'KbqAlert-open']);
        expect(members.map((member) => getTexts(member, ':scope > dt > *'))).toEqual([
            ['[title]', 'string', 'required'],
            ['[color]', 'string', 'Deprecated', 'from KbqColorDirective'],
            ['open()', 'boolean']
        ]);
    });

    // The badge says that it is deprecated; the note beside the description says why, when the tag does.
    it('renders the reason of a deprecation under the description', () => {
        expect(getTexts(render(), '.docs-api__deprecated-note')).toEqual(['Use the style.']);
    });

    it('lays the parameters and the return value of a method out alike', () => {
        const method = render().querySelector('#KbqAlert-open')!;

        expect(getTexts(method, '.docs-api__note-title')).toEqual(['Parameters', 'Returns']);
        expect(
            Array.from(method.querySelectorAll('.docs-api__param'), (param) => getTexts(param, 'dt > *, dd'))
        ).toEqual([
            ['delay?', 'number', 'The delay.'],
            ['boolean', 'Whether it opened.']
        ]);
    });

    it('marks the page as English, the language of the JSDoc', () => {
        expect(render().getAttribute('lang')).toBe('en');
    });

    it('has no axe violations', async () => {
        expect(await axe(render())).toHaveNoViolations();
    });
});
