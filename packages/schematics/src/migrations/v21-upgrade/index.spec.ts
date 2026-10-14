import { runV21Upgrade } from './testing';

// The rewrites and warnings of each area are covered by `spec/<area>.spec.ts`.
describe('v21-upgrade', () => {
    it('leaves a file that uses none of the removed APIs alone', async () => {
        const source =
            "import { KbqButtonModule } from '@koobiq/components/button';\nexport const used = KbqButtonModule;\n";
        const run = await runV21Upgrade({ 'plain.ts': source });

        expect(run.read('plain.ts')).toBe(source);
        expect(run.log).not.toContain('[v21-upgrade] /');
    });

    it('leaves the commas of the rest of a file alone when it removes an import specifier', async () => {
        const rest = [
            'const pair = [1, 2];',
            'export const [, second] = pair;',
            'export const values = (m: Record<string, number>) => Object.entries(m).map(([, v]) => v);',
            'export const words = (s: string) => s.split(/[\\s,]+/);',
            'export const separator = /[,;]/;',
            "export const doubled = 'a,,b';",
            'export const options = {',
            '    a: 1,',
            '};',
            'export const list = [',
            '    1,',
            '];',
            ''
        ].join('\n');
        const run = await runV21Upgrade({
            'commas.ts': [
                "import { ThemePalette } from '@koobiq/components/core';",
                'export const color = ThemePalette.Error;',
                rest
            ].join('\n')
        });

        expect(run.read('commas.ts')).toBe(
            [
                "import { KbqComponentColors } from '@koobiq/components/core';",
                'export const color = KbqComponentColors.Error;',
                rest
            ].join('\n')
        );
    });

    it('reports instead of writing with fix: false', async () => {
        const source =
            "import { KbqFilterBarRefresher } from '@koobiq/components/filter-bar';\nexport const r = KbqFilterBarRefresher;\n";
        const run = await runV21Upgrade({ 'dry.ts': source }, { fix: false });

        expect(run.read('dry.ts')).toBe(source);
    });
});
