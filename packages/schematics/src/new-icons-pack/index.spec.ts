import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { createTestApp } from '../utils/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';

const collectionPath = path.join(__dirname, '../collection.json');

describe('new-icons-pack', () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner);
    });

    it('should run migration for specified project', () => {

    });

    it('should run migration for whole tree', () => {

    });

    it('should update prefixes for kbq icons in templates and components', () => {

    });

    it('should skip changes if koobiq icons package with breaking changes is not installed', () => {

    });

    it('works', async () => {
        const workspace = await getWorkspace(appTree);
        const projects = workspace.projects;
        const pkgPath = '/package.json';
        const pkg = JSON.parse(appTree.read(pkgPath)!.toString());
        pkg.dependencies['@koobiq/kbq-icons'] = '^8.0.0-beta.2';
        const testItems = [
            '<i kbq-icon="mc-word-wrap_16"></i>',
            '<i kbq-icon-item="mc-word-wrap_16"></i>',
            '<i kbq-icon-button="mc-word-wrap_16"></i>',
            '<i class="mc kbq-icon mc-word-wrap_16"></i>',
            '<div [class.mc-word-wrap_16]="true"></div>'
        ];

        appTree.overwrite(pkgPath, JSON.stringify(pkg));
        projects.forEach((project) => {
            const templatePath = `/${ project.root }/src/app/app.component.html`;

            appTree.overwrite(templatePath,
                `${ appTree.read(templatePath)!.toString() }\n${ testItems.join('\n') }`
            );
        });

        const tree = await runner.runSchematic('new-icons-pack', { fix: false }, appTree);

        projects.forEach((project) => {
            const templatePath = `/${ project.root }/src/app/app.component.html`;
            const templateContent = tree.read(templatePath)!.toString();

            expect(testItems.filter((item) => templateContent.indexOf(item) !== -1).length).toBeFalsy();
        });
    });
});
