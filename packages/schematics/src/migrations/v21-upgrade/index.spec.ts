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

    it('reports instead of writing with fix: false', async () => {
        const source =
            "import { KbqFilterBarRefresher } from '@koobiq/components/filter-bar';\nexport const r = KbqFilterBarRefresher;\n";
        const run = await runV21Upgrade({ 'dry.ts': source }, { fix: false });

        expect(run.read('dry.ts')).toBe(source);
    });
});
