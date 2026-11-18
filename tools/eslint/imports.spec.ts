import { mkdtempSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ESLint, type Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { importsConfig } from './imports';

const overrideConfig: Linter.Config[] = [{ languageOptions: { parser: tseslint.parser } }, ...importsConfig];
const fixingEslint = new ESLint({ overrideConfigFile: true, overrideConfig, fix: true });
const filePath = 'packages/components/probe/probe.ts';

/** Rules reported on `a.ts`, which extends a class of `b.ts`, while `b.ts` imports `A` as `importOfA` for a type. */
const cycleRules = async (importOfA: string): Promise<Array<string | null>> => {
    // the resolver returns the real path, and on macOS the temporary directory is behind the `/var` symlink
    const cwd = realpathSync(mkdtempSync(join(tmpdir(), 'kbq-imports-')));

    try {
        writeFileSync(join(cwd, 'a.ts'), "import { B } from './b';\n\nexport class A extends B {}\n");
        writeFileSync(join(cwd, 'b.ts'), `${importOfA}\n\nexport class B {\n    a?: A;\n}\n`);

        const eslint = new ESLint({ cwd, overrideConfigFile: true, overrideConfig });
        const [result] = await eslint.lintFiles(['a.ts']);

        return result.messages.map(({ ruleId }) => ruleId);
    } finally {
        rmSync(cwd, { recursive: true, force: true });
    }
};

describe('importsConfig', () => {
    it('sorts imports into one block: `@angular/*`, the other packages, `@koobiq/*`, then the repository', async () => {
        const code = [
            "import { b } from './b';",
            '',
            "import { DocsLocaleState } from 'src/app/services/locale';",
            "import { KbqButton } from '@koobiq/components/button';",
            "import { a } from '../a';",
            "import { e2eEnableDarkTheme } from 'packages/e2e/utils';",
            "import { join } from 'node:path';",
            "import { map } from 'rxjs';",
            "import { Component, inject } from '@angular/core';",
            "import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';",
            '',
            'export const used = [a, b, map, join, inject, Component, KbqButton, setupTestBed];',
            'export const local = [DocsLocaleState, e2eEnableDarkTheme];',
            ''
        ].join('\n');

        const [result] = await fixingEslint.lintText(code, { filePath });

        expect(result.output).toBe(
            [
                "import { join } from 'node:path';",
                "import { Component, inject } from '@angular/core';",
                "import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';",
                "import { map } from 'rxjs';",
                "import { KbqButton } from '@koobiq/components/button';",
                "import { e2eEnableDarkTheme } from 'packages/e2e/utils';",
                "import { DocsLocaleState } from 'src/app/services/locale';",
                "import { a } from '../a';",
                "import { b } from './b';",
                '',
                'export const used = [a, b, map, join, inject, Component, KbqButton, setupTestBed];',
                'export const local = [DocsLocaleState, e2eEnableDarkTheme];',
                ''
            ].join('\n')
        );
    });

    it('adds `type` to the names used as types only, as `import type` when all of them are', async () => {
        const code = [
            "import { Mixed, Value } from './mixed';",
            "import { Shape, Size } from './types';",
            '',
            'export const value = new Value();',
            'export let shape: Shape | Size | Mixed;',
            ''
        ].join('\n');

        const [result] = await fixingEslint.lintText(code, { filePath });

        expect(result.output).toBe(
            [
                "import { type Mixed, Value } from './mixed';",
                "import type { Shape, Size } from './types';",
                '',
                'export const value = new Value();',
                'export let shape: Shape | Size | Mixed;',
                ''
            ].join('\n')
        );
    });

    // TypeScript drops the import from the output, but the rule reads the syntax: a class imported for a type only
    // closes the cycle until the import says `type`, which `consistent-type-imports` adds on `--fix`
    it('reports a cycle closed by an import of a value, even one used as a type only', async () => {
        expect(await cycleRules("import { A } from './a';")).toEqual(['import-x/no-cycle']);
    });

    it.each([
        "import type { A } from './a';",
        "import { type A } from './a';"
    ])('allows a cycle closed by a type import: %s', async (importOfA) => {
        expect(await cycleRules(importOfA)).toEqual([]);
    });
});
