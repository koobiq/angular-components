import { TestBed } from '@angular/core/testing';
import { By, provideClientHydration, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { kbqCodeBlockHighlightJsConfigProvider } from '@koobiq/components/code-block';
import { KbqTooltipTrigger } from '@koobiq/components/tooltip';
import { BehaviorSubject, map } from 'rxjs';
import type { Mock } from 'vitest';
import { DocsIntersectionObserverStub } from '../../../testing/intersection-observer.stub';
import { DOCS_API_MEMBER_PARAM } from '../../constants/api-page';
import { DOCS_HIGHLIGHT_JS_LANGUAGES } from '../../constants/highlight-js';
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

const paragraph = (text: string): DocsApiBlock => ({
    type: 'html',
    html: `<p class="kbq-markdown__p" data-docsearch-content>${text}</p>`
});

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
    let copyWithToast: Mock;

    beforeEach(() => {
        copyWithToast = vi.fn();
        // Rendered in the browser alone, as a route of `RenderMode.Client` is: the flag the server sets for one.
        document.body.setAttribute('ngcm', '');
        vi.stubGlobal('IntersectionObserver', DocsIntersectionObserverStub);

        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideDocsLocale(DocsLocale.Ru),
                { provide: DocsClipboardService, useValue: { copyWithToast } },
                // As the app has it: the code blocks are `@defer` blocks with a `hydrate` trigger.
                provideClientHydration(withIncrementalHydration()),
                kbqCodeBlockHighlightJsConfigProvider({ languages: DOCS_HIGHLIGHT_JS_LANGUAGES })
            ]
        });
    });

    afterEach(() => {
        document.body.removeAttribute('ngcm');
        vi.unstubAllGlobals();
        DocsIntersectionObserverStub.reset();
    });

    const createFixture = (entryPoint = ENTRY_POINT, selectedMember: string | null = null) => {
        const fixture = TestBed.createComponent(DocsApiPage);

        fixture.componentRef.setInput('entryPoint', entryPoint);
        fixture.componentRef.setInput('selectedMember', selectedMember);
        fixture.detectChanges();

        return fixture;
    };

    const render = (entryPoint = ENTRY_POINT, selectedMember: string | null = null): HTMLElement =>
        createFixture(entryPoint, selectedMember).nativeElement;

    const getPlaceholders = (element: Element): HTMLElement[] =>
        Array.from(element.querySelectorAll('docs-api-code-placeholder'));

    // The code blocks are `@defer` blocks: the import renders once its dependencies have loaded, the others once they
    // have come into view as well.
    const renderCodeBlocks = async (entryPoint = ENTRY_POINT): Promise<HTMLElement> => {
        const fixture = createFixture(entryPoint);
        const placeholders = getPlaceholders(fixture.nativeElement);

        // Asserted here, so that a page that stopped rendering placeholders cannot leave every test built on this
        // helper passing over a tab whose blocks never rendered.
        expect(placeholders.length).toBeGreaterThan(0);

        DocsIntersectionObserverStub.enter(...placeholders);
        await fixture.whenStable();
        fixture.detectChanges();

        expect(getPlaceholders(fixture.nativeElement)).toEqual([]);

        return fixture.nativeElement;
    };

    const getTexts = (element: Element, selector: string): string[] =>
        Array.from(element.querySelectorAll(selector), (node) => node.textContent!.trim());

    it('renders the import of the module, then each entry anchored by its name, with its kind', async () => {
        const page = await renderCodeBlocks();

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

    it('leaves the import out for an entry point without a module', async () => {
        const page = await renderCodeBlocks({ ...ENTRY_POINT, primaryExport: undefined });

        expect(page.querySelector('.docs-api__import')).toBeNull();
    });

    it('renders the HTML of a text as it is, and its code in a code block', async () => {
        const description = (await renderCodeBlocks()).querySelector('.docs-api__entry-description')!;

        expect(getTexts(description, '.kbq-markdown__p')).toEqual(['Shows important information.']);
        expect(description.querySelector('kbq-code-block')?.textContent).toContain('<kbq-alert alertColor="error" />');
    });

    // The sanitizer would drop them from the HTML of a text, which the JSDoc compiles to at build time.
    it('keeps the attributes the search reads the headings and the text by', async () => {
        const page = await renderCodeBlocks();

        expect(getTexts(page, '[data-docsearch-lvl2]')).toContain('KbqAlert');
        expect(getTexts(page, '[data-docsearch-content]')).toContain('Shows important information.');
    });

    // Until a block comes into view, its placeholder stands in: laid out by the block's classes, so that the page is as
    // tall before the block renders as after. The lines of a file of several lines are the rows of a table, as the
    // line numbers plugin lays them out; a file of one line, or of one line and a line break, stays text.
    it('holds the place of each code block with its code, laid out like the block, until it comes into view', async () => {
        const fixture = createFixture();

        await fixture.whenStable();
        fixture.detectChanges();

        const page: HTMLElement = fixture.nativeElement;
        const placeholders = getPlaceholders(page);

        expect(Array.from(page.querySelectorAll('kbq-code-block'), ({ className }) => className)).toEqual([
            expect.stringContaining('docs-api__import')
        ]);
        expect(placeholders.map(({ textContent }) => textContent)).toEqual([
            '<kbq-alert alertColor="error" />',
            "@Component({ selector: 'kbq-alert' })class KbqAlert {}",
            'const KBQ_ALERT: string;'
        ]);
        expect(placeholders.map(({ classList }) => Array.from(classList).filter((name) => name.includes('_')))).toEqual(
            [
                [
                    'kbq-code-block_hide-tabs',
                    'kbq-code-block_hide-line-numbers',
                    'kbq-code-block_filled',
                    'kbq-code-block_no-border'
                ],
                ['kbq-code-block_hide-tabs', 'kbq-code-block_hide-line-numbers', 'kbq-code-block_outline'],
                ['kbq-code-block_hide-tabs', 'kbq-code-block_hide-line-numbers', 'kbq-code-block_outline']
            ]
        );
        expect(placeholders.map((placeholder) => getTexts(placeholder, '.hljs-ln-code'))).toEqual([
            [],
            ["@Component({ selector: 'kbq-alert' })", 'class KbqAlert {}'],
            []
        ]);
        expect(
            getPlaceholders(render(withSignature('class KbqActionsPanel {}\n')))[0].querySelector('table')
        ).toBeNull();
    });

    it('renders a code block once it comes into view, and leaves the others to come', async () => {
        const fixture = createFixture();
        const [example, signature] = getPlaceholders(fixture.nativeElement);

        DocsIntersectionObserverStub.enter(signature);
        await fixture.whenStable();
        fixture.detectChanges();

        const page: HTMLElement = fixture.nativeElement;
        const blocks = Array.from(page.querySelectorAll('kbq-code-block'));

        expect(blocks.map(({ classList }) => classList.contains('docs-api__import'))).toEqual([true, false]);
        expect(blocks[1].textContent).toContain('class KbqAlert {}');
        expect(signature.isConnected).toBe(false);
        expect(getPlaceholders(page)).toEqual([example, expect.any(HTMLElement)]);
    });

    // The placeholder holds the block's place, so it has to carry the block's own modifier classes: a block that
    // starts laying itself out differently has to be followed here, or the page would jump as it renders.
    it('carries the modifier classes of the block it stands in for', async () => {
        // Sorted: the block and the placeholder set the same classes in a different order.
        const modifiers = (element: Element): string[] =>
            Array.from(element.classList)
                .filter((name) => name.startsWith('kbq-code-block_'))
                .sort();
        const fixture = createFixture();
        const placeholders = getPlaceholders(fixture.nativeElement).map(modifiers);

        DocsIntersectionObserverStub.enter(...getPlaceholders(fixture.nativeElement));
        await fixture.whenStable();
        fixture.detectChanges();

        // The import block renders on its own, before any of the placeholders, and comes first in document order.
        const blocks = Array.from(fixture.nativeElement.querySelectorAll('kbq-code-block'), modifiers);

        expect(blocks.slice(1)).toEqual(placeholders);
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
        const scrollIntoView = vi.fn();

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

    /** An entry point of one class, declared by `signature`, whose one member is of `type`. */
    const withEntry = (signature: string, type: DocsApiTypePart[] = []): DocsApiEntryPoint => ({
        path: '@koobiq/components/actions-panel',
        groups: [
            {
                id: 'api-classes',
                title: 'Classes',
                entries: [
                    {
                        name: 'KbqActionsPanel',
                        kind: 'class',
                        signature,
                        members: [{ id: 'KbqActionsPanel-open', name: 'open()', type }]
                    }
                ]
            }
        ]
    });

    const withSignature = (signature: string): DocsApiEntryPoint => withEntry(signature);

    const withMemberType = (type: DocsApiTypePart[]): DocsApiEntryPoint => withEntry('class KbqActionsPanel {}', type);

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
            Array.from(type.querySelectorAll('a'), ({ classList }) => classList.contains('kbq-link_underline_none'))
        ).toEqual([
            true,
            true
        ]);
    });

    // The router only sets the fragment; the list of sections beside the page scrolls to them on its own too.
    it('scrolls to the section a link on this tab points at', () => {
        const scrollIntoView = vi.fn();

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
        await expect(await renderCodeBlocks()).toHaveNoViolations();
    });

    it('has no axe violations with the code blocks still to come into view', async () => {
        const fixture = createFixture();

        await fixture.whenStable();
        fixture.detectChanges();

        await expect(fixture.nativeElement).toHaveNoViolations();
    });
});
