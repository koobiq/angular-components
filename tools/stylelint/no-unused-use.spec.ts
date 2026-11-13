import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import postcssScss from 'postcss-scss';
import stylelint from 'stylelint';
import plugin from './no-unused-use.mjs';

const ruleName = 'koobiq/no-unused-use';

describe(ruleName, () => {
    let directory: string;

    const lint = async (code: string, fix = false) => {
        const {
            results: [result],
            code: output
        } = await stylelint.lint({
            code,
            fix,
            codeFilename: join(directory, 'file.scss'),
            config: { plugins: [plugin], customSyntax: postcssScss, rules: { [ruleName]: true } }
        });

        return { texts: result!.warnings.map(({ text }) => text), output };
    };

    beforeAll(() => {
        directory = mkdtempSync(join(tmpdir(), 'no-unused-use-'));
        writeFileSync(join(directory, '_members.scss'), '$size: 1px;\n@mixin box { width: $size; }\n');
        writeFileSync(join(directory, '_styles.scss'), '.a { width: 1px; }\n');
        writeFileSync(join(directory, '_configurable.scss'), '$size: 1px !default;\n');
        writeFileSync(join(directory, '_placeholders.scss'), '%box { width: 1px; }\n');
    });

    afterAll(() => rmSync(directory, { recursive: true }));

    it('reports a module whose members are never read and that emits no CSS', async () => {
        expect((await lint(`@use './members';\n.a { width: 1px; }\n`)).texts).toEqual([
            expect.stringContaining('"members"')
        ]);
    });

    it('reports an unused built-in module', async () => {
        expect((await lint(`@use 'sass:map';\n.a { width: 1px; }\n`)).texts).toHaveLength(1);
    });

    it('takes the namespace from `as`', async () => {
        expect((await lint(`@use './members' as m;\n.a { @include m.box; }\n`)).texts).toEqual([]);
        expect((await lint(`@use './members' as m;\n.a { @include members.box; }\n`)).texts).toHaveLength(1);
    });

    it('accepts a read variable, function and mixin', async () => {
        const variable = `@use './members';\n.a { width: members.$size; }\n`;
        const fn = `@use 'sass:map';\n.a { width: map.get((a: 1), a); }\n`;
        const mixin = `@use './members';\n.a { @include members.box; }\n`;

        expect((await lint(variable)).texts).toEqual([]);
        expect((await lint(fn)).texts).toEqual([]);
        expect((await lint(mixin)).texts).toEqual([]);
    });

    it('does not take a comment for a read', async () => {
        const code = `@use './members';\n// members.$size\n/* members.$size */\n.a { width: 1px; }\n`;

        expect((await lint(code)).texts).toHaveLength(1);
    });

    it('keeps a module loaded for the CSS it emits', async () => {
        expect((await lint(`@use './styles';\n`)).texts).toEqual([]);
    });

    it('keeps a module that does not load from here', async () => {
        expect((await lint(`@use './not-built-yet';\n`)).texts).toEqual([]);
    });

    it('keeps a module loaded for its configuration', async () => {
        expect((await lint(`@use './configurable' with ($size: 2px);\n.a { width: 1px; }\n`)).texts).toEqual([]);
    });

    it('takes a read inside a `with` clause for a read', async () => {
        const code = `@use './members';\n@use './configurable' with ($size: members.$size);\n.a { width: 1px; }\n`;

        expect((await lint(code)).texts).toEqual([]);
    });

    it('keeps a module whose placeholder the file extends', async () => {
        expect((await lint(`@use './placeholders';\n.a { @extend %box; }\n`)).texts).toEqual([]);
        expect((await lint(`@use './placeholders';\n.a { width: 1px; }\n`)).texts).toHaveLength(1);
    });

    it('leaves `as *` to scss/at-use-no-unnamespaced', async () => {
        expect((await lint(`@use './members' as *;\n.a { width: 1px; }\n`)).texts).toEqual([]);
    });

    it('removes the statement on fix', async () => {
        expect((await lint(`@use './members';\n.a { width: 1px; }\n`, true)).output).toBe(`.a { width: 1px; }\n`);
    });
});
