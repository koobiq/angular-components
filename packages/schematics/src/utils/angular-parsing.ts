import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { relative } from 'path';
import ts from 'typescript';
import { getSimpleAttributeName, getSimpleAttributeValue, visitAll } from './ast';
import {
    AnalyzedFile,
    ElementCollector,
    forEachClass,
    MigrationData,
    parseTemplate,
    TransformTemplateAttributesResult
} from './typescript';

/**
 * Update separate html file
 * @param tree
 * @param filePaths
 * @param context
 * @param migrationData
 */
export async function migrateTemplate(
    tree: Tree,
    filePaths: string[],
    context: SchematicContext,
    migrationData: MigrationData
) {
    for (const templatePath of filePaths) {
        const parsedFilePath = `.${templatePath}`;
        let res: Promise<TransformTemplateAttributesResult> = Promise.resolve({
            fileContent: '',
            changed: false,
            errors: []
        });

        try {
            const template = tree.read(parsedFilePath)?.toString();
            if (template) {
                res = transformTemplateAttributes(template, parsedFilePath, migrationData);
            }
        } catch (e) {
            context.logger.error(e as any);
        }

        const { fileContent, changed, errors } = await res;
        if (changed) {
            tree.overwrite(templatePath, fileContent);
        }

        if (errors.length > 0) {
            context.logger.error(errors.map(({ error }) => error.toString()).join('\n'));
        }
    }
}

/**
 * Update typescript file if classes with @Component decorator and `template` property exists
 * @param tree
 * @param sourceFiles
 * @param basePath
 * @param context
 * @param migrationData
 */
export async function migrateTs(
    tree: Tree,
    sourceFiles: ts.SourceFile[],
    basePath: string,
    context: SchematicContext,
    migrationData: MigrationData
) {
    // run and track changed components
    const analysis = new Map<string, AnalyzedFile>();
    for (const sourceFile of sourceFiles) {
        forEachClass(sourceFile, (node) => {
            analyzeDecorators(node, sourceFile, analysis);
        });
    }

    // update source file
    for (const path of analysis.keys()) {
        const file = analysis.get(path)!;
        const ranges = file.getSortedRanges();
        const relativePath = relative(basePath, path);
        const content = tree.readText(relativePath);
        const update = tree.beginUpdate(relativePath);

        for (const { start, end } of ranges) {
            const template = content.slice(start, end);
            const length = (end ?? content.length) - start;

            const { fileContent, changed, errors } = await transformTemplateAttributes(
                template,
                relativePath,
                migrationData
            );

            if (changed) {
                update.remove(start, length);
                update.insertLeft(start, fileContent);
            }

            if (errors.length > 0) {
                context.logger.error(errors.map(({ error }) => error.toString()).join('\n'));
            }
        }

        tree.commitUpdate(update);
    }
}

/**
 * Analyzes the decorators of a given class declaration to find and save
 * inline `template` metadata within `@Component` decorators.
 */
export function analyzeDecorators(
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    analyzedFiles: Map<string, AnalyzedFile>
) {
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
        return;
    }

    for (const prop of metadata.properties) {
        // All the properties we care about should have static
        // names and be initialized to a static string.
        if (!ts.isPropertyAssignment(prop) || (!ts.isIdentifier(prop.name) && !ts.isStringLiteralLike(prop.name))) {
            continue;
        }
        // check decorator 'template' property, check for text content parse
        if (prop.name.text === 'template' && ts.isStringLiteralLike(prop.initializer) && prop.initializer.text) {
            // +1/-1 to exclude the opening/closing characters from the range.
            AnalyzedFile.addRange(sourceFile.fileName, sourceFile, analyzedFiles, {
                start: prop.initializer.getStart(sourceFile) + 1,
                end: prop.initializer.getEnd() - 1,
                node: prop,
                type: 'template',
                remove: true
            });
        }
    }
}

/**
 * Migrates attribute values in an Angular template based on predefined cases.
 */
async function transformTemplateAttributes(
    template: string,
    fileName: string,
    migrationData: MigrationData
): Promise<TransformTemplateAttributesResult> {
    const parsed = await parseTemplate(template);
    let updatedTemplate = template;
    // extra text offset as result of text replacement;
    let offset = 0;

    if (parsed.tree !== undefined) {
        const visitor = new ElementCollector(migrationData, fileName);
        visitAll(visitor, parsed.tree.rootNodes);

        for (const el of visitor.elementsToMigrate) {
            const migrationAttr = el.attrs.find(
                (attr) => getSimpleAttributeName(attr.name) === migrationData.attrs.key.from
            );
            let updatedAttrValue: string | undefined;
            if (migrationAttr) {
                const cleanAttrValue = getSimpleAttributeValue(migrationAttr.value);
                const replacement = migrationData.attrs.value.replacements.find(({ from }) => from === cleanAttrValue);

                if (replacement) {
                    updatedAttrValue = replacement.to;
                } else {
                    console.warn(
                        `Element is using dynamic value. Check the code and change value on your own.${
                            (fileName && ' File: ' + fileName) || ''
                        }`
                    );
                    updatedAttrValue = migrationData.attrs.value.default;
                }

                updatedTemplate =
                    updatedTemplate.slice(0, migrationAttr.keySpan.start.offset - offset) +
                    `${migrationData.attrs.key.to}="${updatedAttrValue}"` +
                    updatedTemplate.slice(migrationAttr.valueSpan.end.offset + 1 - offset, updatedTemplate.length);

                offset += migrationAttr.name.length - migrationData.attrs.key.to.length;
                offset += migrationAttr.value.length - updatedAttrValue.length;
            }
        }
        return { fileContent: updatedTemplate, changed: visitor.elementsToMigrate.length > 0, errors: parsed.errors };
    }
    return { fileContent: updatedTemplate, changed: undefined, errors: parsed.errors };
}
