import { logging } from '@angular-devkit/core';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import {
    MigrateOutsideFiles,
    ReplacementMigration,
    ReplacementMigrationOptions,
    applyReplacements,
    compileReplacements,
    dedupeImportSpecifiers,
    ensureImport,
    removeImport,
    replacementMigrationRule
} from './replacement-driver';

const LABEL = '[example-upgrade]';

const MIGRATION: ReplacementMigration = {
    label: LABEL,
    tsReplacements: [
        {
            from: '\\boldCall\\(',
            to: 'newCall(',
            ensureImport: { symbol: 'newCall', from: 'new-lib' },
            removeImport: { symbol: 'oldCall', from: 'old-lib' }
        }
    ],
    templateReplacements: [{ from: '<(/?)old-tag\\b', to: '<$1new-tag' }],
    scssReplacements: [{ from: '\\.old-class\\b', to: '.new-class' }],
    warnPatterns: [
        { pattern: '\\bmanualOnly\\b', message: 'manualOnly needs a hand.' },
        { anchor: '\\bOldThing\\b', pattern: '\\.value\\b', message: 'OldThing.value is gone.' }
    ]
};

/** Runs the rule straight on `tree` and returns what it logged. */
async function run(
    tree: Tree,
    options: ReplacementMigrationOptions = { fix: true },
    migrateOutsideFiles?: MigrateOutsideFiles
): Promise<string> {
    const logger = new logging.Logger('replacement-driver');
    const messages: string[] = [];

    logger.subscribe(({ message }) => messages.push(message));

    await replacementMigrationRule(
        MIGRATION,
        options,
        migrateOutsideFiles
    )(tree, {
        logger
    } as unknown as SchematicContext);

    return messages.join('\n');
}

describe('applyReplacements', () => {
    it('applies the replacements in order, each to the output of the previous one', () => {
        const replacements = compileReplacements([
            { from: 'a(b)', to: '$1c' },
            { from: 'bc', to: 'd' }
        ]);

        expect(applyReplacements('ab-ab', replacements)).toEqual({
            content: 'd-d',
            changed: true,
            importsToEnsure: [],
            importsToRemove: []
        });
    });

    it('collects the imports of the replacements that changed the text, and only those', () => {
        const replacements = compileReplacements([
            { from: 'x', to: 'x', ensureImport: { symbol: 'Same', from: 'm' } },
            { from: 'y', to: 'z', ensureImport: { symbol: 'Z', from: 'm' }, removeImport: { symbol: 'Y', from: 'm' } },
            { from: 'missing', to: '', removeImport: { symbol: 'Missing', from: 'm' } }
        ]);

        expect(applyReplacements('x y', replacements)).toEqual({
            content: 'x z',
            changed: true,
            importsToEnsure: [{ symbol: 'Z', from: 'm' }],
            importsToRemove: [{ symbol: 'Y', from: 'm' }]
        });
        expect(applyReplacements('x', replacements).changed).toBe(false);
    });

    it('reuses a compiled replacement from the start of every text', () => {
        const replacements = compileReplacements([{ from: 'old', to: 'new' }]);

        expect(applyReplacements('old old old', replacements).content).toBe('new new new');
        expect(applyReplacements('old', replacements).content).toBe('new');
        expect(replacements[0].from.lastIndex).toBe(0);
    });

    it('skips a replacement while the text matches its `unless`', () => {
        const replacements = compileReplacements([
            { from: 'a', to: 'b' },
            { from: 'c', to: '', unless: 'b\\(', removeImport: { symbol: 'C', from: 'm' } }
        ]);

        expect(applyReplacements('[c] a(', replacements)).toMatchObject({ content: '[c] b(', importsToRemove: [] });
        expect(applyReplacements('[c] a', replacements)).toMatchObject({
            content: '[] b',
            importsToRemove: [{ symbol: 'C', from: 'm' }]
        });
    });
});

describe('dedupeImportSpecifiers', () => {
    it('keeps the first of the specifiers a clause repeats, with the layout of the clause', () => {
        expect(
            dedupeImportSpecifiers(
                [
                    "import { A, B, A } from 'm';",
                    'import {',
                    '    C,',
                    '    C,',
                    '    D',
                    "} from 'm';",
                    "export { E as F, E as F } from 'm';",
                    ''
                ].join('\n')
            )
        ).toBe(
            [
                "import { A, B } from 'm';",
                'import {',
                '    C,',
                '    D',
                "} from 'm';",
                "export { E as F } from 'm';",
                ''
            ].join('\n')
        );
    });

    it('keeps a value specifier over a type-only one, and an import under another name', () => {
        expect(dedupeImportSpecifiers("import { type A, B, A, A as C } from 'm';\n")).toBe(
            "import { B, A, A as C } from 'm';\n"
        );
        expect(dedupeImportSpecifiers("import type { A, A } from 'm';\n")).toBe("import type { A } from 'm';\n");
    });

    it('leaves a clause that also stands in `original` alone', () => {
        const content = "import { A, A } from 'm';\nimport { B, B } from 'n';\n";

        expect(dedupeImportSpecifiers(content, "import { A, A } from 'm';\n")).toBe(
            "import { A, A } from 'm';\nimport { B } from 'n';\n"
        );
    });
});

describe('ensureImport', () => {
    it('extends a value import of the module', () => {
        expect(ensureImport("import { A } from 'm';\n", 'S', 'm')).toBe("import { A, S } from 'm';\n");
    });

    it('adds an import line below the leading comments', () => {
        expect(ensureImport('// Header.\n/*\n * Block.\n */\n\nexport const a = 1;\n', 'S', 'm')).toBe(
            "// Header.\n/*\n * Block.\n */\n\nimport { S } from 'm';\nexport const a = 1;\n"
        );
    });

    it('leaves a value import of the name alone, from any module or under an alias', () => {
        for (const content of ["import { S } from 'other';\n", "import { T as S } from 'm';\n"]) {
            expect(ensureImport(content, 'S', 'm')).toBe(content);
        }
    });

    it('turns a type-only import of the symbol into a value import', () => {
        expect(ensureImport("import type { S } from 'm';\nexport const s: S = S.of();\n", 'S', 'm')).toBe(
            "import { S } from 'm';\nexport const s: S = S.of();\n"
        );
        expect(ensureImport("import { A, type S } from 'm';\n", 'S', 'm')).toBe("import { A, S } from 'm';\n");
    });

    it('adds the symbol on a line of its own past a line comment, with the line endings of the file', () => {
        expect(ensureImport("import {\r\n    A // a\r\n} from 'm';\r\n", 'S', 'm')).toBe(
            "import {\r\n    A, // a\r\n    S\r\n} from 'm';\r\n"
        );
    });
});

describe('removeImport', () => {
    it('drops the symbol with one of its commas and keeps the layout of the clause', () => {
        expect(
            removeImport(
                ["import { A, S, B } from 'm';", 'import {', '    C,', '    S,', '    D', "} from 'm';", ''].join('\n'),
                'S',
                'm'
            )
        ).toBe(["import { A, B } from 'm';", 'import {', '    C,', '    D', "} from 'm';", ''].join('\n'));
    });

    it('drops the symbol under an alias or with a type modifier, and leaves another symbol aliased to its name', () => {
        expect(removeImport("import { S as Old, A } from 'm';\n", 'S', 'm')).toBe("import { A } from 'm';\n");
        expect(removeImport("import { A, type S } from 'm';\n", 'S', 'm')).toBe("import { A } from 'm';\n");
        expect(removeImport("import { A, Other as S } from 'm';\n", 'S', 'm')).toBe(
            "import { A, Other as S } from 'm';\n"
        );
    });

    it('drops an import it empties with its line, but not the blank line after it', () => {
        expect(removeImport("import { A } from 'a';\nimport { S } from 'm';\n\nexport const a = A;\n", 'S', 'm')).toBe(
            "import { A } from 'a';\n\nexport const a = A;\n"
        );
        expect(
            removeImport(
                "import { A } from 'a';\r\nimport type { S } from 'm';\r\n\r\nexport const a = A;\r\n",
                'S',
                'm'
            )
        ).toBe("import { A } from 'a';\r\n\r\nexport const a = A;\r\n");
    });

    it('drops the blank lines after an import it empties at the top of the file or below a blank line', () => {
        expect(removeImport("import { S } from 'm';\n\nexport const a = 1;\n", 'S', 'm')).toBe('export const a = 1;\n');
        expect(removeImport("// Header.\n\nimport { S } from 'm';\n\nexport const a = 1;\n", 'S', 'm')).toBe(
            '// Header.\n\nexport const a = 1;\n'
        );
    });

    it('keeps the indentation of the line after an import it empties', () => {
        expect(removeImport("    import { S } from 'm';\n    export const a = 1;\n", 'S', 'm')).toBe(
            '    export const a = 1;\n'
        );
    });

    it('drops a re-export the rewrites emptied and leaves the others to them', () => {
        expect(removeImport("export {  } from 'm';\nexport { S } from 'm';\n", 'S', 'm')).toBe(
            "export { S } from 'm';\n"
        );
    });

    it('leaves the imports of other modules alone and is idempotent', () => {
        const content = "import { S } from 'other';\nimport { S as T, A } from 'm';\n";
        const once = removeImport(content, 'S', 'm');

        expect(once).toBe("import { S } from 'other';\nimport { A } from 'm';\n");
        expect(removeImport(once, 'S', 'm')).toBe(once);
    });
});

describe('replacementMigrationRule', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = Tree.empty();
    });

    it('rewrites each kind of file with its own replacements and fixes the imports of a .ts file', async () => {
        tree.create(
            '/src/app.ts',
            [
                "import { Component } from '@angular/core';",
                "import { oldCall } from 'old-lib';",
                '',
                'export const value = oldCall();',
                "export const template = '<old-tag></old-tag>';",
                ''
            ].join('\n')
        );
        tree.create('/src/app.html', '<old-tag>{{ oldCall() }}</old-tag>\n');
        tree.create('/src/app.scss', '.old-class { color: red; }\n');
        tree.create('/src/theme.css', '.old-class { color: red; }\n');
        tree.create('/src/notes.md', '<old-tag></old-tag>\n');

        const log = await run(tree);

        expect(tree.readText('/src/app.ts')).toBe(
            [
                "import { newCall } from 'new-lib';",
                "import { Component } from '@angular/core';",
                '',
                'export const value = newCall();',
                "export const template = '<new-tag></new-tag>';",
                ''
            ].join('\n')
        );
        expect(tree.readText('/src/app.html')).toBe('<new-tag>{{ oldCall() }}</new-tag>\n');
        expect(tree.readText('/src/app.scss')).toBe('.new-class { color: red; }\n');
        expect(tree.readText('/src/theme.css')).toBe('.new-class { color: red; }\n');
        expect(tree.readText('/src/notes.md')).toBe('<old-tag></old-tag>\n');
        expect(log).toContain(`${LABEL} processed tree under "<workspace root>", updated 4 file(s).`);
    });

    it('reports the warn patterns of every file, an anchored one only where the anchor matches', async () => {
        tree.create('/src/thing.ts', 'manualOnly(); const thing: OldThing = get(); thing.value;\n');
        tree.create('/src/form.ts', 'form.value;\n');
        tree.create('/src/app.html', '<p>{{ manualOnly }}</p>\n');

        const log = await run(tree);

        expect(log).toContain(`${LABEL} /src/thing.ts\n  manualOnly needs a hand.`);
        expect(log).toContain(`${LABEL} /src/thing.ts\n  OldThing.value is gone.`);
        expect(log).toContain(`${LABEL} /src/app.html\n  manualOnly needs a hand.`);
        expect(log).not.toContain('/src/form.ts');
        expect(log).toContain(`${LABEL} processed tree under "<workspace root>", updated 0 file(s).`);
    });

    it('logs the files it would update with fix: false, and writes nothing', async () => {
        tree.create('/src/app.html', '<old-tag></old-tag>\n');

        const log = await run(tree, { fix: false });

        expect(tree.readText('/src/app.html')).toBe('<old-tag></old-tag>\n');
        expect(log).toContain(`${LABEL} would update /src/app.html (run with --fix to apply)`);
        expect(log).toContain(`${LABEL} processed tree under "<workspace root>", would update 1 file(s).`);
    });

    it('applies the fix when `fix` is absent, as it is under `ng update`', async () => {
        tree.create('/src/app.html', '<old-tag></old-tag>\n');

        await run(tree, {});

        expect(tree.readText('/src/app.html')).toBe('<new-tag></new-tag>\n');
    });

    it('skips the dependency directories and counts a file migrated outside the walk', async () => {
        tree.create('/src/app.html', '<old-tag></old-tag>\n');
        tree.create('/node_modules/lib/index.html', '<old-tag></old-tag>\n');

        const migrateOutsideFiles = vi.fn<MigrateOutsideFiles>().mockResolvedValue(true);
        const log = await run(tree, { fix: false }, migrateOutsideFiles);

        expect(migrateOutsideFiles).toHaveBeenCalledWith(tree, expect.anything(), false);
        expect(log).not.toContain('node_modules');
        expect(log).toContain(`${LABEL} processed tree under "<workspace root>", would update 2 file(s).`);
    });
});
