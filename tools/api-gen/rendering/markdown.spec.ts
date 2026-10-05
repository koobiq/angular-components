import { ClassEntry, DocEntry, EntryType, MemberTags, MemberType, PropertyEntry } from './entities';
import { getNgModuleNames, renderApiAsMarkdown } from './markdown';

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

const ALERT_API: DocEntry[] = [
    classEntry({ name: 'KbqAlertModule', entryType: EntryType.NgModule }),
    classEntry({
        name: 'KbqAlert',
        entryType: EntryType.Component,
        selector: 'kbq-alert',
        exportAs: [],
        description:
            'Shows a message. Import {@link KbqAlertModule} or the component itself.\n\n## Usage\n\nPut a title inside.',
        members: [
            property({
                name: 'compact',
                type: 'boolean',
                memberTags: [MemberTags.Input],
                description: 'Whether the alert is compact.'
            })
        ]
    }),
    entry({ name: 'KbqAlertStyle', entryType: EntryType.TypeAlias, type: "'error' | 'warning'", description: 'Style.' })
];

describe(renderApiAsMarkdown.name, () => {
    it('renders the groups of the API tab at the given depth and the entries below them', () => {
        expect(renderApiAsMarkdown(ALERT_API, 3)).toMatchSnapshot();
    });

    it('puts the headings of a comment under its entry and turns a link tag into code', () => {
        const markdown = renderApiAsMarkdown(ALERT_API, 5);

        expect(markdown).toContain('##### Components\n\n###### KbqAlert (component)');
        expect(markdown).toContain('Import `KbqAlertModule` or the component itself.\n\n###### Usage');
    });

    it('leaves the lines of a block of code as they are, up to the fence that closes it', () => {
        const markdown = renderApiAsMarkdown(
            [
                entry({
                    name: 'KBQ_ALERT_README',
                    type: 'string',
                    description: '````md\n```ts\n# Not a heading\n```\n````\n\n# A heading'
                })
            ],
            3
        );

        expect(markdown).toContain('````md\n```ts\n# Not a heading\n```\n````\n\n##### A heading');
    });

    it('turns a key into code, outside the spans of code', () => {
        const markdown = renderApiAsMarkdown(
            [entry({ name: 'KBQ_ALERT_KEYS', type: 'string', description: 'Closes on <kbd>Esc</kbd>, not `<kbd>`.' })],
            3
        );

        expect(markdown).toContain('Closes on `Esc`, not `<kbd>`.');
    });

    it('leaves the NgModule out, as the API tab does', () => {
        expect(renderApiAsMarkdown(ALERT_API, 3)).not.toContain('KbqAlertModule (');
    });
});

describe(getNgModuleNames.name, () => {
    it('names the NgModules of an entry point', () => {
        expect(getNgModuleNames(ALERT_API)).toEqual(['KbqAlertModule']);
    });
});
