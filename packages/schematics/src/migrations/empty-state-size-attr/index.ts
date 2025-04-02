import { SchematicsException, Tree } from '@angular-devkit/schematics';
import fs from 'fs';
import { resolve } from 'path';
import ts from 'typescript';
import * as messages from '../../utils/messages';
import { loadEsmModule, setupOptions } from '../../utils/package-config';
import { forEachClass } from '../../utils/typescript';
import { Schema } from './schema';

export default function migrate(options: Schema) {
    return async (tree: Tree) => {
        const { HtmlParser } = await loadEsmModule<typeof import('@angular/compiler')>('@angular/compiler');
        const parser = new HtmlParser();
        const migrateTs = (sourceFile: ts.SourceFile) => {
            forEachClass(sourceFile, (node) => {
                if (ts.isClassDeclaration(node)) {
                    analyzeDecorators(node);
                }
            });
        };

        const migrateTemplate = (filePath: string) => {
            const parsedFilePath = `.${filePath}`;
            parser.parse(fs.readFileSync(parsedFilePath, 'utf8'), parsedFilePath);
        };

        const { project } = options;
        const { tsPaths, templatePaths, projectDefinition } = await getProjectTsConfigPath(project, tree);

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
            migrateTemplate(templatePath);
        }

        const sourceFiles = program.getSourceFiles().filter((sourceFile) => canMigrateFile(sourceFile, program));
        for (const sourceFile of sourceFiles) {
            migrateTs(sourceFile);
        }
    };
}

const getProjectTsConfigPath = async (project: string | undefined, tree: Tree) => {
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

function analyzeDecorators(node: ts.ClassDeclaration) {
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
        if (ts.isIdentifier(prop.name) && prop.name.escapedText === 'template') {
            const start = prop.initializer.getStart() + 1;
            const end = prop.initializer.getEnd() - 1;
            console.log(start, end, prop);
        }
    }
}
