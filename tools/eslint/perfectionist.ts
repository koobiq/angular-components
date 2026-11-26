import type { AST, Rule, SourceCode } from 'eslint';
import { defineConfig } from 'eslint/config';
import perfectionist from 'eslint-plugin-perfectionist';

/** A group of fields told by the initializer or the decorator, a pattern for each. */
type FieldGroup = { name: string; value: string; decorator?: string };

/** The groups of fields `perfectionist/sort-classes` tells by the initializer or the decorator, in their order. */
const fieldGroups: FieldGroup[] = [
    { name: 'inject', value: '^(inject|kbqInject\\w*)\\b' },
    { name: 'input', value: '^(input|model)\\b', decorator: '^Input$' },
    { name: 'output', value: '^(output|outputFromObservable)\\b', decorator: '^Output$' },
    {
        name: 'query',
        value: '^(viewChild|viewChildren|contentChild|contentChildren)\\b',
        decorator: '^(ViewChild|ViewChildren|ContentChild|ContentChildren)$'
    }
];

/** The patterns of `fieldGroups`, compiled once. */
const fieldGroupPatterns = fieldGroups.map(({ name, value, decorator }) => ({
    name,
    value: new RegExp(value),
    decorator: decorator === undefined ? undefined : new RegExp(decorator)
}));

/** The part of a member of a class the groups read. */
type ClassMember = Rule.Node & {
    static?: boolean;
    accessibility?: string;
    key: { type: string };
    value?: Rule.Node | null;
    decorators?: { expression: { type: string; name?: string; callee?: { name?: string } } }[];
};

/** A token or a comment, both with their position. */
type Item = { type: string; loc: AST.SourceLocation; range: AST.Range };

const propertyTypes = new Set(['PropertyDefinition', 'TSAbstractPropertyDefinition']);
const fieldTypes = new Set([...propertyTypes, 'AccessorProperty', 'TSAbstractAccessorProperty']);

/** Angular evaluates the computation on signal read. Its arguments still run during initialization. */
const isLazyComputed = (member: ClassMember, sourceCode: SourceCode): boolean => {
    const call = member.value;

    if (call?.type !== 'CallExpression' || call.arguments.length !== 1) return false;
    const [computation] = call.arguments;

    if (computation?.type !== 'ArrowFunctionExpression' && computation?.type !== 'FunctionExpression') return false;

    const binding = sourceCode.getScope(call).references.find(({ identifier }) => identifier === call.callee)?.resolved
        ?.defs[0];

    return (
        binding?.type === 'ImportBinding' &&
        binding.parent.source.value === '@angular/core' &&
        binding.node.type === 'ImportSpecifier' &&
        binding.node.imported.type === 'Identifier' &&
        binding.node.imported.name === 'computed'
    );
};

const sortClasses = perfectionist.rules!['sort-classes']!;
const safeSortClasses: Rule.RuleModule = {
    ...sortClasses,
    create(context) {
        // A call on the instance can read any field through a method or an override. Sort each side
        // of that initializer independently. A function-valued field runs its body only when called.
        const barriers = new WeakSet<object>();
        const field = ':matches(PropertyDefinition, AccessorProperty)';
        const deferred = ':matches([value.type="ArrowFunctionExpression"], [value.type="FunctionExpression"])';
        const instanceCall = 'CallExpression > .callee:has(:matches(ThisExpression, Super))';
        const sort = sortClasses.create(context)['ClassBody:exit']!;

        return {
            [`${field}:not(${deferred}):has(${instanceCall})`](node: Rule.Node) {
                if (!isLazyComputed(node as ClassMember, context.sourceCode)) barriers.add(node);
            },
            'ClassBody:exit'(node) {
                let start = 0;

                for (const [index, member] of node.body.entries()) {
                    if (!barriers.has(member)) continue;

                    if (index - start > 1) sort({ ...node, body: node.body.slice(start, index) });
                    start = index + 1;
                }

                if (start === 0) sort(node);
                else if (node.body.length - start > 1) sort({ ...node, body: node.body.slice(start) });
            }
        };
    }
};

/**
 * The group `perfectionist/sort-classes` puts a field in, or `null` for a member that is not a field. As there, the
 * custom groups come first and match properties only, not `accessor` fields.
 */
const fieldGroupOf = (member: ClassMember, sourceCode: SourceCode): string | null => {
    const { value } = member;

    if (
        !fieldTypes.has(member.type) ||
        value?.type === 'ArrowFunctionExpression' ||
        value?.type === 'FunctionExpression'
    ) {
        return null;
    }

    if (propertyTypes.has(member.type)) {
        const text = value ? sourceCode.getText(value) : '';
        const decorators = (member.decorators ?? []).map(({ expression }) =>
            expression.type === 'CallExpression' ? expression.callee?.name : expression.name
        );
        const group = fieldGroupPatterns.find(
            ({ value: valuePattern, decorator }) =>
                (value && valuePattern.test(text)) ||
                (decorator !== undefined && decorators.some((name) => name !== undefined && decorator.test(name)))
        );

        if (group) return group.name;
    }

    if (member.static) return 'static';

    return member.accessibility === 'private' || member.key.type === 'PrivateIdentifier' ? 'private' : 'state';
};

/**
 * The empty lines between the fields of one group, which `perfectionist/sort-classes` cannot set: it puts the empty
 * lines between the groups and between the members with a body, while a field gets an empty line before it only when a
 * comment describes it.
 */
const memberSpacing: Rule.RuleModule = {
    meta: {
        type: 'layout',
        fixable: 'whitespace',
        docs: {
            description:
                'Requires an empty line before a field of a class with a comment and disallows one before a field without a comment, within a group of fields.'
        },
        messages: {
            missing: 'Expected an empty line before a field with a comment.',
            extra: 'Unexpected empty line before a field of the same group without a comment.',
            sameLine: 'Expected the field on a line of its own.'
        },
        schema: []
    },
    create(context) {
        const { sourceCode } = context;

        return {
            ClassBody(node: Rule.Node) {
                const members = (node as unknown as { body: ClassMember[] }).body;

                for (const [index, next] of members.entries()) {
                    const previous = members[index - 1];

                    if (!previous) continue;

                    const group = fieldGroupOf(previous, sourceCode);

                    if (group === null || group !== fieldGroupOf(next, sourceCode)) continue;

                    // a semicolon or a comment on the line the previous field ends belongs to that field
                    let end = sourceCode.getLastToken(previous) as Item;
                    const between: Item[] = [];

                    for (const item of sourceCode.getTokensBetween(previous, next, {
                        includeComments: true
                    }) as Item[]) {
                        if (between.length === 0 && item.loc.start.line === end.loc.end.line) {
                            end = item;
                        } else {
                            between.push(item);
                        }
                    }

                    const start = between[0] ?? (sourceCode.getFirstToken(next) as Item);
                    const expected = between.some(({ type }) => type === 'Block' || type === 'Line') ? 1 : 0;

                    const emptyLines = start.loc.start.line - end.loc.end.line - 1;

                    if (emptyLines === expected) continue;

                    context.report({
                        loc: start.loc,
                        messageId: emptyLines < 0 ? 'sameLine' : expected ? 'missing' : 'extra',
                        fix: (fixer) =>
                            fixer.replaceTextRange(
                                [end.range[1], start.range[0]],
                                '\n'.repeat(expected + 1) +
                                    ' '.repeat((emptyLines < 0 ? previous : start).loc!.start.column)
                            )
                    });
                }
            }
        };
    }
};

/**
 * The order of the members of a class, which `eslint --fix` sets: the public API of a component first, then its
 * state, the accessors, the constructor, the lifecycle hooks and the other methods. A field with a function as its
 * value goes with the methods. Within a group the members keep their written order. An empty line separates the
 * groups and the members with a body, and a field with a comment.
 *
 * @see https://perfectionist.dev/rules/sort-classes
 */
export const perfectionistConfig = defineConfig({
    name: 'koobiq/perfectionist',
    files: ['**/*.{ts,cts,mts}'],
    plugins: {
        'kbq-classes': { rules: { 'member-spacing': memberSpacing, 'sort-classes': safeSortClasses } }
    },
    rules: {
        'kbq-classes/sort-classes': [
            1,
            {
                type: 'unsorted',
                newlinesBetween: 1,
                // the fields of a group are spaced by `kbq-classes/member-spacing`
                newlinesInside: 'ignore',
                // An overload with its own JSDoc needs an empty line above it, which `jsdoc/lines-before-block` sets
                newlinesBetweenOverloadSignatures: 'ignore',
                customGroups: [
                    ...fieldGroups.map(({ name, value, decorator }) => ({
                        groupName: name,
                        anyOf: [
                            { selector: 'property', elementValuePattern: value },
                            ...(decorator ? [{ selector: 'property', decoratorNamePattern: decorator }] : [])
                        ]
                    })),
                    {
                        groupName: 'lifecycle',
                        selector: 'method',
                        elementNamePattern:
                            '^ng(OnChanges|OnInit|DoCheck|AfterContentInit|AfterContentChecked|AfterViewInit|AfterViewChecked|OnDestroy)$'
                    }
                ],
                groups: [
                    'index-signature',
                    ['static-property', 'static-accessor-property'],
                    'static-block',
                    ...fieldGroups.map(({ name }) => name),
                    ['private-property', 'private-accessor-property'],
                    ['property', 'accessor-property', 'protected-property', 'protected-accessor-property'],
                    { group: ['get-method', 'set-method'], newlinesInside: 1 },
                    'constructor',
                    { group: 'lifecycle', newlinesInside: 1 },
                    {
                        group: ['method', 'function-property', 'static-method', 'static-function-property'],
                        newlinesInside: 1
                    },
                    'unknown'
                ]
            }
        ],
        'kbq-classes/member-spacing': 1
    }
});
