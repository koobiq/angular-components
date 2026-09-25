import {
    ClassEntry,
    DocEntry,
    EntryType,
    EnumMemberEntry,
    FunctionEntry,
    FunctionWithOverloads,
    MemberEntry,
    MemberTags,
    MemberType,
    PropertyEntry
} from './entities';
import {
    compareEntries,
    getMemberDisplayName,
    getMemberDisplayType,
    hasMemberDetails,
    orderMembers,
    renderEntrySignature
} from './signature';

/** A property as the manifest reports one. */
const property = (patch: Partial<PropertyEntry>): PropertyEntry => ({
    name: '',
    memberType: MemberType.Property,
    memberTags: [],
    type: '',
    description: '',
    jsdocTags: [],
    ...patch
});

/** A method with one signature, as the manifest reports one. */
const method = (name: string, params: [string, string][], returnType: string, patch: Partial<MemberEntry> = {}) =>
    ({
        name,
        memberType: MemberType.Method,
        memberTags: [],
        description: '',
        jsdocTags: [],
        signatures: [
            {
                name,
                returnType,
                generics: [],
                params: params.map(([paramName, type]) => ({
                    name: paramName.replace('?', ''),
                    type,
                    isOptional: paramName.endsWith('?'),
                    isRestParam: false,
                    description: ''
                }))
            }
        ],
        ...patch
    }) as unknown as MemberEntry;

const directive = (patch: Partial<ClassEntry> & Record<string, unknown>): ClassEntry =>
    ({
        name: 'KbqDropdownTrigger',
        entryType: EntryType.Directive,
        description: '',
        rawComment: '',
        jsdocTags: [],
        isAbstract: false,
        generics: [],
        implements: [],
        members: [],
        ...patch
    }) as unknown as ClassEntry;

describe('renderEntrySignature', () => {
    it('writes a directive the way its source declares it', () => {
        expect(
            renderEntrySignature(
                directive({
                    selector: '[kbqDropdownTriggerFor]',
                    exportAs: ['kbqDropdownTrigger'],
                    implements: ['AfterContentInit', 'OnDestroy', 'KbqSiblingPopup'],
                    members: [
                        property({
                            name: 'dropdown',
                            memberTags: [MemberTags.Readonly, MemberTags.Input],
                            type: 'InputSignal<KbqDropdownPanel>',
                            inputAlias: 'kbqDropdownTriggerFor',
                            signalApi: 'input',
                            declaredType: 'KbqDropdownPanel'
                        }),
                        property({
                            name: 'offsetX',
                            memberTags: [MemberTags.Readonly, MemberTags.Input, MemberTags.Output],
                            type: 'ModelSignal<number | undefined>',
                            signalApi: 'model',
                            inputAlias: 'offsetX',
                            outputAlias: 'offsetXChange'
                        }),
                        property({
                            name: 'dropdownOpened',
                            memberTags: [MemberTags.Readonly, MemberTags.Output],
                            type: 'OutputEmitterRef<void>',
                            signalApi: 'output',
                            outputAlias: 'dropdownOpened'
                        }),
                        property({
                            name: 'opened',
                            memberType: MemberType.Getter,
                            type: 'boolean'
                        }),
                        method('focus', [['origin?', 'FocusOrigin | undefined']], 'void')
                    ]
                })
            )
        ).toBe(
            [
                '@Directive({',
                "    selector: '[kbqDropdownTriggerFor]',",
                "    exportAs: 'kbqDropdownTrigger'",
                '})',
                'class KbqDropdownTrigger implements KbqSiblingPopup {',
                '    readonly dropdown = input<KbqDropdownPanel>(undefined, {',
                "        alias: 'kbqDropdownTriggerFor'",
                '    });',
                '    readonly offsetX = model<number | undefined>();',
                '    readonly dropdownOpened = output<void>();',
                '    get opened(): boolean;',
                '    focus(origin?: FocusOrigin): void;',
                '}'
            ].join('\n')
        );
    });

    it('puts the inputs a host directive forwards into the decorator, not the class body', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqDl',
                    entryType: EntryType.Component,
                    selector: 'kbq-dl',
                    members: [
                        property({
                            name: 'wide',
                            memberTags: [MemberTags.Readonly, MemberTags.Input],
                            type: 'InputSignalWithTransform<boolean, unknown>',
                            signalApi: 'input',
                            defaultValue: 'false'
                        }),
                        property({
                            name: 'localeOverrides',
                            memberTags: [MemberTags.Readonly, MemberTags.Input],
                            type: 'InputSignal<KbqPartialLocaleData>',
                            signalApi: 'input',
                            forwardedFrom: { directive: 'KbqLocaleOverridesDirective', input: 'kbqLocaleOverrides' }
                        })
                    ]
                })
            )
        ).toBe(
            [
                '@Component({',
                "    selector: 'kbq-dl',",
                '    hostDirectives: [',
                '        {',
                '            directive: KbqLocaleOverridesDirective,',
                "            inputs: ['kbqLocaleOverrides: localeOverrides']",
                '        }',
                '    ]',
                '})',
                'class KbqDl {',
                '    readonly wide = input<boolean>(false);',
                '}'
            ].join('\n')
        );
    });

    it('writes a default spanning lines as an argument of its own, its lines indented with it', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqAutocompleteTrigger',
                    selector: 'input[kbqAutocomplete]',
                    members: [
                        property({
                            name: 'onInputBlur',
                            memberTags: [MemberTags.Readonly, MemberTags.Input],
                            inputAlias: 'kbqAutocompleteOnBlur',
                            signalApi: 'input',
                            declaredType: '(event: FocusEvent) => boolean',
                            defaultValue: '(event: FocusEvent): boolean => {\n\n    return !event.relatedTarget;\n}'
                        })
                    ]
                })
            )
        ).toBe(
            [
                "@Directive({ selector: 'input[kbqAutocomplete]' })",
                'class KbqAutocompleteTrigger {',
                '    readonly onInputBlur = input<(event: FocusEvent) => boolean>(',
                '        (event: FocusEvent): boolean => {',
                '',
                '            return !event.relatedTarget;',
                '        },',
                "        { alias: 'kbqAutocompleteOnBlur' }",
                '    );',
                '}'
            ].join('\n')
        );
    });

    it('writes decorated inputs and outputs with their aliases, defaults and requiredness', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqTabGroup',
                    selector: 'kbq-tab-group',
                    members: [
                        property({
                            name: 'headerPosition',
                            memberTags: [MemberTags.Input],
                            type: 'KbqTabHeaderPosition',
                            defaultValue: "'above'"
                        }),
                        property({
                            name: 'placement',
                            memberTags: [MemberTags.Input],
                            type: 'PopUpPlacements',
                            inputAlias: 'kbqPlacement',
                            isRequiredInput: true
                        }),
                        property({
                            name: 'selectedTabChange',
                            memberTags: [MemberTags.Output],
                            type: 'EventEmitter<KbqTabChangeEvent>',
                            outputAlias: 'selectedTabChange'
                        })
                    ]
                })
            )
        ).toBe(
            [
                "@Directive({ selector: 'kbq-tab-group' })",
                'class KbqTabGroup {',
                "    @Input() headerPosition: KbqTabHeaderPosition = 'above';",
                "    @Input({ alias: 'kbqPlacement', required: true }) placement: PopUpPlacements;",
                '    @Output() selectedTabChange: EventEmitter<KbqTabChangeEvent>;',
                '}'
            ].join('\n')
        );
    });

    // A reader looks for an input among the inputs, whichever class declares it; `extends` names the base.
    it('lists inherited members with the own ones of their role, after them', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqButton',
                    selector: '[kbq-button]',
                    entryType: EntryType.Component,
                    extends: 'KbqColorDirective',
                    members: [
                        property({
                            name: 'color',
                            memberTags: [MemberTags.Input, MemberTags.Inherited],
                            type: 'KbqComponentColors',
                            inheritedFrom: 'KbqColorDirective'
                        }),
                        method('setDefaultColor', [['color', 'string']], 'void', {
                            memberTags: [MemberTags.Inherited],
                            inheritedFrom: 'KbqColorDirective'
                        }),
                        method('focus', [], 'void'),
                        property({ name: 'kbqStyle', memberTags: [MemberTags.Input], type: 'string' })
                    ]
                })
            )
        ).toBe(
            [
                "@Component({ selector: '[kbq-button]' })",
                'class KbqButton extends KbqColorDirective {',
                '    @Input() kbqStyle: string;',
                '    @Input() color: KbqComponentColors;',
                '    focus(): void;',
                '    setDefaultColor(color: string): void;',
                '}'
            ].join('\n')
        );
    });

    // An interface declares no initializer: a member typed as a signal is the property its type says.
    it('writes an interface member typed as a signal as a property', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqFilterBarHost',
                    entryType: EntryType.Interface,
                    members: [
                        property({
                            name: 'filter',
                            memberTags: [MemberTags.Readonly],
                            type: 'ModelSignal<KbqFilter | null>',
                            declaredType: 'ModelSignal<KbqFilter | null>'
                        })
                    ]
                })
            )
        ).toBe(['interface KbqFilterBarHost {', '    readonly filter: ModelSignal<KbqFilter | null>;', '}'].join('\n'));
    });

    it('forwards an accessor input once, and lists the outputs a host forwards', () => {
        const forwarded = (patch: Partial<PropertyEntry>): PropertyEntry =>
            property({ forwardedFrom: { directive: 'KbqTooltipTrigger', input: 'kbqVisible' }, ...patch });

        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqNavbarItem',
                    entryType: EntryType.Component,
                    selector: 'kbq-navbar-item',
                    exportAs: undefined,
                    implements: [],
                    members: [
                        forwarded({
                            name: 'kbqVisible',
                            memberType: MemberType.Getter,
                            memberTags: [MemberTags.Input]
                        }),
                        forwarded({
                            name: 'kbqVisible',
                            memberType: MemberType.Setter,
                            memberTags: [MemberTags.Input]
                        }),
                        forwarded({
                            name: 'kbqVisibleChange',
                            memberTags: [MemberTags.Output],
                            outputAlias: 'kbqVisibleChange',
                            forwardedFrom: { directive: 'KbqTooltipTrigger', output: 'kbqVisibleChange' }
                        })
                    ]
                })
            )
        ).toBe(
            [
                '@Component({',
                "    selector: 'kbq-navbar-item',",
                '    hostDirectives: [',
                '        {',
                '            directive: KbqTooltipTrigger,',
                "            inputs: ['kbqVisible'],",
                "            outputs: ['kbqVisibleChange']",
                '        }',
                '    ]',
                '})',
                'class KbqNavbarItem {}'
            ].join('\n')
        );
    });

    it('writes an optional method, an index signature and a constructor the way the source does', () => {
        const keys = method('keys', [], 'string[]', { memberTags: [MemberTags.Optional] });

        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqStateStore',
                    entryType: EntryType.Interface,
                    indexSignatures: ['[key: string]: unknown;'],
                    members: [keys]
                })
            )
        ).toBe(['interface KbqStateStore {', '    [key: string]: unknown;', '    keys?(): string[];', '}'].join('\n'));
        expect(getMemberDisplayName(keys)).toBe('keys?()');
        expect(
            renderEntrySignature(
                directive({
                    name: 'FlatTreeControl',
                    entryType: EntryType.UndecoratedClass,
                    implements: [],
                    members: [method('constructor', [['getLevel', '(node: T) => number']], 'FlatTreeControl<T>')]
                })
            )
        ).toBe(['class FlatTreeControl {', '    constructor(getLevel: (node: T) => number);', '}'].join('\n'));
    });

    it('writes a signal member the way the source does even where it binds nothing', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqFullScreenDropzoneService',
                    entryType: EntryType.UndecoratedClass,
                    isService: true,
                    injectableOptions: "{ providedIn: 'root' }",
                    extends: 'KbqDrop',
                    members: [
                        property({
                            name: 'filesDropped',
                            memberTags: [MemberTags.Readonly, MemberTags.Inherited],
                            type: 'OutputEmitterRef<KbqFile[]>',
                            signalApi: 'output',
                            declaredType: 'KbqFile[]',
                            inheritedFrom: 'KbqDrop'
                        })
                    ]
                })
            )
        ).toBe(
            [
                "@Injectable({ providedIn: 'root' })",
                'class KbqFullScreenDropzoneService extends KbqDrop {',
                '    readonly filesDropped = output<KbqFile[]>();',
                '}'
            ].join('\n')
        );
    });

    it('breaks a signature that does not fit into one parameter per line', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'DateAdapter',
                    entryType: EntryType.UndecoratedClass,
                    isAbstract: true,
                    members: [
                        method(
                            'createDateTime',
                            [
                                ['year', 'number'],
                                ['month', 'number'],
                                ['date', 'number'],
                                ['hours', 'number'],
                                ['minutes', 'number']
                            ],
                            'D',
                            { memberTags: [MemberTags.Abstract] }
                        ),
                        property({ name: 'locale', memberTags: [MemberTags.Protected], type: 'any' })
                    ]
                })
            )
        ).toBe(
            [
                'abstract class DateAdapter {',
                '    protected locale: any;',
                '    abstract createDateTime(',
                '        year: number,',
                '        month: number,',
                '        date: number,',
                '        hours: number,',
                '        minutes: number',
                '    ): D;',
                '}'
            ].join('\n')
        );
    });

    it('marks a deprecated member the way the source does', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqDropdown',
                    selector: 'kbq-dropdown',
                    members: [
                        property({
                            name: 'triggerWidth',
                            type: 'string',
                            jsdocTags: [{ name: 'deprecated', comment: 'Has no effect.' }]
                        })
                    ]
                })
            )
        ).toBe(
            [
                "@Directive({ selector: 'kbq-dropdown' })",
                'class KbqDropdown {',
                '    /** @deprecated */',
                '    triggerWidth: string;',
                '}'
            ].join('\n')
        );
    });

    it('writes a pipe with its name and a service with its injectable options', () => {
        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqDecimalPipe',
                    entryType: EntryType.Pipe,
                    pipeName: 'kbqNumber',
                    isPure: false,
                    members: [method('transform', [['value', 'any']], 'string | null')]
                })
            )
        ).toBe(
            [
                "@Pipe({ name: 'kbqNumber', pure: false })",
                'class KbqDecimalPipe {',
                '    transform(value: any): string | null;',
                '}'
            ].join('\n')
        );

        expect(
            renderEntrySignature(
                directive({
                    name: 'KbqMeasureScrollbarService',
                    entryType: EntryType.UndecoratedClass,
                    isService: true,
                    injectableOptions: "{ providedIn: 'root' }"
                })
            )
        ).toBe(["@Injectable({ providedIn: 'root' })", 'class KbqMeasureScrollbarService {}'].join('\n'));
    });

    it('writes the other kinds of entries', () => {
        const entry = (patch: Record<string, unknown>): DocEntry =>
            ({ description: '', rawComment: '', jsdocTags: [], ...patch }) as unknown as DocEntry;

        expect(
            renderEntrySignature(
                entry({
                    name: 'KbqComponentColors',
                    entryType: EntryType.Enum,
                    members: [
                        {
                            name: 'Theme',
                            value: "'theme'",
                            memberType: MemberType.EnumItem,
                            memberTags: [],
                            jsdocTags: []
                        },
                        {
                            name: 'Error',
                            value: "'error'",
                            memberType: MemberType.EnumItem,
                            memberTags: [],
                            jsdocTags: []
                        }
                    ] as unknown as EnumMemberEntry[]
                })
            )
        ).toBe(['enum KbqComponentColors {', "    Theme = 'theme',", "    Error = 'error'", '}'].join('\n'));

        expect(
            renderEntrySignature(
                entry({ name: 'KbqDefaultSizes', entryType: EntryType.TypeAlias, type: "'compact' | 'normal'" })
            )
        ).toBe("type KbqDefaultSizes = 'compact' | 'normal';");

        expect(renderEntrySignature(entry({ name: 'VERSION', entryType: EntryType.Constant, type: 'Version' }))).toBe(
            'const VERSION: Version;'
        );

        // The declared form over the compiler's, and a function type broken like any signature too long for a line.
        expect(
            renderEntrySignature(
                entry({
                    name: 'kbqInputLocaleConfigurationProvider',
                    entryType: EntryType.Constant,
                    type: '(configuration: { number?: { groupSeparator?: string[] | undefined; } | undefined; }) => Provider',
                    declaredType: '(configuration: KbqDeepPartial<KbqInputLocaleConfiguration>) => Provider',
                    declaredFunctionType: {
                        generics: '',
                        params: ['configuration: KbqDeepPartial<KbqInputLocaleConfiguration>'],
                        returnType: 'Provider'
                    }
                })
            )
        ).toBe(
            [
                'const kbqInputLocaleConfigurationProvider: (',
                '    configuration: KbqDeepPartial<KbqInputLocaleConfiguration>',
                ') => Provider;'
            ].join('\n')
        );

        expect(
            renderEntrySignature(
                entry({
                    name: 'KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG',
                    entryType: EntryType.Constant,
                    type: 'InjectionToken<Partial<{ core: () => Promise<{ default: HLJSApi; }>; }>>',
                    declaredType: 'InjectionToken<KbqCodeBlockHighlightJsConfig>'
                })
            )
        ).toBe('const KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG: InjectionToken<KbqCodeBlockHighlightJsConfig>;');

        expect(
            renderEntrySignature({
                ...(method('kbqInjectLocaleService', [], 'KbqLocaleService') as unknown as FunctionEntry),
                entryType: EntryType.Function
            })
        ).toBe('function kbqInjectLocaleService(): KbqLocaleService;');
    });
});

describe('member presentation', () => {
    it('names a member the way a template writes it', () => {
        expect(
            [
                property({ name: 'dropdown', memberTags: [MemberTags.Input], inputAlias: 'kbqDropdownTriggerFor' }),
                property({
                    name: 'restoreFocus',
                    memberTags: [MemberTags.Input, MemberTags.Output],
                    inputAlias: 'kbqRestoreFocus',
                    outputAlias: 'kbqRestoreFocusChange'
                }),
                property({ name: 'closed', memberTags: [MemberTags.Output], outputAlias: 'closed' }),
                property({ name: 'label', memberTags: [MemberTags.Optional] }),
                method('open', [], 'void')
            ].map(getMemberDisplayName)
        ).toEqual(['[kbqDropdownTriggerFor]', '[(kbqRestoreFocus)]', '(closed)', 'label?', 'open()']);
    });

    it('shows the value a binding carries rather than its signal wrapper', () => {
        expect(
            [
                property({
                    memberTags: [MemberTags.Input],
                    type: 'InputSignalWithTransform<boolean, unknown>',
                    signalApi: 'input'
                }),
                property({
                    memberTags: [MemberTags.Input],
                    type: 'InputSignal<(event: FocusEvent) => boolean>',
                    signalApi: 'input'
                }),
                property({ memberTags: [MemberTags.Output], type: 'OutputEmitterRef<void>', signalApi: 'output' }),
                property({ memberTags: [MemberTags.Output], type: 'EventEmitter<KbqTabChangeEvent>' }),
                property({ type: 'Signal<readonly KbqDropdownItem[]>' }),
                method('isNested', [], 'boolean'),
                method('open', [], 'void')
            ].map(getMemberDisplayType)
        ).toEqual([
            'boolean',
            '(event: FocusEvent) => boolean',
            '',
            'KbqTabChangeEvent',
            'Signal<readonly KbqDropdownItem[]>',
            'boolean',
            ''
        ]);
    });

    it('orders members by role, keeps a getter and its setter as one, and puts inherited ones after own', () => {
        expect(
            orderMembers([
                method('open', [], 'void'),
                property({ name: 'color', memberTags: [MemberTags.Inherited], inheritedFrom: 'KbqColorDirective' }),
                property({ name: 'disabled', memberType: MemberType.Setter, memberTags: [MemberTags.Input] }),
                property({ name: 'opened' }),
                property({
                    name: 'disabled',
                    memberType: MemberType.Getter,
                    memberTags: [MemberTags.Input],
                    description: 'Whether disabled.'
                }),
                property({ name: 'closed', memberTags: [MemberTags.Output] })
            ]).map(({ name, memberType, description }) => [name, memberType, description])
        ).toEqual([
            ['disabled', MemberType.Property, 'Whether disabled.'],
            ['closed', MemberType.Property, ''],
            ['opened', MemberType.Property, ''],
            ['color', MemberType.Property, ''],
            ['open', MemberType.Method, '']
        ]);
    });

    it('lists a member that has more to say than its line in the signature', () => {
        const transform = method('transform', [['value', 'number']], 'string');

        (transform as unknown as FunctionWithOverloads).signatures[0].params[0].description = '- The number.';

        expect(hasMemberDetails(property({ name: 'color' }))).toBe(false);
        expect(hasMemberDetails(method('open', [], 'void'))).toBe(false);
        expect(hasMemberDetails(property({ name: 'color', description: 'The theme color.' }))).toBe(true);
        expect(
            hasMemberDetails(property({ name: 'color', jsdocTags: [{ name: 'deprecated', comment: 'Use `theme`.' }] }))
        ).toBe(true);
        // A method may be documented by its parameters alone.
        expect(hasMemberDetails(transform)).toBe(true);
    });

    it('orders entries by kind, then by name', () => {
        const entry = (name: string, entryType: EntryType): DocEntry =>
            ({ name, entryType, description: '', rawComment: '', jsdocTags: [] }) as DocEntry;

        expect(
            [
                entry('KBQ_OPTIONS', EntryType.Constant),
                entry('KbqOptions', EntryType.Interface),
                entry('KbqTrigger', EntryType.Directive),
                entry('KbqPanel', EntryType.Component),
                entry('kbqHelper', EntryType.Function)
            ]
                .sort(compareEntries)
                .map(({ name }) => name)
        ).toEqual(['KbqPanel', 'KbqTrigger', 'kbqHelper', 'KbqOptions', 'KBQ_OPTIONS']);
    });
});
