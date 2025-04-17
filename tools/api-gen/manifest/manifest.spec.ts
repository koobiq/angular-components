import { DocEntry, EntryType } from '../rendering/entities';
import { generateManifest } from './';

describe('api manifest generation', () => {
    it('should generate a manifest from multiple collections', () => {
        expect(
            generateManifest([
                {
                    moduleName: 'cdk',
                    packagesApiInfo: [
                        {
                            packageName: 'button',
                            entries: [
                                entry({ name: 'KbqButton', entryType: EntryType.Component }),
                                entry({ name: 'TOOLTIP_TIMEOUT', entryType: EntryType.Constant })
                            ]
                        }
                    ]
                }
            ])
        ).toMatchSnapshot();
    });

    it('should should filter private entries', () => {
        expect(
            generateManifest([
                {
                    moduleName: 'components-experimental',
                    packagesApiInfo: [
                        {
                            packageName: 'form-field',
                            entries: [
                                {
                                    name: 'KbqHint',
                                    isAbstract: false,
                                    entryType: 'component',
                                    members: [
                                        {
                                            name: 'id',
                                            type: 'string',
                                            memberType: 'property',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: 'Unique ID for the hint.',
                                            jsdocTags: [],
                                            inputAlias: 'id',
                                            isRequiredInput: false
                                        },
                                        {
                                            name: 'colors',
                                            type: 'typeof KbqComponentColors',
                                            memberType: 'property',
                                            memberTags: [
                                                'protected'
                                            ],
                                            description: 'Component colors',
                                            jsdocTags: []
                                        },
                                        {
                                            name: 'color',
                                            type: 'KbqComponentColors',
                                            memberType: 'setter',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: 'Hint color',
                                            jsdocTags: [],
                                            inputAlias: 'color',
                                            isRequiredInput: false
                                        },
                                        {
                                            name: 'color',
                                            type: 'KbqComponentColors',
                                            memberType: 'getter',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: '',
                                            jsdocTags: [],
                                            inputAlias: 'color',
                                            isRequiredInput: false
                                        },
                                        {
                                            name: 'fillTextOff',
                                            type: 'boolean',
                                            memberType: 'setter',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: 'Disables `color` for the hint text.',
                                            jsdocTags: [],
                                            inputAlias: 'fillTextOff',
                                            isRequiredInput: false
                                        },
                                        {
                                            name: 'fillTextOff',
                                            type: 'boolean',
                                            memberType: 'getter',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: '',
                                            jsdocTags: [],
                                            inputAlias: 'fillTextOff',
                                            isRequiredInput: false
                                        },
                                        {
                                            name: 'compact',
                                            type: 'boolean',
                                            memberType: 'property',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: 'Makes the hint size smaller.',
                                            jsdocTags: [],
                                            inputAlias: 'compact',
                                            isRequiredInput: false
                                        }
                                    ],
                                    generics: [],
                                    description: 'Hint text to be shown below the form field control.',
                                    jsdocTags: [],
                                    rawComment: '/** Hint text to be shown below the form field control. */',
                                    implements: [],
                                    isStandalone: true,
                                    selector: 'kbq-hint',
                                    exportAs: [
                                        'kbqHint'
                                    ],
                                    source: {
                                        filePath: '/packages/components-experimental/form-field/hint.ts',
                                        startLine: 10,
                                        endLine: 63
                                    },
                                    isService: false,
                                    extendedDoc: false
                                },
                                {
                                    name: 'KBQ_FORM_FIELD_DEFAULT_OPTIONS',
                                    type: 'InjectionToken<Partial<{ noBorders: boolean; }>>',
                                    entryType: 'constant',
                                    rawComment:
                                        "/** Injection token that can be used to configure the default options for all kbq-form-field's. */",
                                    description:
                                        "Injection token that can be used to configure the default options for all kbq-form-field's.",
                                    jsdocTags: [],
                                    source: {
                                        filePath: '/packages/components-experimental/form-field/form-field.ts',
                                        startLine: 46,
                                        endLine: 48
                                    },
                                    extendedDoc: false
                                },
                                {
                                    name: 'getKbqFormFieldMissingControlError',
                                    type: '() => Error',
                                    entryType: 'constant',
                                    rawComment: '/** @docs-private */',
                                    description: '',
                                    jsdocTags: [
                                        {
                                            name: 'docs-private',
                                            comment: ''
                                        }
                                    ],
                                    source: {
                                        filePath: '/packages/components-experimental/form-field/form-field.ts',
                                        startLine: 57,
                                        endLine: 59
                                    }
                                },
                                {
                                    name: 'KbqFormField',
                                    isAbstract: false,
                                    entryType: 'component',
                                    members: [
                                        {
                                            name: 'noBorders',
                                            type: 'boolean',
                                            memberType: 'property',
                                            memberTags: [
                                                'input'
                                            ],
                                            description: 'Disables form field borders and shadows.',
                                            jsdocTags: [],
                                            inputAlias: 'noBorders',
                                            isRequiredInput: false
                                        },
                                        {
                                            name: 'canCleanerClearByEsc',
                                            type: 'boolean',
                                            memberType: 'property',
                                            memberTags: [],
                                            description: '',
                                            jsdocTags: [
                                                {
                                                    name: 'docs-private',
                                                    comment: ''
                                                }
                                            ]
                                        },
                                        {
                                            name: 'ngAfterContentInit',
                                            signatures: [
                                                {
                                                    name: 'ngAfterContentInit',
                                                    entryType: 'function',
                                                    description: '',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [],
                                                    params: [],
                                                    rawComment: '',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'ngAfterContentInit',
                                                description: '',
                                                entryType: 'function',
                                                jsdocTags: [],
                                                rawComment: ''
                                            },
                                            entryType: 'function',
                                            description: '',
                                            jsdocTags: [],
                                            rawComment: '',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'ngAfterViewInit',
                                            signatures: [
                                                {
                                                    name: 'ngAfterViewInit',
                                                    entryType: 'function',
                                                    description: '',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [],
                                                    params: [],
                                                    rawComment: '',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'ngAfterViewInit',
                                                description: '',
                                                entryType: 'function',
                                                jsdocTags: [],
                                                rawComment: ''
                                            },
                                            entryType: 'function',
                                            description: '',
                                            jsdocTags: [],
                                            rawComment: '',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'ngOnDestroy',
                                            signatures: [
                                                {
                                                    name: 'ngOnDestroy',
                                                    entryType: 'function',
                                                    description: '',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [],
                                                    params: [],
                                                    rawComment: '',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'ngOnDestroy',
                                                description: '',
                                                entryType: 'function',
                                                jsdocTags: [],
                                                rawComment: ''
                                            },
                                            entryType: 'function',
                                            description: '',
                                            jsdocTags: [],
                                            rawComment: '',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'focus',
                                            signatures: [
                                                {
                                                    name: 'focus',
                                                    entryType: 'function',
                                                    description: 'Focuses the control.',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [],
                                                    params: [
                                                        {
                                                            name: 'options',
                                                            description: '',
                                                            type: 'FocusOptions',
                                                            isOptional: true,
                                                            isRestParam: false
                                                        }
                                                    ],
                                                    rawComment: '/** Focuses the control. */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [
                                                    {
                                                        name: 'options',
                                                        description: '',
                                                        type: 'FocusOptions',
                                                        isOptional: true,
                                                        isRestParam: false
                                                    }
                                                ],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'focus',
                                                description: 'Focuses the control.',
                                                entryType: 'function',
                                                jsdocTags: [],
                                                rawComment: '/** Focuses the control. */'
                                            },
                                            entryType: 'function',
                                            description: 'Focuses the control.',
                                            jsdocTags: [],
                                            rawComment: '/** Focuses the control. */',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'focusViaKeyboard',
                                            signatures: [
                                                {
                                                    name: 'focusViaKeyboard',
                                                    entryType: 'function',
                                                    description: '',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [
                                                        {
                                                            name: 'deprecated',
                                                            comment: 'Use `focus` instead.'
                                                        }
                                                    ],
                                                    params: [
                                                        {
                                                            name: 'options',
                                                            description: '',
                                                            type: 'FocusOptions',
                                                            isOptional: true,
                                                            isRestParam: false
                                                        }
                                                    ],
                                                    rawComment: '/**\n     * @deprecated Use `focus` instead.\n     */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [
                                                    {
                                                        name: 'options',
                                                        description: '',
                                                        type: 'FocusOptions',
                                                        isOptional: true,
                                                        isRestParam: false
                                                    }
                                                ],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'focusViaKeyboard',
                                                description: '',
                                                entryType: 'function',
                                                jsdocTags: [
                                                    {
                                                        name: 'deprecated',
                                                        comment: 'Use `focus` instead.'
                                                    }
                                                ],
                                                rawComment: '/**\n     * @deprecated Use `focus` instead.\n     */'
                                            },
                                            entryType: 'function',
                                            description: '',
                                            jsdocTags: [
                                                {
                                                    name: 'deprecated',
                                                    comment: 'Use `focus` instead.'
                                                }
                                            ],
                                            rawComment: '/**\n     * @deprecated Use `focus` instead.\n     */',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'runFocusMonitor',
                                            signatures: [
                                                {
                                                    name: 'runFocusMonitor',
                                                    entryType: 'function',
                                                    description: 'Runs the focus monitor for the form field.',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [
                                                        {
                                                            name: 'docs-private',
                                                            comment: ''
                                                        }
                                                    ],
                                                    params: [],
                                                    rawComment:
                                                        '/**\n     * Runs the focus monitor for the form field.\n     *\n     * @docs-private\n     */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'runFocusMonitor',
                                                description: 'Runs the focus monitor for the form field.',
                                                entryType: 'function',
                                                jsdocTags: [
                                                    {
                                                        name: 'docs-private',
                                                        comment: ''
                                                    }
                                                ],
                                                rawComment:
                                                    '/**\n     * Runs the focus monitor for the form field.\n     *\n     * @docs-private\n     */'
                                            },
                                            entryType: 'function',
                                            description: 'Runs the focus monitor for the form field.',
                                            jsdocTags: [
                                                {
                                                    name: 'docs-private',
                                                    comment: ''
                                                }
                                            ],
                                            rawComment:
                                                '/**\n     * Runs the focus monitor for the form field.\n     *\n     * @docs-private\n     */',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'stopFocusMonitor',
                                            signatures: [
                                                {
                                                    name: 'stopFocusMonitor',
                                                    entryType: 'function',
                                                    description: 'Stops the focus monitor for the form field.',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [
                                                        {
                                                            name: 'docs-private',
                                                            comment: ''
                                                        }
                                                    ],
                                                    params: [],
                                                    rawComment:
                                                        '/**\n     * Stops the focus monitor for the form field.\n     *\n     * @docs-private\n     */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'stopFocusMonitor',
                                                description: 'Stops the focus monitor for the form field.',
                                                entryType: 'function',
                                                jsdocTags: [
                                                    {
                                                        name: 'docs-private',
                                                        comment: ''
                                                    }
                                                ],
                                                rawComment:
                                                    '/**\n     * Stops the focus monitor for the form field.\n     *\n     * @docs-private\n     */'
                                            },
                                            entryType: 'function',
                                            description: 'Stops the focus monitor for the form field.',
                                            jsdocTags: [
                                                {
                                                    name: 'docs-private',
                                                    comment: ''
                                                }
                                            ],
                                            rawComment:
                                                '/**\n     * Stops the focus monitor for the form field.\n     *\n     * @docs-private\n     */',
                                            memberType: 'method',
                                            memberTags: []
                                        },
                                        {
                                            name: 'onContainerClick',
                                            signatures: [
                                                {
                                                    name: 'onContainerClick',
                                                    entryType: 'function',
                                                    description: "Handles a click on the control's container.",
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [],
                                                    params: [
                                                        {
                                                            name: 'event',
                                                            description: '',
                                                            type: 'MouseEvent',
                                                            isOptional: false,
                                                            isRestParam: false
                                                        }
                                                    ],
                                                    rawComment: "/** Handles a click on the control's container. */",
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [
                                                    {
                                                        name: 'event',
                                                        description: '',
                                                        type: 'MouseEvent',
                                                        isOptional: false,
                                                        isRestParam: false
                                                    }
                                                ],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'onContainerClick',
                                                description: "Handles a click on the control's container.",
                                                entryType: 'function',
                                                jsdocTags: [],
                                                rawComment: "/** Handles a click on the control's container. */"
                                            },
                                            entryType: 'function',
                                            description: "Handles a click on the control's container.",
                                            jsdocTags: [],
                                            rawComment: "/** Handles a click on the control's container. */",
                                            memberType: 'method',
                                            memberTags: [
                                                'protected'
                                            ]
                                        },
                                        {
                                            name: 'onKeyDown',
                                            signatures: [
                                                {
                                                    name: 'onKeyDown',
                                                    entryType: 'function',
                                                    description: 'Handles keydown events.',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [
                                                        {
                                                            name: 'docs-private',
                                                            comment: ''
                                                        }
                                                    ],
                                                    params: [
                                                        {
                                                            name: 'event',
                                                            description: '',
                                                            type: 'KeyboardEvent',
                                                            isOptional: false,
                                                            isRestParam: false
                                                        }
                                                    ],
                                                    rawComment:
                                                        '/**\n     * Handles keydown events.\n     *\n     * @docs-private\n     */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [
                                                    {
                                                        name: 'event',
                                                        description: '',
                                                        type: 'KeyboardEvent',
                                                        isOptional: false,
                                                        isRestParam: false
                                                    }
                                                ],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'onKeyDown',
                                                description: 'Handles keydown events.',
                                                entryType: 'function',
                                                jsdocTags: [
                                                    {
                                                        name: 'docs-private',
                                                        comment: ''
                                                    }
                                                ],
                                                rawComment:
                                                    '/**\n     * Handles keydown events.\n     *\n     * @docs-private\n     */'
                                            },
                                            entryType: 'function',
                                            description: 'Handles keydown events.',
                                            jsdocTags: [
                                                {
                                                    name: 'docs-private',
                                                    comment: ''
                                                }
                                            ],
                                            rawComment:
                                                '/**\n     * Handles keydown events.\n     *\n     * @docs-private\n     */',
                                            memberType: 'method',
                                            memberTags: [
                                                'protected'
                                            ]
                                        },
                                        {
                                            name: 'mouseenter',
                                            signatures: [
                                                {
                                                    name: 'mouseenter',
                                                    entryType: 'function',
                                                    description: 'Handles mouseenter events.',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [
                                                        {
                                                            name: 'docs-private',
                                                            comment: ''
                                                        }
                                                    ],
                                                    params: [
                                                        {
                                                            name: '_event',
                                                            description: '',
                                                            type: 'MouseEvent',
                                                            isOptional: false,
                                                            isRestParam: false
                                                        }
                                                    ],
                                                    rawComment:
                                                        '/**\n     * Handles mouseenter events.\n     *\n     * @docs-private\n     */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [
                                                    {
                                                        name: '_event',
                                                        description: '',
                                                        type: 'MouseEvent',
                                                        isOptional: false,
                                                        isRestParam: false
                                                    }
                                                ],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'mouseenter',
                                                description: 'Handles mouseenter events.',
                                                entryType: 'function',
                                                jsdocTags: [
                                                    {
                                                        name: 'docs-private',
                                                        comment: ''
                                                    }
                                                ],
                                                rawComment:
                                                    '/**\n     * Handles mouseenter events.\n     *\n     * @docs-private\n     */'
                                            },
                                            entryType: 'function',
                                            description: 'Handles mouseenter events.',
                                            jsdocTags: [
                                                {
                                                    name: 'docs-private',
                                                    comment: ''
                                                }
                                            ],
                                            rawComment:
                                                '/**\n     * Handles mouseenter events.\n     *\n     * @docs-private\n     */',
                                            memberType: 'method',
                                            memberTags: [
                                                'protected'
                                            ]
                                        },
                                        {
                                            name: 'mouseleave',
                                            signatures: [
                                                {
                                                    name: 'mouseleave',
                                                    entryType: 'function',
                                                    description: 'Handles mouseleave events.',
                                                    generics: [],
                                                    isNewType: false,
                                                    jsdocTags: [
                                                        {
                                                            name: 'docs-private',
                                                            comment: ''
                                                        }
                                                    ],
                                                    params: [
                                                        {
                                                            name: '_event',
                                                            description: '',
                                                            type: 'MouseEvent',
                                                            isOptional: false,
                                                            isRestParam: false
                                                        }
                                                    ],
                                                    rawComment:
                                                        '/**\n     * Handles mouseleave events.\n     *\n     * @docs-private\n     */',
                                                    returnType: 'void'
                                                }
                                            ],
                                            implementation: {
                                                params: [
                                                    {
                                                        name: '_event',
                                                        description: '',
                                                        type: 'MouseEvent',
                                                        isOptional: false,
                                                        isRestParam: false
                                                    }
                                                ],
                                                isNewType: false,
                                                returnType: 'void',
                                                generics: [],
                                                name: 'mouseleave',
                                                description: 'Handles mouseleave events.',
                                                entryType: 'function',
                                                jsdocTags: [
                                                    {
                                                        name: 'docs-private',
                                                        comment: ''
                                                    }
                                                ],
                                                rawComment:
                                                    '/**\n     * Handles mouseleave events.\n     *\n     * @docs-private\n     */'
                                            },
                                            entryType: 'function',
                                            description: 'Handles mouseleave events.',
                                            jsdocTags: [
                                                {
                                                    name: 'docs-private',
                                                    comment: ''
                                                }
                                            ],
                                            rawComment:
                                                '/**\n     * Handles mouseleave events.\n     *\n     * @docs-private\n     */',
                                            memberType: 'method',
                                            memberTags: [
                                                'protected'
                                            ]
                                        }
                                    ],
                                    generics: [],
                                    description: 'Container for form controls that applies styling and behavior.',
                                    jsdocTags: [],
                                    rawComment: '/** Container for form controls that applies styling and behavior. */',
                                    implements: [
                                        'AfterContentInit',
                                        'AfterViewInit',
                                        'OnDestroy'
                                    ],
                                    isStandalone: true,
                                    selector: 'kbq-form-field',
                                    exportAs: [
                                        'kbqFormField'
                                    ],
                                    source: {
                                        filePath: '/packages/components-experimental/form-field/form-field.ts',
                                        startLine: 62,
                                        endLine: 407
                                    },
                                    isService: false,
                                    extendedDoc: false
                                }
                            ]
                        }
                    ]
                }
            ])
        ).toMatchSnapshot();
    });
});

/** Creates a fake DocsEntry with the given object's fields patches onto the result. */
function entry(patch: Partial<DocEntry>): DocEntry {
    return {
        name: '',
        description: '',
        entryType: EntryType.Constant,
        jsdocTags: [],
        rawComment: '',
        ...patch
    };
}
