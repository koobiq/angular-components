import fs from 'fs';
import ts from 'typescript';
import { loadEsmModule, setupOptions } from '../../utils/package-config';
import { forEachClass } from '../../utils/typescript';
import { Schema } from './schema';

export default function migrate(options: Schema) {
    let targetDir;
    return async (tree) => {
        const { HtmlParser } = await loadEsmModule<typeof import('@angular/compiler')>('@angular/compiler');
        const parser = new HtmlParser();
        const migrateTs = (filePath: string) => {
            forEachClass(`.${filePath}`, (node) => {
                if (ts.isClassDeclaration(node)) {
                    const decorator = ts.getDecorators(node);
                    console.log(decorator);
                }
            });
        };

        const migrateTemplate = (filePath: string) => {
            const parsedFilePath = `.${filePath}`;
            parser.parse(fs.readFileSync(parsedFilePath, 'utf8'), parsedFilePath);
        };

        const { project } = options;
        try {
            const projectDefinition = await setupOptions(project, tree);
            console.log(projectDefinition);
            targetDir = projectDefinition ? tree.getDir(projectDefinition.root) : tree;
        } catch (e) {
            targetDir = tree;
        }

        // Update inline template & external html
        targetDir.visit((filePath) => {
            if (filePath.endsWith('.ts')) {
                migrateTs(filePath);
            }

            if (filePath.endsWith('.html')) {
                migrateTemplate(filePath);
            }
        });
    };
}
