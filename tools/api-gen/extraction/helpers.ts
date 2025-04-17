import fs from 'fs';
import { relative } from 'path';
import ts from 'typescript';
import { isPublic } from '../manifest/helpers';
import { ClassEntry, DocEntry } from '../rendering/entities';
import { isClassEntry } from '../rendering/entities/categorization';
import { ClassEntryMetadata, PackageMetadata } from '../types';

/**
 * Updates the entries in the documentation with additional information based on class metadata.
 *
 * For each class entry, adds information about its base class,
 * filters member metadata, adds service status, and base class.
 * Returns an updated array of documentation entries with enriched class information.
 */
export function updateEntries(entries: DocEntry[], classMetadata: Record<string, ClassEntryMetadata>): DocEntry[] {
    return entries.reduce((res: DocEntry[], entry: DocEntry, _, arr) => {
        if (!isClassEntry(entry)) {
            res.push(entry);
        }

        // base class will be added to entry info if it isn't marked as docs-private and placed in scope of package
        const baseClassEntry =
            classMetadata[entry.name]?.baseClass &&
            arr.find((curEntry) => curEntry.name === classMetadata[entry.name]?.baseClass);

        res.push({
            ...entry,
            members: (entry as ClassEntry).members,
            isService: classMetadata[entry.name]?.decorators?.includes('Injectable'),
            extendedDoc: !!baseClassEntry &&
                isPublic(baseClassEntry) && {
                    name: classMetadata[entry.name].baseClass
                }
        } as ClassEntry);

        return res;
    }, []);
}

/**
 * Handles the entry point for processing a TypeScript file.
 * Reads the content of the file at the specified source path.
 * Creates a TypeScript source file object for further analysis.
 * Initializes an empty dictionary to store class entry metadata information.
 */
export function entryHandler(entrySrc: string) {
    const fileContent = fs.readFileSync(entrySrc, 'utf8');
    const sourceFile = ts.createSourceFile(entrySrc, fileContent, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
    const nodeInfo: Record<string, ClassEntryMetadata> = {};
    sourceFile.forEachChild((node) => {
        if (!node || !ts.isClassDeclaration(node)) {
            return;
        }

        let baseClass: string | null = null;
        if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
                if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
                    if (clause.types.length != 1) {
                        console.warn(`error parsing extends expression "${clause.getText()}"`);
                    } else {
                        baseClass = ts.idText(clause.types[0].expression as ts.Identifier);
                    }
                }
            }
        }

        const decorators = ts.getDecorators(node);
        const entityName = node.name && ts.idText(node.name);

        const expressions = (decorators || [])
            .filter(
                (decorator: any) =>
                    decorator.expression &&
                    ts.isCallExpression(decorator.expression) &&
                    ts.isIdentifier((decorator.expression as ts.CallExpression).expression)
            )
            .map(({ expression }: ts.Decorator) =>
                ts.idText((expression as ts.CallExpression).expression as ts.Identifier)
            );

        if (entityName && expressions.length) {
            nodeInfo[entityName] = { decorators: expressions, baseClass };
        }
    });

    return nodeInfo;
}

/** Merge paths for ts-compiler */
export function prepareMergedMetadata(modules: { [moduleName: string]: PackageMetadata[] }): {
    rootNames: string[];
    paths: ts.MapLike<string[]>;
} {
    const paths: { [key: string]: any } = {};
    const rootNames: string[] = [];

    for (const packages of Object.values(modules)) {
        packages.forEach(({ tsCompilerPath, resolvedPath }) => {
            // Update paths object with entry point path mapping to index path
            paths![tsCompilerPath] = [resolvedPath];

            rootNames.push(resolvedPath);
        });
    }

    // Set a default path mapping for all modules
    paths!['*'] = [relative('packages', 'external/npm/node_modules/*')];

    return { paths, rootNames };
}
