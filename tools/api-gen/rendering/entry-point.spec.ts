import { ClassEntry, DocEntry, EntryType, MemberEntry, MemberTags, MemberType, PropertyEntry } from './entities';
import { ApiEntryPage, getApiEntryPoint, linkType } from './entry-point';

const entry = (patch: Partial<DocEntry> & Record<string, unknown>): DocEntry =>
    ({ name: '', entryType: EntryType.Constant, description: '', rawComment: '', jsdocTags: [], ...patch }) as DocEntry;

const classEntry = (patch: Partial<ClassEntry> & Record<string, unknown>): ClassEntry =>
    entry({
        entryType: EntryType.UndecoratedClass,
        isAbstract: false,
        generics: [],
        implements: [],
        members: [],
        ...patch
    }) as ClassEntry;

const property = (patch: Partial<PropertyEntry>): PropertyEntry => ({
    name: '',
    memberType: MemberType.Property,
    memberTags: [],
    type: '',
    description: '',
    jsdocTags: [],
    ...patch
});

const param = (name: string, type: string, description = '', isOptional = false) => ({
    name,
    type,
    description,
    isOptional,
    isRestParam: false
});

const paragraph = (html: string) => ({ type: 'html', html: `<p class="kbq-markdown__p">${html}</p>` });

const getEntries = (entries: DocEntry[]) =>
    getApiEntryPoint(entries, 'components', 'alert').groups.flatMap((group) => group.entries);

describe(getApiEntryPoint.name, () => {
    it('lists the entries in their groups, each by name, below the import of the module', () => {
        const { path, primaryExport, groups } = getApiEntryPoint(
            [
                entry({ name: 'KBQ_ALERT', type: 'string' }),
                classEntry({
                    name: 'KbqAlertLegacyModule',
                    entryType: EntryType.NgModule,
                    jsdocTags: [{ name: 'deprecated', comment: '' }]
                }),
                classEntry({ name: 'KbqAlertModule', entryType: EntryType.NgModule }),
                classEntry({ name: 'KbqAlertConfig', entryType: EntryType.Interface }),
                entry({ name: 'KbqAlertStyle', entryType: EntryType.TypeAlias, type: "'error' | 'warning'" }),
                classEntry({ name: 'KbqAlertCloseButton', entryType: EntryType.Directive, selector: '', exportAs: [] }),
                classEntry({ name: 'KbqAlert', entryType: EntryType.Component, selector: 'kbq-alert', exportAs: [] })
            ],
            'components',
            'alert'
        );

        expect({
            path,
            primaryExport,
            groups: groups.map(({ id, title, entries }) => [
                id,
                title,
                entries.map(({ kind, name }) => `${kind} ${name}`)
            ])
        }).toEqual({
            path: '@koobiq/components/alert',
            primaryExport: 'KbqAlertModule',
            groups: [
                ['api-components', 'Components', ['component KbqAlert']],
                ['api-directives', 'Directives', ['directive KbqAlertCloseButton']],
                ['api-types', 'Types', ['interface KbqAlertConfig', 'type KbqAlertStyle']],
                ['api-constants', 'Constants', ['const KBQ_ALERT']]
            ]
        });
    });

    it('names no module to import from core, which declares a dozen of them', () => {
        const core = getApiEntryPoint(
            [classEntry({ name: 'KbqOptionModule', entryType: EntryType.NgModule })],
            'components',
            'core'
        );

        expect(core.primaryExport).toBeUndefined();
    });

    it('documents an entry with the reason it is deprecated, its description and its examples', () => {
        const [constant] = getEntries([
            entry({
                name: 'KBQ_ALERT',
                type: 'string',
                description: 'Configures the alert.',
                jsdocTags: [
                    { name: 'deprecated', comment: 'Use `KBQ_ALERT_CONFIG`.' },
                    { name: 'example', comment: "provide(KBQ_ALERT, 'x');" },
                    { name: 'see', comment: 'Not shown.' }
                ]
            })
        ]);

        expect(constant).toEqual({
            name: 'KBQ_ALERT',
            kind: 'const',
            deprecated: { reason: [paragraph('Use <code class="kbq-markdown__code">KBQ_ALERT_CONFIG</code>.')] },
            description: [paragraph('Configures the alert.')],
            examples: [[{ type: 'code', code: "provide(KBQ_ALERT, 'x');", language: 'typescript' }]],
            signature: 'const KBQ_ALERT: string;'
        });
    });

    it('marks a deprecation that gives no reason', () => {
        const [constant] = getEntries([
            entry({ name: 'KBQ_ALERT', type: 'string', jsdocTags: [{ name: 'deprecated', comment: '' }] })
        ]);

        expect(constant.deprecated).toEqual({});
    });

    it('lists the members worth explaining, by the names a template binds them by and how it binds them', () => {
        const open = {
            name: 'open',
            memberType: MemberType.Method,
            memberTags: [],
            description: 'Opens the panel.',
            jsdocTags: [{ name: 'returns', comment: 'Whether it opened.' }],
            signatures: [
                {
                    name: 'open',
                    params: [param('delay', 'number | undefined', '- The delay.', true), param('origin', 'string')],
                    returnType: 'boolean',
                    generics: []
                }
            ],
            implementation: null
        } as unknown as MemberEntry;

        const [alert] = getEntries([
            classEntry({
                name: 'KbqAlert',
                entryType: EntryType.Component,
                selector: 'kbq-alert',
                exportAs: [],
                members: [
                    open,
                    property({ name: 'internal', type: 'number' }),
                    property({
                        name: 'color',
                        memberTags: [MemberTags.Input],
                        type: 'string',
                        description: 'The color.',
                        inheritedFrom: 'KbqColorDirective'
                    }),
                    property({
                        name: 'title',
                        memberTags: [MemberTags.Input],
                        type: 'string',
                        description: 'The title.',
                        isRequiredInput: true
                    })
                ]
            })
        ]);

        expect(alert.members).toEqual([
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
                binding: 'input',
                type: [{ text: 'string' }],
                description: [paragraph('The color.')]
            },
            {
                id: 'KbqAlert-open',
                name: 'open()',
                type: [{ text: 'boolean' }],
                description: [paragraph('Opens the panel.')],
                params: [{ name: 'delay?', type: [{ text: 'number' }], description: [paragraph('The delay.')] }],
                returns: { type: [{ text: 'boolean' }], description: [paragraph('Whether it opened.')] }
            }
        ]);
    });

    it('lists the fields of a type alias naming an object literal, a nested one by its path, the optional ones marked', () => {
        const [config] = getEntries([
            entry({
                name: 'KbqToastConfig',
                entryType: EntryType.TypeAlias,
                type: '{ position: string; duration?: number; indent: { vertical: number; }; }',
                members: [
                    property({ name: 'position', type: 'string' }),
                    property({
                        name: 'duration',
                        memberTags: [MemberTags.Optional],
                        type: 'number',
                        description: 'How long it stays.'
                    }),
                    property({
                        name: 'indent',
                        type: '{ vertical: number; }',
                        members: [property({ name: 'vertical', type: 'number', description: 'The spacing.' })]
                    })
                ]
            })
        ]);

        expect(config.members).toEqual([
            {
                id: 'KbqToastConfig-duration',
                name: 'duration',
                type: [{ text: 'number' }],
                optional: true,
                description: [paragraph('How long it stays.')]
            },
            {
                id: 'KbqToastConfig-indent.vertical',
                name: 'indent.vertical',
                type: [{ text: 'number' }],
                description: [paragraph('The spacing.')]
            }
        ]);
    });

    // The signature has no line for them.
    it('lists every binding a host directive forwards, described or not', () => {
        const [button] = getEntries([
            classEntry({
                name: 'KbqBreadcrumbButton',
                entryType: EntryType.Directive,
                selector: '[kbq-button][kbqBreadcrumb]',
                exportAs: [],
                members: [
                    property({
                        name: 'focusable',
                        memberTags: [MemberTags.Input],
                        type: 'boolean',
                        forwardedFrom: { directive: 'RdxRovingFocusItemDirective', input: 'focusable' }
                    }),
                    property({
                        name: 'localeOverrides',
                        memberTags: [MemberTags.Input],
                        type: 'KbqLocaleOverrides',
                        forwardedFrom: { directive: 'KbqLocaleOverridesDirective', input: 'kbqLocaleOverrides' }
                    })
                ]
            })
        ]);

        expect(button.signature).toBe(
            "@Directive({ selector: '[kbq-button][kbqBreadcrumb]' })\nclass KbqBreadcrumbButton {}"
        );
        expect(button.members).toEqual([
            { id: 'KbqBreadcrumbButton-focusable', name: 'focusable', binding: 'input', type: [{ text: 'boolean' }] },
            {
                id: 'KbqBreadcrumbButton-localeOverrides',
                name: 'localeOverrides',
                binding: 'input',
                type: [{ text: 'KbqLocaleOverrides' }]
            }
        ]);
    });

    it('documents a function with its parameters and the value it returns', () => {
        const [fn] = getEntries([
            entry({
                name: 'kbqFormat',
                entryType: EntryType.Function,
                signatures: [
                    {
                        name: 'kbqFormat',
                        description: 'Formats a value.',
                        jsdocTags: [],
                        params: [param('value', 'number', 'The value.'), param('unit', 'string')],
                        returnType: 'string',
                        returnDescription: 'The text.',
                        generics: []
                    }
                ],
                implementation: null
            })
        ]);

        expect(fn).toEqual({
            name: 'kbqFormat',
            kind: 'function',
            description: [paragraph('Formats a value.')],
            signature: 'function kbqFormat(value: number, unit: string): string;',
            params: [{ name: 'value', type: [{ text: 'number' }], description: [paragraph('The value.')] }],
            returns: { type: [{ text: 'string' }], description: [paragraph('The text.')] }
        });
    });
});

describe(linkType.name, () => {
    const pages = new Map<string, ApiEntryPage>([
        [
            'KbqActionsPanelRef',
            { entryPoint: '@koobiq/components/actions-panel', page: 'components/actions-panel/api' }
        ],
        [
            'KbqActionsPanelConfig',
            { entryPoint: '@koobiq/components/actions-panel', page: 'components/actions-panel/api' }
        ],
        ['KbqOption', { entryPoint: '@koobiq/components/core', page: 'components/core/api' }],
        ['T', { entryPoint: '@koobiq/components/core', page: 'components/core/api', isValue: true }]
    ]);
    const links = { pages, entryPoint: '@koobiq/components/actions-panel', self: 'KbqActionsPanelConfig' };

    it('links an entry of the entry point on the tab itself, and an entry of another one on its tab', () => {
        expect(linkType('KbqActionsPanelRef<T, KbqOption | null>', links)).toEqual([
            { text: 'KbqActionsPanelRef', link: {} },
            { text: '<T, ' },
            { text: 'KbqOption', link: { page: 'components/core/api' } },
            { text: ' | null>' }
        ]);
    });

    it('links a name spread into a tuple, which is no member access', () => {
        expect(linkType('[...KbqOption[]]', links)).toEqual([
            { text: '[...' },
            { text: 'KbqOption', link: { page: 'components/core/api' } },
            { text: '[]]' }
        ]);
    });

    it('leaves a type naming no documented entry as one piece of text', () => {
        expect(linkType('number | null', links)).toEqual([{ text: 'number | null' }]);
    });

    it('links a constant only where a type query names it, not a type parameter of its name', () => {
        expect(linkType('Map<T, typeof T>', links)).toEqual([
            { text: 'Map<T, typeof ' },
            { text: 'T', link: { page: 'components/core/api' } },
            { text: '>' }
        ]);
    });

    it('links no name in a string, after a dot, of a field or a parameter, or of the entry the type is in', () => {
        const type = "{ KbqOption: 'KbqOption'; ref: Foo.KbqOption } | ((KbqOption?: string) => KbqActionsPanelConfig)";

        expect(linkType(type, links)).toEqual([{ text: type }]);
    });

    it('links the types the tab shows', () => {
        const [panel] = getApiEntryPoint(
            [
                classEntry({
                    name: 'KbqActionsPanel',
                    members: [
                        property({ name: 'ref', type: 'KbqActionsPanelRef<T, R>', description: 'The opened panel.' })
                    ]
                })
            ],
            'components',
            'actions-panel',
            pages
        ).groups[0].entries;

        expect(panel.members?.[0].type).toEqual([
            { text: 'KbqActionsPanelRef', link: {} },
            { text: '<T, R>' }
        ]);
    });
});
