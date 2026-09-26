import { ClassEntry, DocEntry, EntryType, MemberEntry, MemberTags, MemberType, PropertyEntry } from './entities';
import { getApiEntryPoint } from './entry-point';

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

const getEntries = (entries: DocEntry[]) => getApiEntryPoint(entries, 'components', 'alert').entries;

describe(getApiEntryPoint.name, () => {
    it('lists the entries by kind and then by name, below the import of the module', () => {
        const { path, primaryExport, entries } = getApiEntryPoint(
            [
                entry({ name: 'KBQ_ALERT', type: 'string' }),
                classEntry({
                    name: 'KbqAlertLegacyModule',
                    entryType: EntryType.NgModule,
                    jsdocTags: [{ name: 'deprecated', comment: '' }]
                }),
                classEntry({ name: 'KbqAlertModule', entryType: EntryType.NgModule }),
                classEntry({ name: 'KbqAlertConfig', entryType: EntryType.Interface }),
                classEntry({ name: 'KbqAlert', entryType: EntryType.Component, selector: 'kbq-alert', exportAs: [] })
            ],
            'components',
            'alert'
        );

        expect({ path, primaryExport, entries: entries.map(({ kind, name }) => `${kind} ${name}`) }).toEqual({
            path: '@koobiq/components/alert',
            primaryExport: 'KbqAlertModule',
            entries: ['component KbqAlert', 'interface KbqAlertConfig', 'const KBQ_ALERT']
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

    it('lists the members worth explaining, the way a template writes them', () => {
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
                description: [paragraph('The color.')]
            },
            {
                id: 'KbqAlert-open',
                name: 'open()',
                type: 'boolean',
                description: [paragraph('Opens the panel.')],
                params: [{ name: 'delay?', type: 'number', description: [paragraph('The delay.')] }],
                returns: { type: 'boolean', description: [paragraph('Whether it opened.')] }
            }
        ]);
    });

    // The signature has no line for them, and a binding of a directive the docs leave out comes without its name.
    it('lists every binding a host directive forwards, with the directive when the docs name it', () => {
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
                        forwardedFrom: { input: 'focusable' }
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
            { id: 'KbqBreadcrumbButton-focusable', name: '[focusable]', type: 'boolean' },
            {
                id: 'KbqBreadcrumbButton-localeOverrides',
                name: '[localeOverrides]',
                type: 'KbqLocaleOverrides',
                origin: 'KbqLocaleOverridesDirective'
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
            params: [{ name: 'value', type: 'number', description: [paragraph('The value.')] }],
            returns: { type: 'string', description: [paragraph('The text.')] }
        });
    });
});
