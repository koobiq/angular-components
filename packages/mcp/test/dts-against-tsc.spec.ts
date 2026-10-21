import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { parseDts } from '../src/dts/parse-dts';
import { listEntryPointTypings } from '../src/sources/components';
import { resolveProject } from '../src/sources/project';
import { componentsAvailable, CONSUMER } from './project';

/**
 * Holds the hand-written `.d.ts` reader to what the TypeScript compiler reads from the same files.
 *
 * `src/dts/parse-dts.ts` scans lines instead of building an AST, because `typescript` is ~22 MB and
 * this server is run through `npx`. That trade is only defensible while the shortcut agrees with
 * the real parser, so the compiler is a devDependency of this repository and this test is the agreement.
 *
 * It runs over every entry point of whatever `@koobiq/components` is installed in the sibling
 * Angular project — about a thousand declarations — rather than over fixtures, so a change in how
 * Angular emits its metadata fails here instead of in an answer.
 */

type Declared = {
    selector: string | null;
    /** Property name → template alias. */
    inputs: Map<string, string>;
    outputs: Map<string, string>;
};

const literalText = (node: ts.TypeNode | undefined): string | null =>
    node && ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal) ? node.literal.text : null;

/** `{ "prop": { "alias": "x"; … } }` and the older `{ "prop": "x" }`. */
const readMap = (node: ts.TypeNode | undefined): Map<string, string> => {
    const map = new Map<string, string>();

    if (!node || !ts.isTypeLiteralNode(node)) return map;

    for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;

        const key = ts.isStringLiteral(member.name) ? member.name.text : member.name.getText();
        const value = member.type;

        if (!value) continue;

        const plain = literalText(value);

        if (plain !== null) {
            map.set(key, plain);
            continue;
        }

        if (!ts.isTypeLiteralNode(value)) continue;

        const alias = value.members.find(
            (field) =>
                ts.isPropertySignature(field) &&
                field.name &&
                (ts.isStringLiteral(field.name) ? field.name.text : field.name.getText()) === 'alias'
        );

        map.set(key, (alias && ts.isPropertySignature(alias) && literalText(alias.type)) || key);
    }

    return map;
};

const viaCompiler = (source: string): Map<string, Declared> => {
    const file = ts.createSourceFile('entry.d.ts', source, ts.ScriptTarget.Latest, true);
    const found = new Map<string, Declared>();

    const visit = (node: ts.Node): void => {
        if (ts.isClassDeclaration(node) && node.name) {
            for (const member of node.members) {
                if (!ts.isPropertyDeclaration(member) || !member.name) continue;

                const name = member.name.getText();

                if (name !== 'ɵcmp' && name !== 'ɵdir') continue;
                if (!member.type || !ts.isTypeReferenceNode(member.type)) continue;

                const args = member.type.typeArguments ?? [];

                found.set(node.name.text, {
                    selector: literalText(args[1]),
                    inputs: readMap(args[3]),
                    outputs: readMap(args[4])
                });
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(file);

    return found;
};

/** Every declaration `viaCompiler` finds in `source` must agree with what `parseDts` reads there. */
const assertAgrees = (id: string, source: string): number => {
    const expected = viaCompiler(source);
    const actual = parseDts(source).symbols;

    for (const [name, declared] of expected) {
        const mine = actual.get(name);

        expect(mine, `${id}: ${name} was not found at all`).toBeTruthy();
        expect(mine!.selector ?? null, `${id}: ${name} selector`).toBe(declared.selector);

        expect(new Map(mine!.inputs.map((input) => [input.name, input.alias])), `${id}: ${name} inputs`).toEqual(
            declared.inputs
        );

        expect(new Map(mine!.outputs.map((output) => [output.name, output.alias])), `${id}: ${name} outputs`).toEqual(
            declared.outputs
        );
    }

    return expected.size;
};

/**
 * An entry point's own text, followed through its `export * from`/`export { … } from` chain and
 * concatenated — 19.x publishes an entry point as `index.d.ts` re-exporting a sibling for every
 * declaration in it, so the file `exports` names is an empty shell and `viaCompiler` would compare
 * against nothing. Concatenating puts every declaration the chain reaches in front of both
 * `viaCompiler` and `parseDts`, the same declarations `readEntryFile` merges when the server reads it.
 */
const chainedSource = (entry: string): string => {
    const seen = new Set<string>([entry]);
    const queue = [entry];
    const chunks: string[] = [];

    while (queue.length > 0) {
        const path = queue.shift()!;
        const source = readFileSync(path, 'utf-8');

        chunks.push(source);

        for (const specifier of parseDts(source).reexports) {
            const resolved = ['.d.ts', '/index.d.ts', '.ts']
                .map((suffix) => join(dirname(path), specifier + suffix))
                .find((candidate) => existsSync(candidate));

            if (resolved && !seen.has(resolved)) {
                seen.add(resolved);
                queue.push(resolved);
            }
        }
    }

    return chunks.join('\n');
};

const filesOf = (root: string): { id: string; source: string }[] =>
    [...listEntryPointTypings(root)]
        .filter(([id, path]) => id && existsSync(path))
        .map(([id, path]) => ({ id, source: chainedSource(path) }))
        .sort((a, b) => a.id.localeCompare(b.id));

const files = ((): { id: string; source: string }[] => {
    const pkg = resolveProject(CONSUMER).packages.get('@koobiq/components');

    return pkg ? filesOf(pkg.root) : [];
})();

// `unit:all` sweeps this file in `units.yml` too, which never builds the library — skipped, not
// failed, is the honest report there. `unit:mcp:dts` runs it for real after `build:components`.
describe.skipIf(!componentsAvailable())('the live .d.ts reader against the TypeScript compiler', () => {
    test('the installed package was found, so the rest of this file means something', () => {
        expect(files.length >= 50, `only ${files.length} entry points read from ${CONSUMER}`).toBeTruthy();
    });

    test('every declaration in the installed package agrees with the TypeScript compiler', () => {
        const checked = files.reduce((total, { id, source }) => total + assertAgrees(id, source), 0);

        // Guards against the whole thing passing because nothing was read.
        expect(checked > 250, `only ${checked} declarations compared`).toBeTruthy();
    });
});

/**
 * The same agreement, pinned against the four published layouts rather than against whatever is
 * currently installed — fixtures, not a build, so this runs with no network and no `dist/components`.
 */
describe('the .d.ts reader against the TypeScript compiler, for every supported layout', () => {
    const fixtures = join(import.meta.dirname, 'fixtures', 'packages');

    for (const major of [18, 19, 20, 21] as const) {
        test(`koobiq ${major}`, () => {
            const checked = filesOf(join(fixtures, String(major))).reduce(
                (total, { id, source }) => total + assertAgrees(id, source),
                0
            );

            expect(checked > 0, `no declarations compared for ${major}`).toBeTruthy();
        });
    }
});
