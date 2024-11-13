import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ProjectDefinition } from '@schematics/angular/utility';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { first } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import { cssSelectorsReplacement } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');

const SCHEMATIC_NAME = 'css-selectors';

const elementsWithDeprecatedSelectors = cssSelectorsReplacement
    .map(({ replace }) => `<div class="${replace}"></div>`)
    .join('\n');
const cssClassesWithDeprecatedSelectors = cssSelectorsReplacement.map(({ replace }) => `.${replace} {}`).join('\n');
const componentClass = `
@Component({
    selector: 'test-app',
    template: '${elementsWithDeprecatedSelectors}'
})
class TestApp {
    dynamicClass = '${cssSelectorsReplacement[0].replace}';
}`;

const getProjectContent = (tree: UnitTestTree | Tree, project: ProjectDefinition) => {
    return [
        tree.read(`/${project.root}/src/app/app.component.html`)?.toString() || '',
        tree.read(`/${project.root}/src/app/app.component.ts`)?.toString() || '',
        tree.read(`/${project.root}/src/styles.scss`)?.toString() || ''
    ];
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: ProjectDefinitionCollection;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);
        projects = workspace.projects as unknown as ProjectDefinitionCollection;
        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;
            const tsPath = `/${project.root}/src/app/app.component.ts`;
            const stylesPath = `/${project.root}/src/styles.scss`;

            appTree.overwrite(templatePath, elementsWithDeprecatedSelectors);
            appTree.overwrite(stylesPath, cssClassesWithDeprecatedSelectors);
            appTree.overwrite(tsPath, componentClass);
        });
    });

    it('should run migration for specified project', async () => {
        const [firstProjectKey, secondProjectKey] = projects.keys();
        const firstProjectBeforeChanges = getProjectContent(appTree, projects.get(firstProjectKey)!);
        const secondProjectBeforeChanges = getProjectContent(appTree, projects.get(secondProjectKey)!);

        expect(firstProjectBeforeChanges).toMatchSnapshot(`project ${firstProjectKey}: before changes`);
        expect(secondProjectBeforeChanges).toMatchSnapshot(`project ${secondProjectKey}: before changes`);

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true, project: firstProjectKey }, appTree);

        expect(getProjectContent(tree, projects.get(firstProjectKey)!)).toMatchSnapshot(
            `project ${firstProjectKey}: after changes`
        );

        expect(getProjectContent(tree, projects.get(secondProjectKey)!)).toMatchSnapshot(
            `project ${secondProjectKey}: after changes`
        );
    });

    it('should run migration for whole tree', async () => {
        projects.forEach((project, key) => {
            expect(getProjectContent(appTree, project)).toMatchSnapshot(`project ${key}: before changes`);
        });

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true }, appTree);

        projects.forEach((project, key) => {
            expect(getProjectContent(tree, project)).toMatchSnapshot(`project ${key}: after changes`);
        });
    });

    it('should inform about deprecated selectors for fix = false (default, without params)', (done) => {
        // simply check for messages to be sent
        runner.logger.pipe(first()).subscribe(({ message }) => {
            expect(message).toBeTruthy();
            done();
        });

        runner.runSchematic(SCHEMATIC_NAME, {}, appTree);
    });
});
