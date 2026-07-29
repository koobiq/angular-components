import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

/**
 * Recursively resolves relative (`./`, `../`) TypeScript imports reachable from the given
 * seed files of an example, so that source shared between examples (e.g. a data file kept
 * as a single source of truth) is picked up as part of the example and, from there, shown
 * in the docs source viewer and included in the generated StackBlitz project.
 *
 * Returned paths are relative to the example's own package directory, matching the format
 * already used for `templateUrl`/`styleUrls` entries, and may contain `../` segments when
 * the resolved file lives outside the example's own directory.
 */
export function resolveLocalImportFiles(baseDir: string, packagePath: string, seedFiles: string[]): string[] {
    const exampleDir = path.join(baseDir, packagePath);
    const visited = new Set<string>(seedFiles.map((file) => path.resolve(exampleDir, file)));
    const queue = [...visited];
    const found: string[] = [];

    while (queue.length) {
        const absoluteFile = queue.shift()!;

        if (!absoluteFile.endsWith('.ts') || !fs.existsSync(absoluteFile)) {
            continue;
        }

        const content = fs.readFileSync(absoluteFile, 'utf-8');
        const sourceFile = ts.createSourceFile(absoluteFile, content, ts.ScriptTarget.Latest, false);

        for (const specifier of collectRelativeImportSpecifiers(sourceFile)) {
            const resolved = resolveImportSpecifier(path.dirname(absoluteFile), specifier);

            if (!resolved || visited.has(resolved)) {
                continue;
            }

            visited.add(resolved);
            queue.push(resolved);
            found.push(path.relative(exampleDir, resolved).replace(/\\/g, '/'));
        }
    }

    return found;
}

/** Collects the text of every relative `import`/`export ... from` module specifier in the file. */
function collectRelativeImportSpecifiers(sourceFile: ts.SourceFile): string[] {
    const specifiers: string[] = [];

    const visit = (node: ts.Node): void => {
        if (
            (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            node.moduleSpecifier.text.startsWith('.')
        ) {
            specifiers.push(node.moduleSpecifier.text);
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return specifiers;
}

/** Resolves a relative import specifier to an absolute `.ts` file on disk, if one exists. */
function resolveImportSpecifier(fromDir: string, specifier: string): string | undefined {
    const resolved = path.resolve(fromDir, specifier);
    const candidates = [resolved, `${resolved}.ts`, path.join(resolved, 'index.ts')];

    return candidates.find((candidate) => candidate.endsWith('.ts') && fs.existsSync(candidate));
}
