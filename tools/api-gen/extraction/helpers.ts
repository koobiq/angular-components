import fs from 'fs';
import { relative } from 'path';
import ts from 'typescript';
import { isPublic } from '../manifest/helpers';
import { ClassEntry, DocEntry, MemberEntry, MemberTags, PropertyEntry } from '../rendering/entities';
import { isClassEntry } from '../rendering/entities/categorization';
import { ClassEntryMetadata, HostDirectiveMetadata, PackageMetadata } from '../types';

/** The initializer of an object-literal property, addressed by name. */
function findProperty(object: ts.ObjectLiteralExpression, name: string): ts.Expression | undefined {
    return object.properties.find(
        (property): property is ts.PropertyAssignment =>
            ts.isPropertyAssignment(property) && ts.isIdentifier(property.name) && ts.idText(property.name) === name
    )?.initializer;
}

/** `['checked', 'disabled: isDisabled']` becomes `{ checked: 'checked', disabled: 'isDisabled' }`. */
function readForwardedInputs(node: ts.Expression | undefined): Record<string, string> {
    if (!node || !ts.isArrayLiteralExpression(node)) return {};

    return node.elements.reduce<Record<string, string>>((inputs, element) => {
        if (!ts.isStringLiteral(element)) return inputs;

        const [own, exposedAs] = element.text.split(':').map((part) => part.trim());

        return { ...inputs, [own]: exposedAs || own };
    }, {});
}

/** Reads `hostDirectives` off a `@Component`/`@Directive` decorator. */
function readHostDirectives(node: ts.ClassDeclaration): HostDirectiveMetadata[] {
    const config = (ts.getDecorators(node) ?? [])
        .map(({ expression }) => expression)
        .filter(ts.isCallExpression)
        .flatMap(({ arguments: args }) => [...args])
        .find(ts.isObjectLiteralExpression);
    const declared = config && findProperty(config, 'hostDirectives');

    if (!declared || !ts.isArrayLiteralExpression(declared)) return [];

    return declared.elements.reduce<HostDirectiveMetadata[]>((hostDirectives, element) => {
        // `hostDirectives: [KbqCheckable]` — applied without surfacing anything on the host.
        if (ts.isIdentifier(element)) return [...hostDirectives, { name: ts.idText(element), inputs: {} }];

        if (!ts.isObjectLiteralExpression(element)) return hostDirectives;

        const directive = findProperty(element, 'directive');

        if (!directive || !ts.isIdentifier(directive)) return hostDirectives;

        return [
            ...hostDirectives,
            { name: ts.idText(directive), inputs: readForwardedInputs(findProperty(element, 'inputs')) }
        ];
    }, []);
}

/**
 * Adds the inputs a host directive surfaces on its host to the host's own members.
 *
 * Angular's extractor reports what a class declares, and a forwarded input is declared on the directive —
 * so without this it is documented nowhere, and somebody writing the markup cannot find the input they
 * are expected to write.
 */
function withHostDirectiveInputs(
    entry: DocEntry,
    metadata: ClassEntryMetadata | undefined,
    entriesByName: Record<string, DocEntry>
): MemberEntry[] {
    const members = (entry as ClassEntry).members ?? [];

    if (!metadata?.hostDirectives?.length) return members;

    const forwarded = metadata.hostDirectives.flatMap(({ name, inputs }) =>
        (((entriesByName[name] as ClassEntry | undefined)?.members ?? []) as PropertyEntry[])
            .filter((member) => member.memberTags.includes(MemberTags.Input))
            // Angular matches a forwarded input by its public name, which is the alias when it has one.
            .filter((member) => inputs[member.inputAlias ?? member.name])
            .map((member) => ({ ...member, name: inputs[member.inputAlias ?? member.name] }))
    );

    // An input the host declares itself is the one that gets bound, so it wins.
    return [...members, ...forwarded.filter(({ name }) => !members.some((member) => member.name === name))];
}

/**
 * Updates the entries in the documentation with additional information based on class metadata.
 *
 * For each class entry, adds information about its base class,
 * filters member metadata, adds service status, and base class.
 * Returns an updated array of documentation entries with enriched class information.
 */
export function updateEntries(
    entries: DocEntry[],
    classMetadata: Record<string, ClassEntryMetadata>,
    entriesByName: Record<string, DocEntry> = {}
): DocEntry[] {
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
            members: withHostDirectiveInputs(entry, classMetadata[entry.name], entriesByName),
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
            nodeInfo[entityName] = { decorators: expressions, baseClass, hostDirectives: readHostDirectives(node) };
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
