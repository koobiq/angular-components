import { SchematicContext, SchematicsException, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import { loadEsmModule } from 'ng-packagr/lib/utils/load-esm';
import * as process from 'node:process';
import path, { resolve } from 'path';
import ts from 'typescript';
import {
    Attribute,
    Block,
    Element,
    getSimpleAttributeName,
    getSimpleAttributeValue,
    MigrationData,
    visitAll,
    Visitor
} from '../../utils/ast';
import * as messages from '../../utils/messages';
import { setupOptions } from '../../utils/package-config';
import { canMigrateFile, getClassWithUpdatedDecorator, updateDecoratorProperty } from '../../utils/typescript';
import { Schema } from './schema';

export const cases = { elementName: 'kbq-empty-state', attrs: { from: 'big', to: 'size' } };

export const LEADING_TRIVIA_CHARS = [' ', '\n', '\r', '\t'];

export default function migrate(options: Schema) {
    return async (tree: Tree, context: SchematicContext) => {
        const { project } = options;
        const { tsPaths, templatePaths, projectDefinition } = await getParsingInfo(project, tree);

        const program = ts.createProgram(
            Array.from(tsPaths, (item) => resolve(process.cwd(), `.${item}`)),
            {
                baseUrl: projectDefinition.root,
                rootDir: projectDefinition.root,
                _enableTemplateTypeChecker: true, // Required for the template type checker to work.
                compileNonExportedClasses: true, // We want to migrate non-exported classes too.
                // Avoid checking libraries to speed up the migration.
                skipLibCheck: true,
                skipDefaultLibCheck: true
            }
        );
        // const analysis = new Map<string, ts.SourceFile>();

        // Update inline template & external html
        for (const templatePath of templatePaths) {
            const { fileContent, changed } = await migrateTemplate(templatePath);
            if (changed) {
                tree.overwrite(templatePath, fileContent);
            }
        }

        for (const sourceFile of program.getSourceFiles()) {
            const canMigrate = canMigrateFile(sourceFile, program);
            if (canMigrate) {
                const { fileContent, changed } = await migrateTs(sourceFile);
                if (changed) {
                    const fileRelativePath = path.relative(process.cwd(), sourceFile.fileName);
                    if (tree.exists(fileRelativePath)) {
                        tree.overwrite(fileRelativePath, fileContent);
                    }
                }
            }
        }

        context.logger.warn('Warning! Run linter in updated files since line breaks or indents maybe be broken.');
    };
}

export async function getParsingInfo(project: string | undefined, tree: Tree) {
    const tsPaths = new Set<string>();
    const templatePaths = new Set<string>();
    const projectDefinition = await setupOptions(project, tree);
    if (!projectDefinition) {
        throw new SchematicsException(messages.noProject('no project'));
    }

    tree.getDir(projectDefinition.root).visit((filePath: string) => {
        if (filePath.endsWith('.ts')) {
            tsPaths.add(filePath);
        }

        if (filePath.endsWith('.html')) {
            templatePaths.add(filePath);
        }
    });

    return { tsPaths, templatePaths, projectDefinition };
}

async function migrateTemplate(filePath: string) {
    const parsedFilePath = `.${filePath}`;
    const template = fs.readFileSync(parsedFilePath, 'utf8');
    return transformTemplateAttributes(template, parsedFilePath);
}

async function migrateTs(sourceFile: ts.SourceFile) {
    const changedClasses: ts.ClassDeclaration[] = [];
    // run and track changed components
    const walk = async (node: ts.Node): Promise<void> => {
        if (ts.isClassDeclaration(node)) {
            const { fileContent, changed } = await analyzeDecorators(node, sourceFile);
            if (changed) {
                changedClasses.push(fileContent);
            }
        }
        const promises = node.getChildren(sourceFile).map((child) => walk(child));
        await Promise.all(promises);
    };
    await walk(sourceFile);

    // update source file
    if (changedClasses.length > 0) {
        const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
            const visit: ts.Visitor = (node: ts.Node) => {
                if (ts.isClassDeclaration(node)) {
                    const updated = changedClasses.find((updatedNode) => updatedNode.name?.text === node.name?.text);
                    if (updated) return updated;
                }
                if (ts.isStringLiteralLike(node)) {
                    return ts.factory.createStringLiteral(node.text, true);
                }
                return ts.visitEachChild(node, visit, context);
            };
            return (node: ts.SourceFile) => ts.visitNode(node, visit)! as ts.SourceFile;
        };

        const res = ts.transform(sourceFile, [transformer]);
        const transformed = res.transformed[0];

        // Use the printer to generate the updated code
        const printer = ts.createPrinter({
            // force CRLF since it w
            newLine: ts.NewLineKind.CarriageReturnLineFeed,
            removeComments: false
        });
        const updatedCode = printer.printFile(transformed);
        return {
            fileContent: updatedCode,
            changed: changedClasses.length > 0
        };
    }

    return { fileContent: sourceFile.text, changed: changedClasses.length > 0 };
}

/**
 * Analyzes the decorators of a given class declaration to find and update
 * inline `template` definitions within `@Component` decorators.
 */
async function analyzeDecorators(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile
): Promise<{ fileContent: ts.ClassDeclaration; changed: boolean }> {
    let changed = false;
    const decorator = ts.getDecorators(node)?.find((dec) => {
        return (
            ts.isCallExpression(dec.expression) &&
            ts.isIdentifier(dec.expression.expression) &&
            dec.expression?.expression?.text === 'Component'
        );
    }) as (ts.Decorator & { expression: ts.CallExpression }) | undefined;

    const metadata =
        decorator &&
        decorator.expression.arguments.length > 0 &&
        ts.isObjectLiteralExpression(decorator.expression.arguments[0])
            ? decorator.expression.arguments[0]
            : null;

    // Exit early if there's no metadata or it's not an object literal
    if (!metadata) {
        return { fileContent: node, changed };
    }

    for (const prop of metadata.properties) {
        // All the properties we care about should have static
        // names and be initialized to a static string.
        if (!ts.isPropertyAssignment(prop) || (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))) {
            continue;
        }
        // check decorator 'template' property, check for text content parse and replace
        if (prop.name.text === 'template' && ts.isStringLiteralLike(prop.initializer) && prop.initializer.text) {
            const { fileContent: updatedTemplate, changed: propertyChanged } = await transformTemplateAttributes(
                prop.initializer.text,
                sourceFile.fileName
            );
            changed = changed || !!propertyChanged;
            if (propertyChanged) {
                const updatedDecorator = updateDecoratorProperty(decorator!, 'template', updatedTemplate);

                const updatedClass = getClassWithUpdatedDecorator(node, decorator!, updatedDecorator);
                return { fileContent: updatedClass, changed };
            }
        }
    }
    return { fileContent: node, changed };
}

/**
 * Migrates attribute values in an Angular template based on predefined cases.
 */
async function transformTemplateAttributes(template: string, fileName: string) {
    const parsed = await parseTemplate(template);
    let updatedTemplate = template;
    // extra text offset as result of text replacement;
    let offset = 0;

    if (parsed.tree !== undefined) {
        const visitor = new ElementCollector(cases, fileName);
        visitAll(visitor, parsed.tree.rootNodes);

        for (const el of visitor.elementsToMigrate) {
            const migrationAttr = el.attrs.find((attr) => getSimpleAttributeName(attr.name) === cases.attrs.from);
            let updatedAttrValue: string | undefined;
            if (migrationAttr) {
                const cleanAttrValue = getSimpleAttributeValue(migrationAttr.value);

                switch (cleanAttrValue) {
                    case 'true':
                        updatedAttrValue = 'big';
                        break;
                    case 'false':
                        updatedAttrValue = 'compact';
                        break;
                    default:
                        console.warn(
                            `Element is using dynamic value. Check the code and change value on your own.${
                                (fileName && ' File: ' + fileName) || ''
                            }`
                        );
                        updatedAttrValue = 'normal';
                }

                updatedTemplate =
                    updatedTemplate.slice(0, migrationAttr.keySpan.start.offset - offset) +
                    `${cases.attrs.to}="${updatedAttrValue}"` +
                    updatedTemplate.slice(migrationAttr.valueSpan.end.offset + 1 - offset, updatedTemplate.length);

                offset += migrationAttr.name.length - cases.attrs.to.length;
                offset += migrationAttr.value.length - updatedAttrValue.length;
            }
        }
        return { fileContent: updatedTemplate, changed: visitor.elementsToMigrate.length > 0 };
    }
    return { fileContent: updatedTemplate, changed: undefined };
}

/**
 * parses the template string into the Html AST
 */
export async function parseTemplate(template: string) {
    const { HtmlParser } = await loadEsmModule<typeof import('@angular/compiler')>('@angular/compiler');
    const parser = new HtmlParser();

    let parsed;
    try {
        // Note: we use the HtmlParser here, instead of the `parseTemplate` function, because the
        // latter returns an Ivy AST, not an HTML AST. The HTML AST has the advantage of preserving
        // interpolated text as text nodes containing a mixture of interpolation tokens and text tokens,
        // rather than turning them into `BoundText` nodes like the Ivy AST does. This allows us to
        // easily get the text-only ranges without having to reconstruct the original text.
        parsed = parser.parse(template, '', {
            // Allows for ICUs to be parsed.
            tokenizeExpansionForms: true,
            // Explicitly disable blocks so that their characters are treated as plain text.
            tokenizeBlocks: true,
            preserveLineEndings: true,
            leadingTriviaChars: LEADING_TRIVIA_CHARS
        });

        // Don't migrate invalid templates.
        if (parsed.errors && parsed.errors.length > 0) {
            const errors = parsed.errors.map((e) => ({ type: 'parse', error: e }));
            return { tree: undefined, errors };
        }
    } catch (e: any) {
        return { tree: undefined, errors: [{ type: 'parse', error: e }] };
    }
    return { tree: parsed, errors: [] };
}

/**
 * Class that collects specific elements for migration
 * based on matching tag names and attribute values.
 */
export class ElementCollector implements Visitor {
    readonly elementsToMigrate: Element[] = [];

    constructor(
        public migrationData: MigrationData,
        public filePath?: string
    ) {}

    visitElement(el: Element): void {
        if (el.name === this.migrationData.elementName && el.attrs.length > 0) {
            for (const attr of el.attrs) {
                const cleanAttrName = getSimpleAttributeName(attr.name);
                if (cleanAttrName === this.migrationData.attrs.from) {
                    this.elementsToMigrate.push(el);
                }
            }
        }
        this.visitChildren(el);
    }

    /**
     * Recursively visits all child nodes of a given element or block.
     */
    visitChildren(el: Element | Block) {
        if (el.children?.length) {
            for (const child of el.children) {
                child.visit(this);
            }
        }
    }

    /**
     * Handle @if, @for blocks
     */
    visitBlock(block: Block, _1: any) {
        this.visitChildren(block);
    }

    // part of interface
    visitAttribute(_: Attribute, _1: any) {}
    visitText(_: any, _1: any) {}
    visitComment(_: any, _1: any) {}
    visitExpansion(_: any, _1: any) {}
    visitExpansionCase(_: any, _1: any) {}
    visitBlockParameter(_: any, _1: any) {}
    visitLetDeclaration(_: any, _1: any) {}
}
