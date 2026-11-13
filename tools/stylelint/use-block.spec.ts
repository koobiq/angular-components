import postcssScss from 'postcss-scss';
import stylelint from 'stylelint';
import plugin from './use-block.mjs';

const ruleName = 'koobiq/use-block';

const lint = async (code: string, fix = false) => {
    const {
        results: [result],
        code: output
    } = await stylelint.lint({
        code,
        fix,
        config: { plugins: [plugin], customSyntax: postcssScss, rules: { [ruleName]: true } }
    });

    return { texts: result!.warnings.map(({ text }) => text), output };
};

describe(ruleName, () => {
    it('accepts one block at the top, after comments', async () => {
        expect(
            (await lint(`// Header\n@use 'sass:map';\n@use './a';\n@forward './b';\n\n.a { width: 1px; }\n`)).texts
        ).toEqual([]);
    });

    it('reports an empty line inside the block and removes it on fix', async () => {
        const code = `@use 'sass:map';\n\n@use './a';\n\n.a { width: 1px; }\n`;

        expect((await lint(code)).texts).toEqual([expect.stringContaining('no empty line')]);
        expect((await lint(code, true)).output).toBe(`@use 'sass:map';\n@use './a';\n\n.a { width: 1px; }\n`);
    });

    it('accepts a variable before the block, which a `with` clause can pass', async () => {
        expect((await lint(`$z: 2000;\n@use './a' with ($z: $z);\n@use './b';\n`)).texts).toEqual([]);
    });

    it('reports a statement that comes after the rest of the file', async () => {
        expect((await lint(`.a { width: 1px; }\n@use './a';\n`)).texts).toEqual([
            expect.stringContaining('before any other')
        ]);
    });
});
