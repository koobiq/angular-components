import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { axe } from 'jest-axe';
import { BehaviorSubject, map } from 'rxjs';
import { DOCS_API_MEMBER_PARAM } from '../../constants/api-page';
import { DocsLocale } from '../../constants/locale';
import { DocsClipboardService } from '../../services/clipboard';
import { DocsLocaleService } from '../../services/locale';
import { DocsApiPage } from './api-page';
import { DocsApiBlock, DocsApiEntryPoint, DocsApiTypePart } from './api-page.types';

const provideDocsLocale = (locale: DocsLocale) => {
    const changes = new BehaviorSubject<DocsLocale>(locale);

    return {
        provide: DocsLocaleService,
        useValue: {
            get locale() {
                return changes.value;
            },
            changes: changes.asObservable(),
            isRuLocale: changes.pipe(map((value) => value === DocsLocale.Ru))
        }
    };
};

const paragraph = (text: string): DocsApiBlock => ({ type: 'html', html: `<p class="kbq-markdown__p">${text}</p>` });

const ENTRY_POINT: DocsApiEntryPoint = {
    path: '@koobiq/components/alert',
    primaryExport: 'KbqAlertModule',
    groups: [
        {
            id: 'api-components',
            title: 'Components',
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
                            name: 'title',
                            binding: 'input',
                            type: [{ text: 'string' }],
                            required: true,
                            description: [paragraph('The title.')]
                        },
                        {
                            id: 'KbqAlert-color',
                            name: 'color',
                            binding: 'model',
                            type: [{ text: 'string' }],
                            deprecated: { reason: [paragraph('Use the style.')] }
                        },
                        {
                            id: 'KbqAlert-open',
                            name: 'open()',
                            type: [{ text: 'boolean' }],
                            description: [paragraph('Opens it.')],
                            params: [
                                { name: 'delay?', type: [{ text: 'number' }], description: [paragraph('The delay.')] }
                            ],
                            returns: { type: [{ text: 'boolean' }], description: [paragraph('Whether it opened.')] }
                        },
                        { id: 'KbqAlert-closed', name: 'closed', binding: 'output', type: [{ text: 'void' }] },
                        { id: 'KbqAlert-icon', name: 'icon', type: [{ text: 'string' }], optional: true }
                    ]
                }
            ]
        },
        {
            id: 'api-constants',
            title: 'Constants',
            entries: [{ name: 'KBQ_ALERT', kind: 'const', deprecated: {}, signature: 'const KBQ_ALERT: string;' }]
        }
    ]
};

describe(DocsApiPage.name, () => {
    let copyWithToast: jest.Mock;

    beforeEach(() => {
        copyWithToast = jest.fn();

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.Ru),
                { provide: DocsClipboardService, useValue: { copyWithToast } }
            ]
        });
    });

    const render = (entryPoint = ENTRY_POINT, selectedMember: string | null = null): HTMLElement => {
        const fixture = TestBed.createComponent(DocsApiPage);

        fixture.componentRef.setInput('entryPoint', entryPoint);
        fixture.componentRef.setInput('selectedMember', selectedMember);
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

    // The headings are the two levels of the list of sections beside the page.
    it('heads the groups, with their entries a level below', () => {
        const page = render();

        expect(Array.from(page.querySelectorAll('.docs-api__group-name'), ({ id, tagName }) => [tagName, id])).toEqual([
            ['H3', 'api-components'],
            ['H3', 'api-constants']
        ]);
        expect(getTexts(page, '.docs-api__group-name')).toEqual(['Components', 'Constants']);
        expect(Array.from(page.querySelectorAll('.docs-api__entry-name'), ({ tagName }) => tagName)).toEqual([
            'H4',
            'H4'
        ]);
    });

    it('gives a tab of one group no heading for it, its entries at the first level', () => {
        const page = render({ ...ENTRY_POINT, groups: [ENTRY_POINT.groups[0]] });

        expect(page.querySelector('.docs-api__group-name')).toBeNull();
        expect(page.querySelector('.docs-api__entry-name')?.tagName).toBe('H3');
    });

    it('leaves the import out for an entry point without a module', () => {
        expect(render({ ...ENTRY_POINT, primaryExport: undefined }).querySelector('.docs-api__import')).toBeNull();
    });

    it('renders the HTML of a text as it is, and its code in a code block', () => {
        const description = render().querySelector('.docs-api__entry-description')!;

        expect(getTexts(description, '.kbq-markdown__p')).toEqual(['Shows important information.']);
        expect(description.querySelector('kbq-code-block')?.textContent).toContain('<kbq-alert alertColor="error" />');
    });

    it('lists the members anchored by their id, with their badges and type', () => {
        const members = Array.from(render().querySelectorAll('.docs-api__member'));

        expect(members.map(({ id }) => id)).toEqual([
            'KbqAlert-title',
            'KbqAlert-color',
            'KbqAlert-open',
            'KbqAlert-closed',
            'KbqAlert-icon'
        ]);
        expect(members.map((member) => getTexts(member, ':scope > dt > :not(docs-api-link)'))).toEqual([
            ['title', 'input', 'required', 'string'],
            ['color', 'model', 'Deprecated', 'string'],
            ['open()', 'boolean'],
            ['closed', 'output', 'void'],
            ['icon', 'optional', 'string']
        ]);
    });

    it('shows no body for a member with nothing to say beyond its name and type', () => {
        const page = render();

        expect(page.querySelector('#KbqAlert-title > dd')).not.toBeNull();
        expect(page.querySelector('#KbqAlert-closed > dd')).toBeNull();
    });

    // The page is English, and the link belongs to the interface around it.
    it('links a member to itself through the query parameter, named in the language of the interface', () => {
        const link = render().querySelector('#KbqAlert-title .docs-api__link')!;
        const url = new URL(link.getAttribute('href')!, 'https://koobiq.io');

        expect(url.searchParams.get(DOCS_API_MEMBER_PARAM)).toBe('KbqAlert-title');
        expect(link.textContent?.trim()).toBe('Скопировать ссылку на title');
        expect(link.getAttribute('lang')).toBe(DocsLocale.Ru);
    });

    // A tooltip repeating the text of its trigger does not describe it, so a screen reader reads the name once.
    it('shows the name of the link in a tooltip', () => {
        const fixture = TestBed.createComponent(DocsApiPage);

        fixture.componentRef.setInput('entryPoint', ENTRY_POINT);
        fixture.detectChanges();

        const link = fixture.debugElement.query(By.css('#KbqAlert-title .docs-api__link'));

        expect(link.injector.get(KbqTooltipTrigger).content).toBe('Скопировать ссылку на title');
    });

    it('copies the address the link to a member leads to', () => {
        const link: HTMLAnchorElement = render().querySelector('#KbqAlert-title .docs-api__link')!;

        link.click();

        expect(copyWithToast).toHaveBeenCalledWith(link.href);
    });

    // A reload of the page goes to the heading, not back to a member selected before.
    it('links each heading to itself through the fragment, named in the language of the interface', async () => {
        await TestBed.inject(Router).navigateByUrl('/?member=KbqAlert-title');

        const page = render();
        const links = [
            page.querySelector('#api-components')!.parentElement!.querySelector('.docs-api__link')!,
            page.querySelector('#KbqAlert')!.parentElement!.querySelector('.docs-api__link')!
        ];

        expect(links.map((link) => [link.getAttribute('href'), link.textContent?.trim()])).toEqual([
            ['/#api-components', 'Скопировать ссылку на Components'],
            ['/#KbqAlert', 'Скопировать ссылку на KbqAlert']
        ]);
    });

    // The link puts the heading in the URL and copies it; the page stays where the reader is.
    it('copies the address the link to a heading leads to, without moving the page', () => {
        const scrollIntoView = jest.fn();

        // jsdom lays nothing out, and has no scrolling to offer.
        Object.defineProperty(Element.prototype, 'scrollIntoView', { value: scrollIntoView, configurable: true });

        try {
            const link: HTMLAnchorElement = render().querySelector('#KbqAlert')!.parentElement!.querySelector('a')!;

            link.click();

            expect(copyWithToast).toHaveBeenCalledWith(link.href);
            expect(scrollIntoView).not.toHaveBeenCalled();

            // Opened in a new tab, the link copies nothing.
            link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, metaKey: true }));

            expect(copyWithToast).toHaveBeenCalledTimes(1);
        } finally {
            delete (Element.prototype as Partial<Element>).scrollIntoView;
        }
    });

    it('highlights the member a link points at', () => {
        const selected = render(ENTRY_POINT, 'KbqAlert-color').querySelectorAll('.docs-api__member_selected');

        expect(Array.from(selected, ({ id }) => id)).toEqual(['KbqAlert-color']);
    });

    // The badge says that it is deprecated; the note beside the description says why, when the tag does.
    it('renders the reason of a deprecation under the description', () => {
        expect(getTexts(render(), '.docs-api__deprecated-note')).toEqual(['Use the style.']);
    });

    it('strikes the name of a deprecated entry through', () => {
        const names = render().querySelectorAll(
            '.docs-api__entry_deprecated > .docs-api__entry-header > .docs-api__entry-name'
        );

        expect(Array.from(names, (name) => name.textContent?.trim())).toEqual(['KBQ_ALERT']);
    });

    it('strikes the name of a deprecated member through', () => {
        const names = render().querySelectorAll('.docs-api__member_deprecated > dt > .docs-api__term-name');

        expect(Array.from(names, (name) => name.textContent)).toEqual(['color']);
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

    /** An entry point of one class whose one member is of `type`. */
    const withMemberType = (type: DocsApiTypePart[]): DocsApiEntryPoint => ({
        path: '@koobiq/components/actions-panel',
        groups: [
            {
                id: 'api-classes',
                title: 'Classes',
                entries: [
                    {
                        name: 'KbqActionsPanel',
                        kind: 'class',
                        signature: 'class KbqActionsPanel {}',
                        members: [{ id: 'KbqActionsPanel-open', name: 'open()', type }]
                    }
                ]
            }
        ]
    });

    it('links the entries a type names to their sections, on this tab or on the tab of their entry point', () => {
        const type = render(
            withMemberType([
                { text: 'KbqActionsPanelRef', link: {} },
                { text: '<T, ' },
                { text: 'KbqOption', link: { page: 'components/core/api' } },
                { text: '>' }
            ])
        ).querySelector('.docs-api__term-type')!;

        expect(type.textContent).toBe('KbqActionsPanelRef<T, KbqOption>');
        expect(Array.from(type.querySelectorAll('a'), (link) => link.getAttribute('href'))).toEqual([
            '/#KbqActionsPanelRef',
            '/ru/components/core/api#KbqOption'
        ]);
        // Links of the design system, set apart from the type by their colour rather than an underline.
        expect(
            Array.from(type.querySelectorAll('a'), ({ classList }) => classList.contains('kbq-link_no-underline'))
        ).toEqual([
            true,
            true
        ]);
    });

    // The router only sets the fragment; the list of sections beside the page scrolls to them on its own too.
    it('scrolls to the section a link on this tab points at', () => {
        const scrollIntoView = jest.fn();

        // jsdom lays nothing out, and has no scrolling to offer.
        Object.defineProperty(Element.prototype, 'scrollIntoView', { value: scrollIntoView, configurable: true });

        try {
            const page = render(withMemberType([{ text: 'KbqActionsPanel', link: {} }]));

            page.querySelector<HTMLElement>('.docs-api__term-type a')!.click();

            expect(scrollIntoView.mock.contexts).toEqual([page.querySelector('#KbqActionsPanel')]);

            // Opened in a new tab, the link leaves this one where it is.
            page.querySelector('.docs-api__term-type a')!.dispatchEvent(
                new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
            );

            expect(scrollIntoView).toHaveBeenCalledTimes(1);
        } finally {
            delete (Element.prototype as Partial<Element>).scrollIntoView;
        }
    });

    // A reload of the page goes where the link led, not back to the member.
    it('leaves the selected member behind in a link to a section of this tab', async () => {
        await TestBed.inject(Router).navigateByUrl('/?member=KbqActionsPanel-open');

        const link = render(withMemberType([{ text: 'KbqActionsPanel', link: {} }])).querySelector(
            '.docs-api__term-type a'
        )!;

        expect(link.getAttribute('href')).toBe('/#KbqActionsPanel');
    });

    it('marks the page as English, the language of the JSDoc', () => {
        expect(render().getAttribute('lang')).toBe('en');
    });

    it('has no axe violations', async () => {
        expect(await axe(render())).toHaveNoViolations();
    });
});
