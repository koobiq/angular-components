import { jsdoc } from 'eslint-plugin-jsdoc';

/** Tags the API tab shows, in the order a block keeps them. */
const shownJsDocTags = ['deprecated', 'param', 'returns', 'example'];

/** Tags that hide a declaration from the docs, kept last in a block. */
const hidingJsDocTags = ['docs-private', 'internal'];

/** JSDoc tags the docs read. */
const docsJsDocTags = [...shownJsDocTags, ...hidingJsDocTags];

/** A selector's pattern for the name of a hiding tag. */
const hidingJsDocTag = `/^(${hidingJsDocTags.join('|')})$/`;

/** Tags the docs do not show, and how to say the same in a form they do. */
const jsDocTagHints = {
    description: 'write the description first, without a tag.',
    link: 'write a Markdown link or the inline `{@link Name}` in the description.',
    property: 'describe the property in a comment of its own.',
    todo: 'write a `// TODO` comment instead.',
    see: 'refer to it in the description, a declaration with `{@link Name}` and a page with a Markdown link.',
    default: 'end the description with "Defaults to `value`."'
};

/**
 * JSDoc of the published Angular packages: packages/components and packages/components-experimental, which the docs
 * site and llms-full.txt are generated from, and the two date adapters, which are to join them. TypeScript takes any
 * `@word` after a space for a tag, in the middle of a line too, and hides the text after it in that tag, so a tag the
 * docs do not show loses that text without an error anywhere.
 */
export const publishedJsDocConfig = jsdoc({
    config: 'flat/recommended-typescript',
    files: [
        'packages/components/**/*.ts',
        'packages/components-experimental/**/*.ts',
        'packages/angular-luxon-adapter/**/*.ts',
        'packages/angular-moment-adapter/**/*.ts'
    ],
    ignores: [
        '**/*.spec.ts',
        '**/*.playwright-spec.ts',
        '**/e2e.ts',
        // the highlight.js plugin, kept as its author wrote it
        'packages/components/code-block/highlightjs-line-numbers.ts'
    ],
    settings: {
        mode: 'typescript'
    },
    extraRuleDefinitions: {
        forbid: {
            // Angular's extractor leaves a private member out of the docs by itself, while `@internal` would also take
            // it out of the typings, where it decides whether two classes are compatible
            'hiding-tag-on-private-member': {
                description: 'Disallows `@docs-private` and `@internal` on a private member.',
                contexts: [
                    {
                        context:
                            ':matches(PropertyDefinition, MethodDefinition, AccessorProperty, TSParameterProperty)[accessibility="private"], :matches(PropertyDefinition, MethodDefinition, AccessorProperty)[key.type="PrivateIdentifier"]',
                        comment: `JsdocBlock:has(JsdocTag[tag=${hidingJsDocTag}]), JsdocBlock[description=/@docs-private\\s*$/]`,
                        message: 'A private member is not in the docs anyway: drop `@docs-private` or `@internal`.'
                    }
                ]
            }
        }
    },
    rules: {
        // plugin:jsdoc — on top of the recommended set, without its requirements: the checks of text the docs would
        // lose, and one layout of a block
        // only the tags the docs read: any other one, known to JSDoc or not, takes its text out of the docs.
        // `check-tag-names` knows every JSDoc tag and would report an unknown one a second time
        'jsdoc/check-tag-names': 0,
        'jsdoc/no-restricted-syntax': [
            1,
            {
                contexts: [
                    ...Object.entries(jsDocTagHints).map(([tag, hint]) => ({
                        comment: `JsdocBlock:has(JsdocTag[tag="${tag}"])`,
                        message: `The docs do not show \`@${tag}\`: ${hint}`
                    })),
                    {
                        comment: `JsdocBlock:has(JsdocTag:not([tag=/^(${[...docsJsDocTags, ...Object.keys(jsDocTagHints)].join('|')})$/]))`,
                        message: `The docs read only ${docsJsDocTags.map((tag) => `\`@${tag}\``).join(', ')}.`
                    },
                    // a tag in the middle of a line is still a tag to TypeScript, but not to this plugin, which reads
                    // it as text: only `@docs-private` closing a one-line comment hides a declaration and loses nothing
                    {
                        comment: 'JsdocBlock[description=/@docs(?!-private\\s*$)/]',
                        message:
                            'Write `@docs-private` exactly, at the end of a one-line comment or on a line of its own: the text after it is lost.'
                    },
                    // an example without a fence is taken as TypeScript, and one without a language is not
                    // highlighted at all
                    {
                        comment:
                            'JsdocBlock:has(JsdocTag[tag="example"]:not([description=/^```[a-z]+\\n[\\s\\S]*\\n```$/]))',
                        message:
                            'Write an `@example` as one block of code with its language (```ts, ```html) and explain it in the description.'
                    },
                    // the docs show a deprecation as a badge followed by its reason; a one-line block reads the first
                    // word of the reason as a name
                    {
                        comment:
                            'JsdocBlock:has(JsdocTag[tag="deprecated"]:not([description=/\\S/]):not([name=/\\S/]))',
                        message: 'Say after `@deprecated` why, and what to use instead.'
                    },
                    // the signature shows the default of a parameter, and the docs drop one written into the tag;
                    // `no-defaults` would catch it, but its fix deletes the value
                    {
                        comment: 'JsdocBlock:has(JsdocTag[tag="param"][name=/=/])',
                        message:
                            'Leave the default of a parameter to the signature: the docs do not show `[name=value]`.'
                    },
                    // the published typings carry JSDoc, but not a `//` comment, so a note for the maintainers in
                    // JSDoc reaches every consumer's editor. The code of an example is the consumer's own; a one-line
                    // block reads the first word after a tag as a name
                    {
                        comment:
                            'JsdocBlock[description=/\\b(TODO|FIXME)\\b/], JsdocBlock:has(JsdocTag:not([tag="example"])[description=/\\b(TODO|FIXME)\\b/]), JsdocBlock:has(JsdocTag:not([tag="example"])[name=/\\b(TODO|FIXME)\\b/])',
                        message: 'Write a TODO or a FIXME as a `//` comment by the code it is about, not in JSDoc.'
                    },
                    // `multiline-blocks` moves the text of a block off its last line, but not a tag such as
                    // `@docs-private`, which then hides at the end of the line instead of standing out
                    {
                        comment: 'JsdocBlock[delimiterLineBreak="\\n"][preterminalLineBreak=""]',
                        message: 'Close a block of several lines with `*/` on a line of its own.'
                    },
                    // the text after `@docs-private` or `@internal` belongs to the tag, not to the description;
                    // a one-line block reads the first word after a tag as a name
                    {
                        comment: `JsdocBlock:has(JsdocTag[tag=${hidingJsDocTag}]:matches([description=/\\S/], [name=/\\S/]))`,
                        message:
                            'Put `@docs-private` and `@internal` after the text: the text after them belongs to the tag.'
                    }
                ]
            }
        ],
        // a rule of its own rather than an entry above: `no-restricted-syntax` takes the first entry whose comment
        // matches a block and only then checks its context, so an entry with a context would swallow the ones after it
        'jsdoc/forbid-hiding-tag-on-private-member': 1,
        // `/*` with a tag in it: meant as JSDoc, but TypeScript does not read it
        'jsdoc/no-bad-blocks': 1,
        // an empty block documents nothing, so the fix removes it
        'jsdoc/no-blank-blocks': [1, { enableFixer: true }],
        // a `@param` naming no parameter documents nothing
        'jsdoc/check-param-names': [1, { checkDestructured: false, disableMissingParamChecks: true }],
        // `@docs-private` closing a one-line comment is meant as a tag; the rule reads a name up to the hyphen
        'jsdoc/escape-inline-tags': [1, { allowedInlineTags: ['docs'] }],
        // their fixes delete text: the text after the tag rather than moving it, and the value of `@default`, which
        // lint-staged would drop on commit. `no-restricted-syntax` checks both instead
        'jsdoc/empty-tags': 0,
        'jsdoc/no-defaults': 0,
        // what has to be documented is up to `check-api-docs`
        'jsdoc/require-jsdoc': 0,
        'jsdoc/require-param': 0,
        'jsdoc/require-returns': 0,
        // takes a line that opens with `*emphasis*` for one with a stray asterisk
        'jsdoc/no-multi-asterisks': 0,
        // the layout every block keeps, for it to read alike: a blank line before a block of several lines, the parts
        // of a tag apart by one space rather than aligned in columns, and the text of a block of several lines off
        // the `/**` and `*/` lines. A block whose text starts on the `/**` line gets fixes from both `multiline-blocks`
        // and `tag-lines`, which collide, so `--fix` leaves it as it is: move that text by hand
        'jsdoc/lines-before-block': 1,
        'jsdoc/check-line-alignment': 1,
        'jsdoc/multiline-blocks': 1,
        // a blank line between the description and the tags, and `@docs-private` and `@internal` last, a blank line
        // apart from the tags the docs show: a hidden declaration is seen at a glance
        'jsdoc/tag-lines': [1, 'any', { startLines: 1 }],
        'jsdoc/sort-tags': [1, { tagSequence: [{ tags: shownJsDocTags }, { tags: hidingJsDocTags }], linesBetween: 1 }]
    }
});
