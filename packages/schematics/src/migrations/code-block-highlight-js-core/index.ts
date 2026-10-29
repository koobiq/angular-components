import { Path, workspaces } from '@angular-devkit/core';
import { chain, Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { addRootProvider, readWorkspace } from '@schematics/angular/utility';
import ts from 'typescript';
import { logMessage } from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { visitProjectFiles } from '../../utils/project-files';
import { safeRule } from '../../utils/safe-rule';
import {
    addedRootProviderMessage,
    CODE_BLOCK_PACKAGE,
    CONFIG_PROVIDER,
    CONFIG_TOKEN,
    FULL_BUNDLE_CORE,
    libraryMessage,
    noWorkspaceMessage,
    otherConfigsMessage,
    rootProviderFallback,
    SUMMARY,
    unreadConfigMessage
} from './data';
import { findRootProviders, isHighlightJsConfig } from './root-providers';
import { Schema } from './schema';

const LABEL = '[code-block-highlight-js-core]';
const TS_EXT = '.ts';
/** Files that render code blocks outside the application, with providers of their own. */
const TEST_FILE = /\.(spec|test|stories|cy)\.ts$/;

/** A text-span edit on the original content. Applied right-to-left so the offsets stay valid. */
interface Edit {
    start: number;
    end: number;
    text: string;
}

/** What `migrateSource` made of a file. */
export interface MigratedSource {
    content: string;
    changed: boolean;
    /** The lines of each configuration the migration cannot read. */
    unreadLines: number[];
    /** How many configurations the file provides, read or not. */
    configs: number;
}

/** The name of a callee or of a referenced token: `x` for `x` and `ns.x`. */
const nameOf = (node: ts.Expression): string | undefined => {
    if (ts.isIdentifier(node)) return node.text;
    if (ts.isPropertyAccessExpression(node)) return node.name.text;

    return undefined;
};

/** The name of a property, `undefined` for a computed one other than a string literal. */
const propertyName = (property: ts.ObjectLiteralElementLike): string | undefined => {
    const name = property.name;

    if (!name) return undefined;
    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
    if (ts.isComputedPropertyName(name) && ts.isStringLiteralLike(name.expression)) return name.expression.text;

    return undefined;
};

const findProperty = (literal: ts.ObjectLiteralExpression, name: string): ts.ObjectLiteralElementLike | undefined =>
    literal.properties.find((property) => propertyName(property) === name);

/** The names a file gives to an export of the code block: its own, and those of `import { name as alias }`. */
function localNames(sourceFile: ts.SourceFile, exported: string): Set<string> {
    const names = new Set([exported]);

    for (const statement of sourceFile.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        if (statement.moduleSpecifier.text !== CODE_BLOCK_PACKAGE) continue;

        const bindings = statement.importClause?.namedBindings;

        if (!bindings || !ts.isNamedImports(bindings)) continue;

        for (const element of bindings.elements) {
            if ((element.propertyName ?? element.name).text === exported) names.add(element.name.text);
        }
    }

    return names;
}

/**
 * Adds `core: () => import('highlight.js')` to every highlight.js configuration written as an object literal without
 * `core` - the argument of `kbqCodeBlockHighlightJsConfigProvider` and the `useValue` of a provider of
 * `KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG` - since the code block loaded the full bundle for it. A configuration it
 * cannot read, such as a variable, a spread or a factory, is reported rather than guessed at.
 */
export function migrateSource(content: string, fileName: string): MigratedSource {
    const sourceFile = ts.createSourceFile(fileName, content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
    const newline = content.includes('\r\n') ? '\r\n' : '\n';
    const providerNames = localNames(sourceFile, CONFIG_PROVIDER);
    const tokenNames = localNames(sourceFile, CONFIG_TOKEN);
    const edits: Edit[] = [];
    const unreadLines: number[] = [];
    let configs = 0;

    const report = (node: ts.Node): void => {
        unreadLines.push(sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1);
    };

    const isToken = (node: ts.Expression | undefined): boolean => !!node && tokenNames.has(nameOf(node) ?? '');

    const addCore = (config: ts.Expression | undefined, site: ts.Node): void => {
        configs++;

        if (!config || !ts.isObjectLiteralExpression(config)) return report(config ?? site);
        if (findProperty(config, 'core')) return;

        // A spread or a computed name may hold `core`.
        if (config.properties.some((property) => ts.isSpreadAssignment(property) || !propertyName(property))) {
            return report(config);
        }

        const [first] = config.properties;
        const open = config.getStart() + 1;

        if (!first) {
            const inner = content.slice(open, config.getEnd() - 1);

            if (!inner.trim()) {
                edits.push({ start: config.getStart(), end: config.getEnd(), text: `{ ${FULL_BUNDLE_CORE} }` });
            } else {
                // A comment is all the literal holds: `core` goes above it.
                const indent = /\n([ \t]*)\S/.exec(inner)?.[1];

                edits.push({
                    start: open,
                    end: open,
                    text: indent === undefined ? ` ${FULL_BUNDLE_CORE}` : `${newline}${indent}${FULL_BUNDLE_CORE}`
                });
            }

            return;
        }

        // Above the comments of the first property, which describe it.
        const [comment] = ts.getLeadingCommentRanges(content, first.getFullStart()) ?? [];
        const start = comment?.pos ?? first.getStart();
        const indent = content.slice(content.lastIndexOf('\n', start - 1) + 1, start);
        const separator = /^[ \t]*$/.test(indent) ? `,${newline}${indent}` : ', ';

        edits.push({ start, end: start, text: FULL_BUNDLE_CORE + separator });
    };

    // The `useValue` of a provider object; `TestBed.overrideProvider` takes one without `provide`.
    const addCoreToProvider = (provider: ts.Expression | undefined, site: ts.Node): void => {
        const useValue = provider && ts.isObjectLiteralExpression(provider) && findProperty(provider, 'useValue');

        addCore(useValue && ts.isPropertyAssignment(useValue) ? useValue.initializer : undefined, site);
    };

    const visit = (node: ts.Node): void => {
        if (ts.isCallExpression(node)) {
            const callee = nameOf(node.expression);

            if (callee && providerNames.has(callee)) {
                addCore(node.arguments[0], node);
            } else if (callee === 'overrideProvider' && isToken(node.arguments[0])) {
                addCoreToProvider(node.arguments[1], node);
            }
        } else if (ts.isObjectLiteralExpression(node)) {
            const provide = findProperty(node, 'provide');

            if (provide && ts.isPropertyAssignment(provide) && isToken(provide.initializer)) {
                addCoreToProvider(node, node);
            }
        }

        ts.forEachChild(node, visit);
    };

    visit(sourceFile);

    let result = content;

    for (const { start, end, text } of edits.sort((a, b) => b.start - a.start)) {
        result = result.slice(0, start) + text + result.slice(end);
    }

    return { content: result, changed: result !== content, unreadLines, configs };
}

/** The directory of a project's sources, as the paths `visitProjectFiles` passes start: `/src`, or `/` for the root. */
const sourceDir = (project: workspaces.ProjectDefinition): string =>
    `/${(project.sourceRoot ?? project.root).replace(/^\/+|\/+$/g, '')}`;

const isInside = (path: string, dir: string): boolean => dir === '/' || path.startsWith(`${dir}/`);

const fullBundleProviderRule = (project: string): Rule =>
    addRootProvider(project, ({ code, external }) => {
        const provider = external(CONFIG_PROVIDER, CODE_BLOCK_PACKAGE);

        return code`${provider}({ ${FULL_BUNDLE_CORE} })`;
    });

/**
 * Keeps the full highlight.js bundle where the code block loaded it by default: in the root providers of an
 * application that renders code blocks with no configuration there, and in every configuration without `core`.
 */
export default function codeBlockHighlightJsCore(options: Schema): Rule {
    return async (tree: Tree, context: SchematicContext) => {
        // `ng update` invokes migrations with no options at all, and migrations.json declares no schema, so the
        // schema default never reaches us - applying the fix is the intended behaviour there.
        const fix = options.fix ?? true;
        const projectDefinition = await setupOptions(options.project, tree);
        // The source root rather than the root: the root of the first application can be the workspace root.
        const rootDir = projectDefinition ? tree.getDir(sourceDir(projectDefinition) as Path) : tree.root;
        const providerRules: Rule[] = [];
        let projects: { name: string; definition: workspaces.ProjectDefinition; dir: string }[] = [];
        let consumers = 0;
        let touched = 0;

        try {
            const workspace = await readWorkspace(tree);

            projects = [...workspace.projects].map(([name, definition]) => ({
                name,
                definition,
                dir: sourceDir(definition)
            }));
        } catch {
            // The configurations are migrated all the same.
            logMessage(context.logger, [LABEL, ...noWorkspaceMessage()]);
        }

        const usingCodeBlock = new Set<string>();
        const configured = new Set<string>();

        visitProjectFiles(rootDir, (filePath: Path, entry) => {
            if (!filePath.endsWith(TS_EXT)) return;

            // The innermost project: one whose sources sit at the workspace root holds the others too.
            const containing = projects.filter(({ dir }) => isInside(filePath, dir));
            const depth = Math.max(...containing.map(({ dir }) => dir.length));
            const owners = containing.filter(({ dir }) => dir.length === depth).map(({ name }) => name);

            if (options.project && !owners.includes(options.project)) return;

            const original = entry.content.toString();
            const isTest = TEST_FILE.test(filePath);

            if (!isTest && original.includes(CODE_BLOCK_PACKAGE)) owners.forEach((name) => usingCodeBlock.add(name));

            if (!original.includes(CONFIG_PROVIDER) && !original.includes(CONFIG_TOKEN)) return;

            const { content, changed, unreadLines, configs } = migrateSource(original, filePath);

            if (!isTest && configs) owners.forEach((name) => configured.add(name));

            for (const line of unreadLines) {
                logMessage(context.logger, [`${LABEL} ${filePath}`, `  ${unreadConfigMessage(line)}`]);
            }

            if (!changed) return;

            touched++;

            if (fix) {
                tree.overwrite(filePath, content);
            } else {
                logMessage(context.logger, [`${LABEL} would update ${filePath} (run with --fix to apply)`]);
            }
        });

        for (const { name, definition } of projects) {
            if (!usingCodeBlock.has(name) || (options.project && name !== options.project)) continue;

            consumers++;

            if (definition.extensions['projectType'] !== 'application') {
                if (!configured.has(name)) logMessage(context.logger, [LABEL, ...libraryMessage(name)]);

                continue;
            }

            const rootProviders = await findRootProviders(tree, name);

            if (!rootProviders) {
                logMessage(context.logger, [LABEL, ...rootProviderFallback(name)]);

                continue;
            }

            // A configuration in the root providers reaches every code block, and has its `core` by now.
            if (rootProviders.some(isHighlightJsConfig)) continue;

            const messages = [
                ...addedRootProviderMessage(name, fix),
                ...(configured.has(name) ? otherConfigsMessage(name) : [])
            ];

            if (!fix) {
                logMessage(context.logger, [LABEL, ...messages]);

                continue;
            }

            providerRules.push(
                safeRule(
                    chain([
                        fullBundleProviderRule(name),
                        (_, ruleContext) => logMessage(ruleContext.logger, [LABEL, ...messages])
                    ]),
                    rootProviderFallback(name)
                )
            );
        }

        // Nothing here renders code blocks, so the summary would only be noise.
        if (!consumers && !touched) return;

        // After the root providers, which say what they added only once it is there.
        return chain([
            ...providerRules,
            (_, ruleContext) =>
                logMessage(ruleContext.logger, [
                    `${LABEL} ${fix ? 'updated' : 'would update'} ${touched} highlight.js configuration file(s).`,
                    ...SUMMARY
                ])
        ]);
    };
}
