import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { iconReplacementData } from './data';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'icons-replacement';

/**
 * `@schematics/angular:application` changed file names across major versions
 * (`app.component.{ts,html}` ↔ `app.{ts,html}`); pick whichever generator produced.
 */
const getProjectContentPaths = (project: workspaces.ProjectDefinition, tree: Tree | UnitTestTree) => {
    const root = `/${project.root}/src/app`;

    return {
        templatePath: tree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`,
        tsPath: tree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
        stylesPath: `/${project.root}/src/styles.scss`
    };
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });
        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
    });

    it('should run migration for specified project', async () => {
        const [firstProjectKey] = projects.keys();

        await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey, fix: true, allowed: [] } satisfies Schema,
            appTree
        );
    });

    it('should run migration for external html', async () => {
        const [firstProjectKey] = projects.keys();
        const { templatePath } = getProjectContentPaths(projects.get(firstProjectKey)!, appTree);

        const iconsDataSlice = iconReplacementData.slice(0, 10);
        const iconsToBeReplaced = iconsDataSlice.map(({ from }) => `<i kbq-icon="kbq-${from}"></i>`);
        const template = iconsToBeReplaced.join('\n');

        appTree.overwrite(templatePath, template);

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey, fix: true, allowed: ['.html'] } satisfies Schema,
            appTree
        );

        expect(updatedTree.read(templatePath)?.toString()).toMatchSnapshot(`project ${firstProjectKey}: after changes`);
    });

    it('should inform about deprecated icons for fix = false (default, without params)', (done) => {
        const [firstProjectKey] = projects.keys();
        const iconsDataSlice = iconReplacementData.slice(0, 10);
        const iconsToBeReplaced = iconsDataSlice.map(({ from }) => `<i kbq-icon="kbq-${from}"></i>`);

        projects.forEach((project) => {
            const { templatePath } = getProjectContentPaths(project, appTree);

            appTree.overwrite(
                templatePath,
                `${appTree.read(templatePath)!.toString()}\n${iconsToBeReplaced.join('\n')}`
            );
        });

        // simply check for messages to be sent
        runner.logger.subscribe((logEntry) => {
            expect(logEntry?.message).toBeTruthy();
            runner.logger.complete();
            done();
        });

        runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey }, appTree);
    });
});
