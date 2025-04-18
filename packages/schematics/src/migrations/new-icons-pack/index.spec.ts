import { ProjectDefinitionCollection } from '@angular-devkit/core/src/workspace';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { first } from 'rxjs';
import { createTestApp } from '../../utils/testing';
import { newIconsPackData } from './data';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'new-icons-pack';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: ProjectDefinitionCollection;
    const elementsWithDeprecatedIconPrefixes = [
        '<i kbq-icon="mc-word-wrap_16"></i>',
        '<i kbq-icon-item="mc-word-wrap_16"></i>',
        '<i kbq-icon-button="mc-word-wrap_16"></i>',
        '<i class="mc kbq-icon mc-word-wrap_16"></i>',
        '<div [class.mc-word-wrap_16]="true"></div>'
    ];
    const updatedPkgName = '@koobiq/icons';

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
                `${appTree.read(templatePath)!.toString()}\n${elementsWithDeprecatedIconPrefixes.join('\n')}`
            );
            appTree.overwrite(stylesPath, `@use "@koobiq/icons"\n${appTree.read(stylesPath)!.toString()}`);
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

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: false, project: firstProjectKey }, appTree);

        const [firstProjectTemplateContent, firstProjectStylesContent] = readProjectContent(firstProjectKey);

        expect(
            elementsWithDeprecatedIconPrefixes.filter((item) => firstProjectTemplateContent.indexOf(item) !== -1).length
        ).toBeFalsy();
        expect(firstProjectStylesContent).toContain(updatedPkgName);

        const [secondProjectTemplateContent] = readProjectContent(secondProjectKey);

        expect(
            elementsWithDeprecatedIconPrefixes.filter((item) => secondProjectTemplateContent.indexOf(item) !== -1)
                .length
        ).toEqual(elementsWithDeprecatedIconPrefixes.length);
    });

    it('should run migration for whole tree', async () => {
        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true }, appTree);

        projects.forEach((project) => {
            const templateContent = tree.read(`/${project.root}/src/app/app.component.html`)!.toString();

            expect(
                elementsWithDeprecatedIconPrefixes.filter((item) => templateContent.indexOf(item) !== -1).length
            ).toBeFalsy();
        });
    });

    it('should replace deprecated icons for fix = true', async () => {
        const newIconsPackDataSlice = newIconsPackData.slice(0, 10);
        const iconsToBeReplaced = newIconsPackDataSlice.map(({ replace }) => `<i kbq-icon="mc-${replace}"></i>`);
        const iconsToBeReplacedWith = newIconsPackDataSlice.map(
            ({ replaceWith }) => `<i kbq-icon="kbq-${replaceWith}"></i>`
        );

        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;

            appTree.overwrite(
                templatePath,
                `${appTree.read(templatePath)!.toString()}\n${iconsToBeReplaced.join('\n')}`
            );
        });

        const tree = await runner.runSchematic(SCHEMATIC_NAME, { fix: true }, appTree);

        projects.forEach((project) => {
            const templateContent = tree.read(`/${project.root}/src/app/app.component.html`)!.toString();

            expect(iconsToBeReplaced.filter((item) => templateContent.indexOf(item) !== -1).length).toBeFalsy();
            expect(iconsToBeReplacedWith.filter((item) => templateContent.indexOf(item) !== -1).length).toEqual(
                iconsToBeReplacedWith.length
            );
        });
    });

    it('should inform about deprecated icons for fix = false (default, without params)', (done) => {
        const newIconsPackDataSlice = newIconsPackData.slice(0, 10);
        const iconsToBeReplaced = newIconsPackDataSlice.map(({ replace }) => `<i kbq-icon="mc-${replace}"></i>`);

        projects.forEach((project) => {
            const templatePath = `/${project.root}/src/app/app.component.html`;

            appTree.overwrite(
                templatePath,
                `${appTree.read(templatePath)!.toString()}\n${iconsToBeReplaced.join('\n')}`
            );
        });

        // simply check for messages to be sent
        runner.logger.pipe(first()).subscribe(({ message }) => {
            expect(message).toBeTruthy();
            done();
        });

        runner.runSchematic(SCHEMATIC_NAME, {}, appTree);
    });
});
