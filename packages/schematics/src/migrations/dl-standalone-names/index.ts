import { Path } from '@angular-devkit/core';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import { dedupeImportSpecifiers, ensureImport, removeImport } from '../../utils/replacement-driver';
import { DL_MODULE, DL_PACKAGE, keptModuleMessage, MODULE_COMPONENTS, RENAMES, SUMMARY } from './data';
import { Schema } from './schema';

const LABEL = '[dl-standalone-names]';
const TS_EXT = '.ts';

/** A text-span edit on the original content. Applied right-to-left so the offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** A named import of the entry point. */
interface Binding {
    /** The name the entry point exports. */
    imported: string;
    typeOnly: boolean;
}

/** What `migrateSource` made of a file. */
export interface MigratedSource {
    content: string;
    changed: boolean;
    /** The lines of each `KbqDlModule` left in place. */
    keptModuleLines: number[];
}

const isEntryPoint = (node: ts.Node | undefined): boolean =>
    !!node && ts.isStringLiteral(node) && node.text === DL_PACKAGE;

/** Read from the text: `ImportClause.isTypeOnly` is deprecated in favor of a member older TypeScript lacks. */
const isTypeOnlyImport = (declaration: ts.ImportDeclaration): boolean =>
    /^type\b/.test(declaration.importClause?.getText() ?? '');

/** The new name of a renamed class. Own keys only: `toString` is no rename. */
const renameOf = (name: string): string | undefined => (Object.hasOwn(RENAMES, name) ? RENAMES[name] : undefined);

/**
 * Whether an identifier refers to a binding rather than naming a member or a declaration: `KbqDlComponent`
 * in `x.KbqDlComponent`, `ns.KbqDlComponent` as a type or `{ KbqDlComponent: 1 }` is not the import.
 */
function isReference(identifier: ts.Identifier): boolean {
    const { parent } = identifier;

    if (ts.isPropertyAccessExpression(parent) || ts.isQualifiedName(parent)) {
        return (ts.isPropertyAccessExpression(parent) ? parent.name : parent.right) !== identifier;
    }

    if (
        ts.isPropertyAssignment(parent) ||
        ts.isPropertyDeclaration(parent) ||
        ts.isMethodDeclaration(parent) ||
        ts.isPropertySignature(parent) ||
        ts.isMethodSignature(parent) ||
        ts.isGetAccessorDeclaration(parent) ||
        ts.isSetAccessorDeclaration(parent) ||
        ts.isEnumMember(parent)
    ) {
        return parent.name !== identifier;
    }

    return true;
}

/**
 * Renames the classes imported from `@koobiq/components/dl` and replaces `KbqDlModule` with the three
 * components wherever it is an element of an array. Only what is imported from the entry point is touched:
 * an unrelated `KbqDlComponent`, or one reached through a barrel of the project, is left alone, and a barrel
 * that re-exports an old name keeps exporting it, now as an alias of the new class.
 *
 * Names are edited in place on the AST; imports are added and removed with the helpers the other migrations use.
 */
export function migrateSource(content: string, fileName: string): MigratedSource {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const edits: Edit[] = [];
    const keptModuleLines: number[] = [];

    const imports = sourceFile.statements.filter(
        (statement): statement is ts.ImportDeclaration =>
            ts.isImportDeclaration(statement) && isEntryPoint(statement.moduleSpecifier)
    );
    const reExports = sourceFile.statements.filter(
        (statement): statement is ts.ExportDeclaration =>
            ts.isExportDeclaration(statement) && isEntryPoint(statement.moduleSpecifier)
    );

    /** Local name → what it imports, for every named import of the entry point. */
    const bindings = new Map<string, Binding>();
    const namespaces = new Set<string>();

    for (const declaration of imports) {
        const named = declaration.importClause?.namedBindings;

        if (!named) continue;

        if (ts.isNamespaceImport(named)) {
            namespaces.add(named.name.text);
            continue;
        }

        for (const element of named.elements) {
            bindings.set(element.name.text, {
                imported: (element.propertyName ?? element.name).text,
                typeOnly: element.isTypeOnly || isTypeOnlyImport(declaration)
            });
        }
    }

    if (!bindings.size && !namespaces.size && !reExports.length) return { content, changed: false, keptModuleLines };

    /** The local name of an import of `name`, an unaliased one first; with `valueOnly`, not a type-only one. */
    const localOf = (name: string, valueOnly = false): string | undefined => {
        const locals = [...bindings]
            .filter(([, binding]) => binding.imported === name && !(valueOnly && binding.typeOnly))
            .map(([local]) => local);

        return locals.find((local) => local === name) ?? locals[0];
    };

    /** Old local name → the local name its references take. */
    const referenceRenames = new Map<string, string>();
    /** The old imports renamed in place: their specifier becomes the new name. */
    const renamedInPlace = new Set<string>();
    /** The old imports that go: the new class is imported already, or is about to be. */
    const droppedOld = new Set<string>();
    /** The classes to import as values, which nothing imports that way yet. */
    const missing = new Set<string>();

    for (const [local, { imported, typeOnly }] of bindings) {
        const target = renameOf(imported);

        if (local !== imported || !target) continue;

        // A value use needs a value import of the new class; a type use takes either.
        const existing = localOf(target, !typeOnly);

        if (existing) {
            referenceRenames.set(local, existing);
            droppedOld.add(local);
        } else if (localOf(target) === target) {
            // Imported type-only under the same name: renaming in place would bind it twice, so it is made a value.
            referenceRenames.set(local, target);
            droppedOld.add(local);
            missing.add(target);
        } else {
            referenceRenames.set(local, target);
            renamedInPlace.add(local);
        }
    }

    /** The local name a replaced `KbqDlModule` refers to a component by, as a value. */
    const componentLocal = (component: string): string => {
        const existing = localOf(component, true);

        if (existing) return existing;

        const renamedValue = [...renamedInPlace].some(
            (old) => renameOf(old) === component && !bindings.get(old)!.typeOnly
        );

        if (!renamedValue) missing.add(component);

        return component;
    };

    /** The class an element of an array stands for, under its new name. */
    const elementClass = (element: ts.Expression): string | undefined => {
        let name: string | undefined;

        if (ts.isIdentifier(element)) {
            name = bindings.get(element.text)?.imported;
        } else if (
            ts.isPropertyAccessExpression(element) &&
            ts.isIdentifier(element.expression) &&
            namespaces.has(element.expression.text)
        ) {
            name = element.name.text;
        }

        return name && (renameOf(name) ?? name);
    };

    let moduleReferences = 0;
    let moduleKept = false;
    /** The components each array has gained, so that a second `KbqDlModule` in it adds nothing twice. */
    const added = new Map<ts.ArrayLiteralExpression, Set<string>>();

    const keepModule = (node: ts.Node): void => {
        moduleReferences++;
        moduleKept = true;
        keptModuleLines.push(sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1);
    };

    /** Replaces a `KbqDlModule` element of an array with the components the array does not hold yet. */
    const replaceModule = (node: ts.Expression, componentText: (component: string) => string): void => {
        const { parent } = node;

        if (!ts.isArrayLiteralExpression(parent)) return keepModule(node);

        moduleReferences++;

        const held =
            added.get(parent) ?? new Set(parent.elements.map(elementClass).filter((name): name is string => !!name));
        const components = MODULE_COMPONENTS.filter((component) => !held.has(component));

        components.forEach((component) => held.add(component));
        added.set(parent, held);

        if (components.length) {
            const lineStart = content.lastIndexOf('\n', node.getStart() - 1) + 1;
            const indent = content.slice(lineStart, node.getStart());
            const separator = /^[ \t]*$/.test(indent) ? `,\n${indent}` : ', ';

            edits.push({
                start: node.getStart(),
                end: node.getEnd(),
                text: components.map(componentText).join(separator)
            });

            return;
        }

        // Everything it re-exports is in the array already: the element goes, with one of its commas.
        const elements = parent.elements;
        const index = elements.indexOf(node);
        const [start, end] =
            index < elements.length - 1
                ? [node.getStart(), elements[index + 1].getStart()]
                : index > 0
                  ? [elements[index - 1].getEnd(), node.getEnd()]
                  : [node.getStart(), node.getEnd()];

        edits.push({ start, end, text: '' });
    };

    /** Points a specifier at the new class, keeping the name it binds or exports. */
    const renameSpecifier = (element: ts.ImportSpecifier | ts.ExportSpecifier, name: string, keepAlias: boolean) => {
        if (element.propertyName) {
            edits.push({ start: element.propertyName.getStart(), end: element.propertyName.getEnd(), text: name });
        } else {
            const text = keepAlias ? `${name} as ${element.name.text}` : name;

            edits.push({ start: element.name.getStart(), end: element.name.getEnd(), text });
        }
    };

    const visit = (node: ts.Node): void => {
        // Their specifiers are edited below.
        if (ts.isImportDeclaration(node) || (ts.isExportDeclaration(node) && isEntryPoint(node.moduleSpecifier))) {
            return;
        }

        if (ts.isExportSpecifier(node) && !node.parent.parent.moduleSpecifier) {
            // A local `export { … }` of the import keeps the name it exports.
            const source = (node.propertyName ?? node.name).text;
            const local = referenceRenames.get(source);

            if (local) renameSpecifier(node, local, true);

            if (bindings.get(source)?.imported === DL_MODULE) keepModule(node);

            return;
        }

        if (
            (ts.isPropertyAccessExpression(node) || ts.isQualifiedName(node)) &&
            ts.isIdentifier(ts.isPropertyAccessExpression(node) ? node.expression : node.left) &&
            namespaces.has((ts.isPropertyAccessExpression(node) ? node.expression : node.left).getText())
        ) {
            const namespace = (ts.isPropertyAccessExpression(node) ? node.expression : node.left).getText();
            const member = ts.isPropertyAccessExpression(node) ? node.name : node.right;
            const target = renameOf(member.text);

            if (target) {
                edits.push({ start: member.getStart(), end: member.getEnd(), text: target });
            } else if (member.text === DL_MODULE && ts.isPropertyAccessExpression(node)) {
                replaceModule(node, (component) => `${namespace}.${component}`);
            }

            return;
        }

        if (ts.isIdentifier(node) && isReference(node)) {
            const local = referenceRenames.get(node.text);

            if (local) {
                edits.push({
                    start: node.getStart(),
                    end: node.getEnd(),
                    text: ts.isShorthandPropertyAssignment(node.parent) ? `${node.text}: ${local}` : local
                });
            } else if (bindings.get(node.text)?.imported === DL_MODULE) {
                if (ts.isShorthandPropertyAssignment(node.parent)) {
                    keepModule(node);
                } else {
                    replaceModule(node, componentLocal);
                }
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    for (const declaration of imports) {
        const named = declaration.importClause?.namedBindings;

        if (!named || !ts.isNamedImports(named)) continue;

        for (const element of named.elements) {
            const target = renameOf((element.propertyName ?? element.name).text);

            // An unaliased old import is renamed in place or dropped; an aliased one keeps its local name.
            if (target && (element.propertyName || renamedInPlace.has(element.name.text))) {
                renameSpecifier(element, target, false);
            }
        }
    }

    for (const declaration of reExports) {
        const named = declaration.exportClause;

        if (!named || !ts.isNamedExports(named)) continue;

        for (const element of named.elements) {
            const target = renameOf((element.propertyName ?? element.name).text);

            if (target) renameSpecifier(element, target, true);
        }
    }

    let result = content;

    for (const { start, end, text } of edits.sort((a, b) => b.start - a.start)) {
        result = result.slice(0, start) + text + result.slice(end);
    }

    // Added before the module goes, so that an import of the module alone gains them in place rather than being
    // dropped and recreated at the top of the file.
    for (const component of missing) result = ensureImport(result, component, DL_PACKAGE);

    for (const old of droppedOld) result = removeImport(result, old, DL_PACKAGE);

    // The module import goes once nothing refers to it; an import nothing used is not this migration's business.
    if (moduleReferences > 0 && !moduleKept) result = removeImport(result, DL_MODULE, DL_PACKAGE);

    result = dedupeImportSpecifiers(result, content);

    return { content: result, changed: result !== content, keptModuleLines };
}

/**
 * Moves the consumers of the description list to the names of its standalone components, and off its no longer
 * documented NgModule where that is a drop-in change. Only `.ts` files are visited: the selectors did not change,
 * so no template does.
 */
export default function dlStandaloneNames(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so the
        // schema default never reaches us - applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(options.project, tree);
        const root = projectDefinition?.root ?? '';
        const rootDir = root ? tree.getDir(root as Path) : tree.root;
        let consumers = 0;
        let touched = 0;

        visitProjectFiles(rootDir, (filePath: Path, entry) => {
            if (!filePath.endsWith(TS_EXT)) return;

            const original = entry.content.toString();

            if (!original.includes(DL_PACKAGE)) return;

            consumers++;

            const { content, changed, keptModuleLines } = migrateSource(original, filePath);

            for (const line of keptModuleLines) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${keptModuleMessage(line)}`]);
            }

            if (!changed) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        // Nothing here uses the description list, so the summary would only be noise.
        if (consumers === 0) return;

        logMessage(context.logger, [
            `${LABEL} processed tree under "${root || '<workspace root>'}", ${consumers} file(s) import ` +
                `${DL_PACKAGE}, ${fix ? 'updated' : 'would update'} ${touched} file(s).`,
            ...SUMMARY
        ]);
    };
}
