import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

/**
 * Import of the shared i18n entry point (`packages/docs-examples/i18n`), which the examples
 * reference by alias rather than by a relative path.
 */
const I18N_ENTRY_POINT_IMPORT = '@koobiq/docs-examples/i18n';

/**
 * Recursively resolves the TypeScript imports reachable from the given
 * seed files of an example, so that source shared between examples (e.g. a data file kept
 * as a single source of truth, or the shared i18n entry point) is picked up as part of the
 * example and included in the generated StackBlitz project so it compiles. These files are
 * kept out of the docs source viewer's tabs — see `localImportFiles` in `generate-example-module.ts`.
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

        for (const specifier of collectImportSpecifiers(sourceFile)) {
            const resolved = resolveImportSpecifier(path.dirname(absoluteFile), specifier, baseDir);

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

/** Collects the text of every tracked `import`/`export ... from` module specifier in the file. */
function collectImportSpecifiers(sourceFile: ts.SourceFile): string[] {
    const specifiers: string[] = [];

    const visit = (node: ts.Node): void => {
        if (
            (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier) &&
            (node.moduleSpecifier.text.startsWith('.') || node.moduleSpecifier.text === I18N_ENTRY_POINT_IMPORT)
        ) {
            specifiers.push(node.moduleSpecifier.text);
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    return specifiers;
}

/** Resolves an import specifier to an absolute `.ts` file on disk, if one exists. */
function resolveImportSpecifier(fromDir: string, specifier: string, baseDir: string): string | undefined {
    if (specifier === I18N_ENTRY_POINT_IMPORT) {
        return path.join(baseDir, 'i18n', 'index.ts');
    }

    const resolved = path.resolve(fromDir, specifier);
    const candidates = [resolved, `${resolved}.ts`, path.join(resolved, 'index.ts')];

    return candidates.find((candidate) => candidate.endsWith('.ts') && fs.existsSync(candidate));
}
