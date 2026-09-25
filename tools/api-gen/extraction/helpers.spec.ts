import {
    ClassEntry,
    DocEntry,
    EntryType,
    FunctionWithOverloads,
    MemberTags,
    MemberType,
    PropertyEntry
} from '../rendering/entities';
import { ClassEntryMetadata } from '../types';
import { readSourceFile, updateEntries } from './helpers';

/** A directive entry carrying the given inputs, as Angular's extractor reports one. */
const directive = (name: string, inputs: { name: string; inputAlias?: string }[]): ClassEntry =>
    ({
        name,
        entryType: EntryType.Directive,
        members: inputs.map(({ name: member, inputAlias }): PropertyEntry => ({
            name: member,
            inputAlias,
            memberType: MemberType.Property,
            memberTags: [MemberTags.Input],
            type: 'string',
            description: '',
            jsdocTags: []
        }))
    }) as unknown as ClassEntry;

const metadata = (hostDirectives: ClassEntryMetadata['hostDirectives']): Record<string, ClassEntryMetadata> => ({
    KbqHost: { decorators: ['Component'], bases: [], hostDirectives, members: {} }
});

/** The member names `updateEntries` leaves on the host. */
const memberNames = (entries: DocEntry[]): string[] =>
    ((entries[0] as ClassEntry).members ?? []).map(({ name }) => name);

describe('host directive inputs', () => {
    const host = directive('KbqHost', [{ name: 'ownInput' }]);

    it('surfaces a forwarded input on the host', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { forwarded: 'forwarded' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'forwarded' }, { name: 'notForwarded' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput', 'forwarded']);
    });

    it('surfaces it under the name the host exposes it as', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { inner: 'outer' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'inner' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput', 'outer']);
    });

    // Angular matches a forwarded input by its public name, which is the alias when the input has one.
    it('matches a forwarded input by its alias', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { public: 'public' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'internal', inputAlias: 'public' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput', 'public']);
    });

    it('leaves the host alone when the directive surfaces nothing', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: {} }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'notForwarded' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput']);
    });

    // The directive can be in another package, or not documented at all.
    it('leaves the host alone when the directive was not extracted', () => {
        const entries = updateEntries([host], metadata([{ name: 'Missing', inputs: { forwarded: 'forwarded' } }]), {});

        expect(memberNames(entries)).toEqual(['ownInput']);
    });

    it('keeps the host own input when both declare the same name', () => {
        const entries = updateEntries([host], metadata([{ name: 'KbqBehavior', inputs: { ownInput: 'ownInput' } }]), {
            KbqBehavior: directive('KbqBehavior', [{ name: 'ownInput' }])
        });

        expect(memberNames(entries)).toEqual(['ownInput']);
    });
});

describe('reading hostDirectives from source', () => {
    it('reads the directive and the inputs it forwards', () => {
        expect(
            readSourceFile('packages/components/accordion/accordion.ts').classes.KbqAccordion.hostDirectives
        ).toEqual([
            { name: 'KbqStateSaving', inputs: { useStateSaving: 'useStateSaving', stateSavingKey: 'stateSavingKey' } }
        ]);
    });

    it('reads a directive applied without forwarding anything', () => {
        expect(
            readSourceFile('packages/components/toggle/toggle.component.ts').classes.KbqToggleComponent.hostDirectives
        ).toEqual([{ name: 'KbqCheckable', inputs: {} }]);
    });

    it('reports none for a component that applies no host directive', () => {
        expect(
            readSourceFile('packages/components/accordion/accordion-item.ts').classes.KbqAccordionItem.hostDirectives
        ).toEqual([]);
    });

    it('reads the outputs it forwards', () => {
        expect(
            readSourceFile('packages/components/navbar/navbar-item.component.ts').classes.KbqNavbarItem
                .hostDirectives[0].outputs
        ).toEqual({ kbqVisibleChange: 'kbqVisibleChange', kbqPlacementChange: 'kbqPlacementChange' });
    });
});

describe('non-class entries', () => {
    /** A function entry, as Angular's extractor reports one. */
    const fn = (name: string): DocEntry => ({ name, entryType: EntryType.Function }) as unknown as DocEntry;

    it('passes one through exactly once', () => {
        expect(updateEntries([fn('kbqHelper')], {})).toEqual([{ name: 'kbqHelper', entryType: EntryType.Function }]);
    });

    it('leaves the class-only fields off it', () => {
        const [entry] = updateEntries([fn('kbqHelper')], {});

        expect(entry).not.toHaveProperty('members');
        expect(entry).not.toHaveProperty('isService');
    });

    it('still enriches the class entries beside it', () => {
        const entries = updateEntries(
            [fn('kbqHelper'), directive('KbqHost', [{ name: 'ownInput' }])],
            metadata([{ name: 'KbqBehavior', inputs: { forwarded: 'forwarded' } }]),
            { KbqBehavior: directive('KbqBehavior', [{ name: 'forwarded' }]) }
        );

        expect(entries).toHaveLength(2);
        expect(((entries[1] as ClassEntry).members ?? []).map(({ name }) => name)).toEqual(['ownInput', 'forwarded']);
    });
});

describe('reading members from source', () => {
    const { KbqDlComponent } = readSourceFile('packages/components/dl/dl.component.ts').classes;

    it('reads the initializer API and the default of a signal input', () => {
        expect(KbqDlComponent.members.verticalBreakpoint).toEqual({
            signalApi: 'input',
            defaultValue: '400',
            binding: { input: 'verticalBreakpoint', required: false }
        });
    });

    it('reads the type argument as the declared type', () => {
        expect(KbqDlComponent.members.verticalAlign).toEqual({
            signalApi: 'input',
            declaredType: 'KbqDlAlign',
            defaultValue: "'start'",
            binding: { input: 'verticalAlign', required: false }
        });
    });

    // `undefined` is what an input without a default gets, so it is not shown as one.
    it('reads no default when the source passes undefined', () => {
        expect(KbqDlComponent.members.resizerAriaLabel).toEqual({
            signalApi: 'input',
            declaredType: 'string | undefined',
            binding: { input: 'resizerAriaLabel', required: false }
        });
    });

    it('reads an output with its payload type', () => {
        expect(KbqDlComponent.members.dtWidthChange).toEqual({
            signalApi: 'output',
            declaredType: 'number | null',
            binding: { output: 'dtWidthChange' }
        });
    });

    it('reads the default of a decorated input', () => {
        expect(
            readSourceFile('packages/components/tabs/tab-group.component.ts').classes.KbqTabGroup.members.headerPosition
        ).toEqual({
            declaredType: 'KbqTabHeaderPosition',
            defaultValue: "'above'",
            binding: { input: 'headerPosition', required: false }
        });
    });

    // A default is written in full, however long: a placeholder would leave a reader guessing.
    it('reads a default spanning lines in full, indented from the line it starts on', () => {
        expect(
            readSourceFile('packages/components/dropdown/dropdown.component.ts').classes.KbqDropdown.members
                .panelMinWidth.defaultValue
        ).toBe(
            [
                'this.defaultOptions.panelMinWidth === undefined',
                '    ? KBQ_PANEL_DEFAULT_MIN_WIDTH',
                '    : this.defaultOptions.panelMinWidth'
            ].join('\n')
        );
    });

    it('reads the names a signal input and a model bind under, their aliases included', () => {
        const { members } = readSourceFile('packages/components/dropdown/dropdown-trigger.directive.ts').classes
            .KbqDropdownTrigger;

        expect([members.dropdown.binding, members.restoreFocus.binding]).toEqual([
            { input: 'kbqDropdownTriggerFor', required: false },
            {
                input: 'kbqDropdownTriggerRestoreFocus',
                output: 'kbqDropdownTriggerRestoreFocusChange',
                required: false
            }
        ]);
    });

    it('reads the alias of a decorated input', () => {
        expect(
            readSourceFile('packages/components/tooltip/tooltip.component.ts').classes.KbqTooltipTrigger.members
                .relativeToPointer.binding
        ).toEqual({ input: 'kbqRelativeToPointer', required: false });
    });

    // Angular's extractor reports none: without these, the interface would read as empty.
    it('reads the index signatures of an interface', () => {
        expect(
            readSourceFile('packages/components/timezone/timezone.models.ts').classes.KbqTimezonesByCountry
                .indexSignatures
        ).toEqual(['[countryName: string]: KbqTimezoneZone[];']);
    });

    it('reads the bases a class extends', () => {
        expect(readSourceFile('packages/components/button/button-group.ts').classes.KbqButtonGroupRoot.bases).toEqual([
            'KbqColorDirective'
        ]);
    });
});

describe('member source metadata', () => {
    /** A member as Angular's extractor reports one. */
    const member = (patch: Partial<PropertyEntry>): PropertyEntry => ({
        name: '',
        memberType: MemberType.Property,
        memberTags: [],
        type: 'boolean',
        description: '',
        jsdocTags: [],
        ...patch
    });

    const classEntry = (name: string, members: PropertyEntry[]): ClassEntry =>
        ({ name, entryType: EntryType.Component, members }) as unknown as ClassEntry;

    const classMetadata = (patch: Partial<ClassEntryMetadata>): ClassEntryMetadata => ({
        decorators: ['Component'],
        bases: [],
        hostDirectives: [],
        members: {},
        ...patch
    });

    const membersOf = (entries: DocEntry[]): PropertyEntry[] => (entries[0] as ClassEntry).members as PropertyEntry[];

    it('adds what the source says to a member the class declares', () => {
        const [verticalAlign] = membersOf(
            updateEntries([classEntry('KbqDl', [member({ name: 'verticalAlign', memberTags: [MemberTags.Input] })])], {
                KbqDl: classMetadata({
                    members: {
                        verticalAlign: { signalApi: 'input', declaredType: 'KbqDlAlign', defaultValue: "'start'" }
                    }
                })
            })
        );

        expect(verticalAlign).toMatchObject({
            signalApi: 'input',
            declaredType: 'KbqDlAlign',
            defaultValue: "'start'"
        });
    });

    it('names the class an inherited member is declared in, however far up', () => {
        const [color] = membersOf(
            updateEntries([classEntry('KbqButton', [member({ name: 'color', memberTags: [MemberTags.Inherited] })])], {
                KbqButton: classMetadata({ bases: ['KbqButtonBase'] }),
                KbqButtonBase: classMetadata({ bases: ['KbqColorDirective'] }),
                KbqColorDirective: classMetadata({ members: { color: { declaredType: 'KbqComponentColors' } } })
            })
        );

        expect(color).toMatchObject({ inheritedFrom: 'KbqColorDirective', declaredType: 'KbqComponentColors' });
    });

    // Angular's extractor marks only the bindings a class declares itself.
    it('gives a directive the bindings it inherits from its base directive', () => {
        const [disabled] = membersOf(
            updateEntries(
                [
                    classEntry('KbqFileDropDirective', [
                        member({ name: 'disabled', memberTags: [MemberTags.Readonly, MemberTags.Inherited] })
                    ])
                ],
                {
                    KbqFileDropDirective: classMetadata({ bases: ['KbqDrop'] }),
                    KbqDrop: classMetadata({
                        members: {
                            disabled: { signalApi: 'model', binding: { input: 'disabled', output: 'disabledChange' } }
                        }
                    })
                }
            )
        );

        expect(disabled).toMatchObject({
            memberTags: [MemberTags.Readonly, MemberTags.Inherited, MemberTags.Input, MemberTags.Output],
            inputAlias: 'disabled',
            outputAlias: 'disabledChange',
            isRequiredInput: false,
            signalApi: 'model',
            inheritedFrom: 'KbqDrop'
        });
    });

    it('gives no bindings to a service extending a directive', () => {
        const [filesDropped] = membersOf(
            updateEntries(
                [
                    {
                        ...classEntry('KbqFullScreenDropzoneService', [
                            member({ name: 'filesDropped', memberTags: [MemberTags.Readonly, MemberTags.Inherited] })
                        ]),
                        entryType: EntryType.UndecoratedClass
                    }
                ],
                {
                    KbqFullScreenDropzoneService: classMetadata({ decorators: ['Injectable'], bases: ['KbqDrop'] }),
                    KbqDrop: classMetadata({
                        members: { filesDropped: { signalApi: 'output', binding: { output: 'filesDropped' } } }
                    })
                }
            )
        );

        expect(filesDropped.memberTags).toEqual([MemberTags.Readonly, MemberTags.Inherited]);
        expect(filesDropped).toMatchObject({ signalApi: 'output', inheritedFrom: 'KbqDrop' });
        expect(filesDropped).not.toHaveProperty('binding');
    });

    // The docs show the pair the way a template binds it: one `[(dtWidth)]`, declared as a `model()`.
    it('merges a hidden backing input and its change output into the public member', () => {
        const members = membersOf(
            updateEntries(
                [
                    classEntry('KbqDl', [
                        member({
                            name: 'dtWidthInput',
                            memberTags: [MemberTags.Input],
                            inputAlias: 'dtWidth',
                            jsdocTags: [{ name: 'docs-private', comment: '' }]
                        }),
                        member({ name: 'dtWidth', type: 'WritableSignal<number | null>', description: 'Width.' }),
                        member({ name: 'dtWidthChange', memberTags: [MemberTags.Output], outputAlias: 'dtWidthChange' })
                    ])
                ],
                {
                    KbqDl: classMetadata({
                        members: {
                            dtWidthInput: { signalApi: 'input', declaredType: 'number | null', defaultValue: 'null' },
                            dtWidth: {},
                            dtWidthChange: { signalApi: 'output' }
                        }
                    })
                }
            )
        );

        expect(members.map(({ name }) => name)).toEqual(['dtWidthInput', 'dtWidth']);
        expect(members[1]).toMatchObject({
            memberTags: [MemberTags.Input, MemberTags.Output],
            inputAlias: 'dtWidth',
            outputAlias: 'dtWidthChange',
            signalApi: 'model',
            declaredType: 'number | null',
            defaultValue: 'null',
            description: 'Width.'
        });
    });

    it('leaves a backing input with no public counterpart hidden and alone', () => {
        const members = membersOf(
            updateEntries(
                [
                    classEntry('KbqCodeBlock', [
                        member({
                            name: 'canLoadInput',
                            memberTags: [MemberTags.Input],
                            inputAlias: 'canLoad',
                            jsdocTags: [{ name: 'docs-private', comment: '' }]
                        })
                    ])
                ],
                { KbqCodeBlock: classMetadata({}) }
            )
        );

        expect(members.map(({ name, memberTags }) => [name, memberTags])).toEqual([
            ['canLoadInput', [MemberTags.Input]]
        ]);
    });

    // Angular binds a forwarded input on the host under the exposed name, never under the directive's alias.
    it('binds a forwarded host directive input under the name the host exposes', () => {
        const members = membersOf(
            updateEntries(
                [classEntry('KbqHost', [])],
                {
                    KbqHost: classMetadata({
                        hostDirectives: [
                            { name: 'KbqLocaleOverrides', inputs: { kbqLocaleOverrides: 'localeOverrides' } }
                        ]
                    })
                },
                {
                    KbqLocaleOverrides: classEntry('KbqLocaleOverrides', [
                        member({ name: 'overrides', memberTags: [MemberTags.Input], inputAlias: 'kbqLocaleOverrides' })
                    ])
                },
                {
                    KbqLocaleOverrides: classMetadata({
                        members: { overrides: { signalApi: 'input', declaredType: 'KbqPartialLocaleData' } }
                    })
                }
            )
        );

        expect(members).toEqual([
            expect.objectContaining({
                name: 'localeOverrides',
                inputAlias: 'localeOverrides',
                declaredType: 'KbqPartialLocaleData',
                forwardedFrom: { directive: 'KbqLocaleOverrides', input: 'kbqLocaleOverrides' }
            })
        ]);
    });

    // A getter the host reads its state through binds nothing: the forwarded input is still what is bound.
    it('forwards a host directive input beside a host member of that name that binds nothing', () => {
        const members = membersOf(
            updateEntries(
                [
                    classEntry('KbqFileUpload', [
                        member({
                            name: 'disabled',
                            memberType: MemberType.Getter,
                            jsdocTags: [{ name: 'docs-private', comment: '' }]
                        })
                    ])
                ],
                {
                    KbqFileUpload: classMetadata({
                        hostDirectives: [{ name: 'KbqFileUploadContext', inputs: { disabled: 'disabled' } }]
                    })
                },
                {
                    KbqFileUploadContext: classEntry('KbqFileUploadContext', [
                        member({
                            name: 'disabled',
                            memberTags: [MemberTags.Input, MemberTags.Output],
                            inputAlias: 'disabled',
                            outputAlias: 'disabledChange'
                        })
                    ])
                }
            )
        );

        expect(
            members.map(({ name, memberType, memberTags, outputAlias }) => [name, memberType, memberTags, outputAlias])
        ).toEqual([
            ['disabled', MemberType.Getter, [], undefined],
            // Its `Change` output stays on the directive: on the host, the model is an input alone.
            ['disabled', MemberType.Property, [MemberTags.Input], undefined]
        ]);
    });

    it('forwards the outputs a host directive exposes, under the names it exposes them', () => {
        const members = membersOf(
            updateEntries(
                [classEntry('KbqNavbarItem', [])],
                {
                    KbqNavbarItem: classMetadata({
                        hostDirectives: [
                            {
                                name: 'KbqTooltipTrigger',
                                inputs: { kbqVisible: 'kbqVisible' },
                                outputs: { kbqVisibleChange: 'kbqVisibleChange', kbqPlacementChange: 'placementChange' }
                            }
                        ]
                    })
                },
                {
                    KbqTooltipTrigger: classEntry('KbqTooltipTrigger', [
                        member({
                            name: 'visible',
                            memberTags: [MemberTags.Input, MemberTags.Output],
                            inputAlias: 'kbqVisible',
                            outputAlias: 'kbqVisibleChange'
                        }),
                        member({
                            name: 'placement',
                            memberTags: [MemberTags.Output],
                            outputAlias: 'kbqPlacementChange'
                        })
                    ])
                }
            )
        );

        expect(
            members.map(({ name, inputAlias, outputAlias, forwardedFrom }) => ({
                name,
                inputAlias,
                outputAlias,
                forwardedFrom
            }))
        ).toEqual([
            {
                name: 'kbqVisible',
                inputAlias: 'kbqVisible',
                outputAlias: 'kbqVisibleChange',
                forwardedFrom: { directive: 'KbqTooltipTrigger', input: 'kbqVisible', output: 'kbqVisibleChange' }
            },
            {
                name: 'placementChange',
                inputAlias: undefined,
                outputAlias: 'placementChange',
                forwardedFrom: { directive: 'KbqTooltipTrigger', output: 'kbqPlacementChange' }
            }
        ]);
    });

    // The public side of a backing input can be a getter that adds to the bound value what the class knows.
    it('merges a hidden backing input into a public getter', () => {
        const [, disabled] = membersOf(
            updateEntries(
                [
                    classEntry('KbqTreeNodeToggle', [
                        member({
                            name: 'disabledInput',
                            memberTags: [MemberTags.Input],
                            inputAlias: 'disabled',
                            jsdocTags: [{ name: 'docs-private', comment: '' }]
                        }),
                        member({ name: 'disabled', memberType: MemberType.Getter })
                    ])
                ],
                {
                    KbqTreeNodeToggle: classMetadata({
                        members: {
                            disabledInput: { signalApi: 'input', defaultValue: 'false' },
                            disabled: { declaredType: 'boolean' }
                        }
                    })
                }
            )
        );

        expect(disabled).toMatchObject({
            memberType: MemberType.Property,
            memberTags: [MemberTags.Input],
            inputAlias: 'disabled',
            signalApi: 'input',
            declaredType: 'boolean',
            defaultValue: 'false'
        });
    });
});

describe('reading exported constants and functions from source', () => {
    it('writes an arrow function constant with the types its source annotates', () => {
        expect(
            readSourceFile('packages/components/input/input-number.ts').declarations.kbqInputLocaleConfigurationProvider
        ).toEqual({
            declaredType: '(configuration: KbqDeepPartial<KbqInputLocaleConfiguration>) => Provider',
            declaredFunctionType: {
                generics: '',
                params: ['configuration: KbqDeepPartial<KbqInputLocaleConfiguration>'],
                returnType: 'Provider'
            }
        });
    });

    it('writes a token with the type argument it is created with', () => {
        expect(
            readSourceFile('packages/components/code-block/code-block-highlight.ts').declarations
                .KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG
        ).toEqual({ declaredType: 'InjectionToken<KbqCodeBlockHighlightJsConfig>' });
    });

    it('reads each overload of a function, and its implementation apart', () => {
        expect(
            readSourceFile('packages/components/core/locales/locale-service.ts').declarations.kbqInjectLocaleService
        ).toEqual({
            callable: {
                overloads: [
                    { params: ['InjectOptions & { optional?: false }'], returnType: 'KbqLocaleService' },
                    { params: ['InjectOptions'], returnType: 'KbqLocaleService | null' }
                ],
                implementation: { params: ['InjectOptions'], returnType: 'KbqLocaleService | null' }
            }
        });
    });

    /** A constant or function entry, as Angular's extractor reports one. */
    const entry = (patch: Record<string, unknown>): DocEntry => patch as unknown as DocEntry;

    it('gives a constant the declared type of the constant it is another name for', () => {
        const [provider] = updateEntries(
            [
                entry({
                    name: 'kbqFilesizeProvider',
                    entryType: EntryType.Constant,
                    type: '(configuration: { … }) => Provider'
                })
            ],
            {},
            {},
            {},
            {
                kbqFilesizeProvider: { aliasOf: 'kbqSizeUnitsProvider' },
                kbqSizeUnitsProvider: { declaredType: '(configuration: KbqDeepPartial<KbqSizeUnits>) => Provider' }
            }
        );

        expect(provider).toMatchObject({ declaredType: '(configuration: KbqDeepPartial<KbqSizeUnits>) => Provider' });
    });

    // The compiler spells an alias out; a parameter the source leaves unannotated keeps its type.
    it('replaces the compiler types of a function signature with the annotated ones', () => {
        const [fn] = updateEntries(
            [
                entry({
                    name: 'kbqInjectLocaleService',
                    entryType: EntryType.Function,
                    signatures: [
                        {
                            params: [
                                { name: 'options', type: 'InjectOptions | undefined' },
                                { name: 'fallback', type: 'string' }
                            ],
                            returnType: 'KbqLocaleService'
                        }
                    ],
                    implementation: null
                })
            ],
            {},
            {},
            {},
            {
                kbqInjectLocaleService: {
                    callable: {
                        overloads: [],
                        implementation: { params: ['InjectOptions', undefined], returnType: 'KbqLocaleService | null' }
                    }
                }
            }
        );

        expect((fn as unknown as FunctionWithOverloads).signatures[0]).toEqual({
            params: [
                { name: 'options', type: 'InjectOptions' },
                { name: 'fallback', type: 'string' }
            ],
            returnType: 'KbqLocaleService | null'
        });
    });
});
