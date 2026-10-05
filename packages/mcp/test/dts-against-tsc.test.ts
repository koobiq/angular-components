import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import ts from 'typescript';
import { parseDts } from '../src/dts/parse-dts.ts';
import { resolveProject } from '../src/sources/project.ts';
import { CONSUMER } from './project.ts';

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

const files = ((): { id: string; source: string }[] => {
    const pkg = resolveProject(CONSUMER).packages.get('@koobiq/components');

    if (!pkg) return [];

    return readdirSync(pkg.root, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => ({ id: entry.name, path: join(pkg.root, entry.name, 'index.d.ts') }))
        .filter((entry) => existsSync(entry.path))
        .map((entry) => ({ id: entry.id, source: readFileSync(entry.path, 'utf-8') }))
        .sort((a, b) => a.id.localeCompare(b.id));
})();

test('the installed package was found, so the rest of this file means something', () => {
    assert.ok(files.length >= 50, `only ${files.length} entry points read from ${CONSUMER}`);
});

test('every declaration in the installed package agrees with the TypeScript compiler', () => {
    let checked = 0;

    for (const { id, source } of files) {
        const expected = viaCompiler(source);
        const actual = parseDts(source).symbols;

        for (const [name, declared] of expected) {
            const mine = actual.get(name);

            assert.ok(mine, `${id}: ${name} was not found at all`);
            assert.equal(mine.selector ?? null, declared.selector, `${id}: ${name} selector`);

            assert.deepEqual(
                new Map(mine.inputs.map((input) => [input.name, input.alias])),
                declared.inputs,
                `${id}: ${name} inputs`
            );

            assert.deepEqual(
                new Map(mine.outputs.map((output) => [output.name, output.alias])),
                declared.outputs,
                `${id}: ${name} outputs`
            );

            checked++;
        }
    }

    // Guards against the whole thing passing because nothing was read.
    assert.ok(checked > 250, `only ${checked} declarations compared`);
});
