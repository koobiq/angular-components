import { SchematicsException, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import { loadEsmModule } from 'ng-packagr/lib/utils/load-esm';
import { resolve } from 'path';
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
import { forEachClass } from '../../utils/typescript';
import { Schema } from './schema';

export const cases = { elementName: 'kbq-empty-state', attrs: { from: 'big', to: 'size' } };

export const LEADING_TRIVIA_CHARS = [' ', '\n', '\r', '\t'];

export default function migrate(options: Schema) {
    return async (tree: Tree) => {
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
            await migrateTemplate(templatePath);
        }

        const sourceFiles = program.getSourceFiles().filter((sourceFile) => canMigrateFile(sourceFile, program));
        for (const sourceFile of sourceFiles) {
            await migrateTs(sourceFile);
        }
    };
}

const getParsingInfo = async (project: string | undefined, tree: Tree) => {
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
};

export function canMigrateFile(sourceFile: ts.SourceFile, program: ts.Program): boolean {
    // We shouldn't migrate .d.ts files, files from an external library or type checking files.
    return !(
        sourceFile.fileName.endsWith('.ngtypecheck.ts') ||
        sourceFile.isDeclarationFile ||
        program.isSourceFileFromExternalLibrary(sourceFile)
    );
}

const migrateTemplate = async (filePath: string) => {
    const parsedFilePath = `.${filePath}`;
    const template = fs.readFileSync(parsedFilePath, 'utf8');
    const parsed = await parseTemplate(template);

    if (parsed.tree !== undefined) {
        const visitor = new ElementCollector(cases, filePath);
        visitAll(visitor, parsed.tree.rootNodes);
        for (const el of visitor.elementsToMigrate) {
            console.log(template[el.attrs[0].valueSpan.start.offset]);
        }
    }
};

const migrateTs = async (sourceFile: ts.SourceFile) => {
    forEachClass(sourceFile, async (node) => {
        if (ts.isClassDeclaration(node)) {
            await analyzeDecorators(node, sourceFile.fileName);
        }
    });
};

async function analyzeDecorators(node: ts.ClassDeclaration, fileName: string) {
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

    if (!metadata) {
        return;
    }

    for (const prop of metadata.properties) {
        // All the properties we care about should have static
        // names and be initialized to a static string.
        if (!ts.isPropertyAssignment(prop) || (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))) {
            continue;
        }
        // check decorator 'template' property, check for text content parse and replace
        if (prop.name.text === 'template' && ts.isStringLiteralLike(prop.initializer) && prop.initializer.text) {
            const parsed = await parseTemplate(prop.initializer.text);
            if (parsed.tree !== undefined) {
                const visitor = new ElementCollector(cases, fileName);
                visitAll(visitor, parsed.tree.rootNodes);
            }
        }
    }
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
                    const cleanAttrValue = getSimpleAttributeValue(attr.value);
                    switch (cleanAttrValue) {
                        case 'true':
                            attr.value = 'big';
                            break;
                        case 'false':
                            attr.value = 'compact';
                            break;
                        default:
                            console.warn(
                                `Element is using dynamic value. Check the code and change value on your own.${
                                    (this.filePath && ' File: ' + this.filePath) || ''
                                }`
                            );
                            attr.value = 'normal';
                    }
                    attr.name = this.migrationData.attrs.to;
                    this.elementsToMigrate.push(el);
                }
            }
        }
        this.visitChildren(el);
    }

    visitChildren(el: Element | Block) {
        if (el.children?.length) {
            for (const child of el.children) {
                child.visit(this);
            }
        }
    }

    /**
     * Handle @if, @for
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
