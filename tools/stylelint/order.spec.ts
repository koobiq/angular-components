import postcssScss from 'postcss-scss';
import stylelint from 'stylelint';
import orderConfig from './order.mjs';

const lint = async (code: string) => {
    const {
        results: [result],
        code: output
    } = await stylelint.lint({
        code,
        fix: true,
        config: { ...orderConfig, customSyntax: postcssScss },
        configBasedir: import.meta.dirname
    });

    return { texts: result!.warnings.map(({ text }) => text), output };
};

describe('order config', () => {
    it('sorts the declarations of a block into groups on fix', async () => {
        expect((await lint(`.a {\n    color: red;\n    display: block;\n}\n`)).output).toBe(
            `.a {\n    display: block;\n    color: red;\n}\n`
        );
    });

    it('puts the variables first and a mixin call before the declarations, which override it', async () => {
        const { texts, output } = await lint(
            `.a {\n    width: 1px;\n    @include b.c();\n    $h: 2px;\n    height: $h;\n}\n`
        );

        expect(texts).toEqual([]);
        expect(output).toBe(`.a {\n    $h: 2px;\n    @include b.c();\n    width: 1px;\n    height: $h;\n}\n`);
    });

    it('keeps the order of conditions and loops, before the declarations that read what they compute', async () => {
        const code = `@mixin m($r) {\n    $p: a;\n\n    @if $r {\n        $p: b;\n    } @else {\n        $p: c;\n    }\n\n    @each $q in border-radius {\n        #{$q}: $r;\n    }\n\n    color: $p;\n\n    @supports (corner-shape: squircle) {\n        & {\n            corner-shape: squircle;\n        }\n    }\n}\n`;

        expect((await lint(code)).output).toBe(code);
    });
});
