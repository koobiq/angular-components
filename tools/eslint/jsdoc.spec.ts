import { ESLint, Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { publishedJsDocConfig } from './jsdoc';

const overrideConfig: Linter.Config[] = [{ languageOptions: { parser: tseslint.parser } }, publishedJsDocConfig];
const filePath = 'packages/components/probe/probe.ts';
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig });
// lint-staged runs `eslint --fix` on every commit, so a fix that drops text loses it without anyone seeing
const fixingEslint = new ESLint({ overrideConfigFile: true, overrideConfig, fix: true });

/**
 * Messages of the checks the config adds through `jsdoc/no-restricted-syntax` and a `forbid-*` rule of its own, which
 * read the AST of a comment: a change of that AST in a plugin update turns them off without an error, so each one is
 * pinned here.
 */
const restrictedSyntax = async (code: string, path = filePath): Promise<string[]> => {
    const [result] = await eslint.lintText(code, { filePath: path });

    return result.messages
        .filter(({ ruleId }) => ruleId === 'jsdoc/no-restricted-syntax' || ruleId?.startsWith('jsdoc/forbid-'))
        .map(({ message }) => message);
};

describe('publishedJsDocConfig', () => {
    it('checks the date adapters and the experimental package too', async () => {
        const code = '/**\n * Text.\n *\n * @see Other\n */\nexport const a = 1;';

        for (const path of [
            'packages/components-experimental/probe/probe.ts',
            'packages/angular-luxon-adapter/adapter/probe.ts',
            'packages/angular-moment-adapter/adapter/probe.ts'
        ]) {
            expect(await restrictedSyntax(code, path)).toEqual([
                expect.stringContaining('The docs do not show `@see`')
            ]);
        }
    });

    it('reports a default written into `@param`', async () => {
        const code =
            '/**\n * Reads it.\n *\n * @param [value=1] The value.\n */\nexport function read(value = 1): number {\n    return value;\n}';

        expect(await restrictedSyntax(code)).toEqual([expect.stringContaining('Leave the default of a parameter')]);
    });

    it('reports text after `@docs-private` and `@internal`', async () => {
        const code =
            '/** @docs-private Some text. */\nexport const a = 1;\n\n/**\n * @internal\n * More text.\n */\nexport const b = 1;';

        expect(await restrictedSyntax(code)).toEqual([
            expect.stringContaining('Put `@docs-private` and `@internal` after the text'),
            expect.stringContaining('Put `@docs-private` and `@internal` after the text')
        ]);
    });

    it('keeps every text through `--fix`', async () => {
        const code = [
            '/** @docs-private Some text. */',
            'export const a = 1;',
            '',
            '/**',
            ' * @internal',
            ' * More text.',
            ' */',
            'export const b = 1;',
            '',
            'export class C {',
            '    /**',
            '     * Scroll strategy.',
            '     *',
            '     * @default `RepositionScrollStrategy`',
            '     */',
            '    strategy?: () => number = () => 1;',
            '}'
        ].join('\n');
        const [{ output = code }] = await fixingEslint.lintText(code, { filePath });

        for (const text of ['Some text.', 'More text.', 'Scroll strategy.', 'RepositionScrollStrategy']) {
            expect(output).toContain(text);
        }
    });

    it('accepts the tags the docs read', async () => {
        const code = [
            '/**',
            ' * Text.',
            ' *',
            ' * @deprecated Use `next` instead.',
            ' * @param value The value.',
            ' * @returns The value.',
            ' * @example',
            ' * ```ts',
            ' * // TODO: handle the value',
            ' * read(1);',
            ' * ```',
            ' *',
            ' * @docs-private',
            ' */',
            'export function read(value: number): number {',
            '    return value;',
            '}',
            '',
            '/** Text. @docs-private */',
            'export const hidden = 1;'
        ].join('\n');

        expect(await restrictedSyntax(code)).toEqual([]);
    });

    it('reports a tag the docs do not read, with a hint for a common one', async () => {
        expect(await restrictedSyntax('/**\n * Text.\n *\n * @since 21.0.0\n */\nexport const a = 1;')).toEqual([
            expect.stringContaining('The docs read only')
        ]);
        expect(await restrictedSyntax('/**\n * Text.\n *\n * @see Other\n */\nexport const a = 1;')).toEqual([
            expect.stringContaining('The docs do not show `@see`')
        ]);
    });

    it('reports `@docs-private` misspelt or followed by text in the middle of a line', async () => {
        expect(await restrictedSyntax('/** Text. @docs-privte */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Write `@docs-private` exactly')
        ]);
        expect(await restrictedSyntax('/** Text. @docs-private more */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Write `@docs-private` exactly')
        ]);
    });

    it('reports an example that is not one block of code with its language', async () => {
        expect(await restrictedSyntax('/**\n * Text.\n *\n * @example\n * read(1);\n */\nexport const a = 1;')).toEqual(
            [
                expect.stringContaining('Write an `@example`')
            ]
        );
        expect(
            await restrictedSyntax(
                '/**\n * Text.\n *\n * @example\n * ```\n * read(1);\n * ```\n */\nexport const a = 1;'
            )
        ).toEqual([expect.stringContaining('Write an `@example`')]);
    });

    it('reports `@deprecated` without a reason, in a one-line block too', async () => {
        expect(await restrictedSyntax('/**\n * Text.\n *\n * @deprecated\n */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Say after `@deprecated`')
        ]);
        expect(await restrictedSyntax('/** @deprecated */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Say after `@deprecated`')
        ]);
        expect(await restrictedSyntax('/** @deprecated Use b. */\nexport const a = 1;')).toEqual([]);
    });

    it('reports a TODO or a FIXME outside the code of an example', async () => {
        expect(await restrictedSyntax('/**\n * Text.\n *\n * TODO: extract it.\n */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Write a TODO or a FIXME')
        ]);
        expect(await restrictedSyntax('/** Text. FIXME: broken. */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Write a TODO or a FIXME')
        ]);
    });

    it('reports a block of several lines closed on the line of a tag', async () => {
        expect(await restrictedSyntax('/**\n * Text.\n *\n * @docs-private */\nexport const a = 1;')).toEqual([
            expect.stringContaining('Close a block of several lines')
        ]);
    });

    it('reports `@docs-private` and `@internal` on a private member only', async () => {
        const code = [
            'export class A {',
            '    /** Text. @docs-private */',
            '    private a = 1;',
            '',
            '    /** @internal */',
            '    #b = 1;',
            '',
            '    /** @docs-private */',
            '    protected c = this.#b;',
            '}'
        ].join('\n');

        expect(await restrictedSyntax(code)).toEqual([
            expect.stringContaining('A private member is not in the docs anyway'),
            expect.stringContaining('A private member is not in the docs anyway')
        ]);
    });
});
