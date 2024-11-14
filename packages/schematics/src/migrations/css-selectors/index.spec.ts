import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ProjectDefinition } from '@schematics/angular/utility';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { colorsVarsReplacement, typographyCssSelectorsReplacement } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');

const SCHEMATIC_NAME = 'css-selectors';

const elementsWithDeprecatedSelectors = typographyCssSelectorsReplacement
    .map(({ replace }) => `<div class="${replace}"></div>`)
    .join('\n');

const cssClassesWithDeprecatedSelectors = typographyCssSelectorsReplacement
    .map(({ replace }) => `.${replace} {}`)
    .join('\n');

const componentClass = `
@Component({
    selector: 'test-app',
    template: '${elementsWithDeprecatedSelectors}'
})
class TestApp {
    dynamicClass = '${typographyCssSelectorsReplacement[0].replace}';
}`;

const elementsWithDeprecatedColors = colorsVarsReplacement
    .map(({ replace }) => `<div style="color: var(--${replace})"></div>`)
    .join('\n');
const cssClassesWithDeprecatedColors = colorsVarsReplacement
    .map(({ replace }) => `.test { color: var(--${replace}) }`)
    .join('\n');

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

    it('should inform about deprecated selectors for fix = false (default, without params)', async () => {
        const [firstProjectKey] = projects.keys();
        const messages: string[] = [];
        runner.logger.subscribe(
            ({ message }) => {
                messages.push(message);
                expect(message).toBeTruthy();
            },
            () => {},
            () => expect(messages).toMatchSnapshot()
        );

        try {
            await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey }, appTree);
        } finally {
            runner.logger.complete();
        }
    });

    it('should inform about deprecated colors in the file', async () => {
        const [firstProjectKey] = projects.keys();
        const messages: string[] = [];
        runner.logger.subscribe(
            ({ message }) => {
                messages.push(message);
                expect(message).toBeTruthy();
            },
            () => {},
            () => expect(messages).toMatchSnapshot()
        );

        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;
            const tsPath = `/${project.root}/src/app/app.component.ts`;
            const stylesPath = `/${project.root}/src/styles.scss`;

            appTree.overwrite(templatePath, elementsWithDeprecatedColors);
            appTree.overwrite(stylesPath, cssClassesWithDeprecatedColors);
            appTree.overwrite(tsPath, '');
        });

        try {
            await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey }, appTree);
        } finally {
            runner.logger.complete();
        }
    });
});
