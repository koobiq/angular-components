import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { cssSelectorsReplacement } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');

const SCHEMATIC_NAME = 'css-selectors';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: ProjectDefinitionCollection;
    const elementsWithDeprecatedSelectors = [
        '<div class="kbq-display-1"></div>',
        '<div class="kbq-display-2"></div>',
        '<div class="kbq-display-3"></div>',
        '<div class="kbq-body"></div>',
        '<div class="kbq-caption"></div>'
    ];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);
        projects = workspace.projects as unknown as ProjectDefinitionCollection;
        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;
            const stylesPath = `/${project.root}/src/styles.scss`;

            appTree.overwrite(
                templatePath,
                `${appTree.read(templatePath)!.toString()}\n${elementsWithDeprecatedSelectors.join('\n')}`
            );
            appTree.overwrite(stylesPath, '.kbq-display-1 {}\n' + '\n${appTree.read(stylesPath)!.toString()}');
        });
    });

    it('should run migration for specified project', async () => {
        const [firstProjectKey, secondProjectKey] = projects.keys();
        const readProjectContent = (projectKey: string) => {
            const project = projects.get(projectKey)!;
            return [
                tree.read(`/${project.root}/src/app/app.component.html`)?.toString() || '',
                tree.read(`/${project.root}/src/styles.scss`)?.toString() || ''
            ];
        };

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true, project: firstProjectKey }, appTree);

        const [firstProjectTemplateContent, firstProjectStylesContent] = readProjectContent(firstProjectKey);
        expect(
            elementsWithDeprecatedSelectors.filter((item) => firstProjectTemplateContent.indexOf(item) !== -1).length
        ).toBeFalsy();
        expect(firstProjectStylesContent.includes('kbq-display-1')).toBeFalsy();

        const [secondProjectTemplateContent] = readProjectContent(secondProjectKey);
        expect(
            elementsWithDeprecatedSelectors.filter((item) => secondProjectTemplateContent.indexOf(item) !== -1).length
        ).toEqual(elementsWithDeprecatedSelectors.length);
    });

    it('should run migration for whole tree', async () => {
        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true }, appTree);

        projects.forEach((project) => {
            const templateContent = tree.read(`/${project.root}/src/app/app.component.html`)!.toString();

            expect(
                elementsWithDeprecatedSelectors.filter((item) => templateContent.indexOf(item) !== -1).length
            ).toBeFalsy();
        });
    });

    it('should replace deprecated selectors for fix = true', async () => {
        const selectorsToBeReplaced = cssSelectorsReplacement
            .slice(0, 10)
            .map(({ replace }) => `<div class="${replace}"></div>`);
        const selectorsToBeReplacedWith = cssSelectorsReplacement
            .slice(0, 10)
            .map(({ replaceWith }) => `<div class="${replaceWith}"></div>`);

        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;

            appTree.overwrite(
                templatePath,
                `${appTree.read(templatePath)!.toString()}\n${selectorsToBeReplaced.join('\n')}`
            );
        });

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true }, appTree);

        projects.forEach((project) => {
            const templateContent = tree.read(`/${project.root}/src/app/app.component.html`)!.toString();

            expect(selectorsToBeReplaced.filter((item) => templateContent.indexOf(item) !== -1).length).toBeFalsy();
            expect(selectorsToBeReplacedWith.filter((item) => templateContent.indexOf(item) !== -1).length).toEqual(
                selectorsToBeReplacedWith.length
            );
        });
    });

    it('should inform about deprecated selectors for fix = false (default, without params)', async () => {
        const selectorsToBeReplaced = cssSelectorsReplacement
            .slice(0, 10)
            .map(({ replace }) => `<div class="${replace}"></div>`);

        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;
            appTree.overwrite(
                templatePath,
                `${appTree.read(templatePath)!.toString()}\n${selectorsToBeReplaced.join('\n')}`
            );
        });

        // simply check for messages to be sent
        runner.logger.subscribe(({ message }) => expect(message).toBeTruthy());

        await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);
    });
});
