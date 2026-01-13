import ts from 'typescript';
import { Attribute, Block, Element, getSimpleAttributeName, Visitor } from './ast';

export const LEADING_TRIVIA_CHARS = [' ', '\n', '\r', '\t'];

export type ParseTemplateResult = {
    tree?: { rootNodes: unknown };
    errors: ParseTemplateError[];
};

export type ParseTemplateError = { type: string; error: ParseError };

export interface ParseError {
    msg: string;
    contextualMessage(): string;
    toString(): string;
}

export type TransformTemplateAttributesResult = {
    fileContent: string;
    changed?: boolean;
    errors: ParseTemplateError[];
};

/**
 * Represents a range of text within a file. Omitting the end
 * means that it's until the end of the file.
 */
export type Range = {
    start: number;
    end?: number;
    node: ts.Node;
    type: string;
    remove: boolean;
};

export type Replacement = { from: string; to: string };
export type MigrationData = {
    elementName: string;
    attrs: { key: Replacement; value: { replacements: Replacement[]; default: string } };
};

export function forEachClass(sourceFile: ts.SourceFile, callback: (node: ts.ClassDeclaration) => void) {
    sourceFile.forEachChild(function walk(node) {
        if (ts.isClassDeclaration(node)) {
            callback(node);
        }

        node.forEachChild(walk);
    });
}

export function canMigrateFile(sourceFile: ts.SourceFile, program: ts.Program): boolean {
    // We shouldn't migrate .d.ts files, files from an external library or type checking files.
    return !(
        sourceFile.fileName.endsWith('.ngtypecheck.ts') ||
        sourceFile.isDeclarationFile ||
        program.isSourceFileFromExternalLibrary(sourceFile)
    );
}

export function updateDecoratorProperty(decorator: ts.Decorator, propertyName: string, newValue: string): ts.Decorator {
    if (ts.isCallExpression(decorator.expression)) {
        const [arg] = decorator.expression.arguments;

        if (ts.isObjectLiteralExpression(arg)) {
            const newProperties = arg.properties.map((prop) => {
                if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === propertyName) {
                    return ts.factory.updatePropertyAssignment(
                        prop,
                        prop.name,
                        ts.factory.createNoSubstitutionTemplateLiteral(newValue, newValue)
                    );
                }

                return prop;
            });

            const newArg = ts.factory.updateObjectLiteralExpression(arg, newProperties);
            const newCall = ts.factory.updateCallExpression(
                decorator.expression,
                decorator.expression.expression,
                undefined,
                [newArg]
            );

            return ts.factory.updateDecorator(decorator, newCall);
        }
    }

    return decorator;
}

export function getClassWithUpdatedDecorator(
    node: ts.ClassDeclaration,
    decorator: ts.Decorator,
    updatedDecorator: ts.Decorator
) {
    const nodeDecorators = ts.getDecorators(node) || [];
    const decoratorIndex = nodeDecorators.indexOf(decorator);
    const updatedDecorators = decoratorIndex !== -1 ? [
                  ...nodeDecorators.slice(0, decoratorIndex),
                  updatedDecorator,
                  ...nodeDecorators.slice(decoratorIndex + 1, nodeDecorators.length)
              ] : nodeDecorators;
    const modifiers = node.modifiers ? node.modifiers.filter((modifier) => modifier !== decorator) : [];

    return ts.factory.replaceDecoratorsAndModifiers(node, [...updatedDecorators, ...modifiers]);
}

/**
 * Class that collects specific elements for migration
 * based on matching tag names and attribute values.
 *
 * Used as reference:
 * @see https://github.com/angular/angular/blob/6fa8d441979fdbabb88dddd246f54587e17126e8/packages/core/schematics/migrations/control-flow-migration/types.ts#L432
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

                if (cleanAttrName === this.migrationData.attrs.key.from) {
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

export class AnalyzedFile {
    private ranges: Range[] = [];
    sourceFile: ts.SourceFile;
    templateRanges: Range[] = [];

    constructor(sourceFile: ts.SourceFile) {
        this.sourceFile = sourceFile;
    }

    /** Returns the ranges in the order in which they should be migrated. */
    getSortedRanges(): Range[] {
        // templates first for checking on whether certain imports can be safely removed
        this.templateRanges = this.ranges
            .slice()
            .filter((x) => x.type === 'template' || x.type === 'templateUrl')
            .sort((aStart, bStart) => bStart.start - aStart.start);

        return this.templateRanges;
    }

    /**
     * Adds a text range to an `AnalyzedFile`.
     * @param path Path of the file.
     * @param sourceFile SourceFile
     * @param analyzedFiles Map keeping track of all the analyzed files.
     * @param range Range to be added.
     */
    static addRange(
        path: string,
        sourceFile: ts.SourceFile,
        analyzedFiles: Map<string, AnalyzedFile>,
        range: Range
    ): void {
        let analysis = analyzedFiles.get(path);

        if (!analysis) {
            analysis = new AnalyzedFile(sourceFile);
            analyzedFiles.set(path, analysis);
        }

        const duplicate = analysis.ranges.find((current) => current.start === range.start && current.end === range.end);

        if (!duplicate) {
            analysis.ranges.push(range);
        }
    }
}

/**
 * parses the template string into the Html AST
 */
export async function parseTemplate(template: string): Promise<ParseTemplateResult> {
    try {
        const { HtmlParser } = await import('@angular/compiler');
        const parser = new HtmlParser();

        // Note: we use the HtmlParser here, instead of the `parseTemplate` function, because the
        // latter returns an Ivy AST, not an HTML AST. The HTML AST has the advantage of preserving
        // interpolated text as text nodes containing a mixture of interpolation tokens and text tokens,
        // rather than turning them into `BoundText` nodes like the Ivy AST does. This allows us to
        // easily get the text-only ranges without having to reconstruct the original text.
        const parsed = parser.parse(template, '', {
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

        return { tree: parsed, errors: [] };
    } catch (e: any) {
        return { tree: undefined, errors: [{ type: 'parse', error: e }] };
    }
}
