import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
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

    it('leaves a project that does not use the component untouched', async () => {
        const snapshot = (tree: UnitTestTree) =>
            tree.files.filter((file) => /\.(ts|html|scss)$/.test(file)).map((file) => `${file}:${tree.readText(file)}`);
        const before = snapshot(appTree as UnitTestTree);

        const [firstProjectKey] = projects.keys();

        const updatedTree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: firstProjectKey, fix: true, allowed: [] } satisfies Schema,
            appTree
        );

        expect(snapshot(updatedTree)).toEqual(before);
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

    it('should inform about deprecated icons for fix = false (default, without params)', async () => {
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
        const firstLogEntry = firstValueFrom(runner.logger);

        await runner.runSchematic(SCHEMATIC_NAME, { project: firstProjectKey }, appTree);

        expect((await firstLogEntry).message).toBeTruthy();
    });

    it('accepts a folder as the `project` option, skips node_modules and reports the built-in data', async () => {
        const messages: string[] = [];
        const project = projects.get(projects.keys().next().value!)!;
        const { templatePath } = getProjectContentPaths(project, appTree);
        const { from, to } = iconReplacementData[0];
        const html = `<i kbq-icon="${from}"></i>`;
        const vendored = '/node_modules/some-lib/icon.html';

        appTree.overwrite(templatePath, html);
        appTree.create(vendored, html);
        runner.logger.subscribe(({ message }) => messages.push(message));

        const tree = await runner.runSchematic(
            SCHEMATIC_NAME,
            { project: `./${project.root}`, fix: true, allowed: ['.html'] } satisfies Schema,
            appTree
        );

        expect(tree.readText(templatePath)).toBe(`<i kbq-icon="${to}"></i>`);
        expect(tree.readText(vendored)).toBe(html);
        expect(messages).toContain(
            `Icon mapping: the built-in one, ${iconReplacementData.length} entries (--custom-data-path overrides it).`
        );
    });

    describe('custom data', () => {
        let messages: string[];
        let project: workspaces.ProjectDefinition;
        let templatePath: string;

        beforeEach(() => {
            messages = [];
            runner.logger.subscribe(({ message }) => messages.push(message));
            project = projects.get(projects.keys().next().value!)!;
            templatePath = getProjectContentPaths(project, appTree).templatePath;
            appTree.overwrite(templatePath, '<i kbq-icon="kbq-old_16"></i>');
        });

        const run = (options: Partial<Schema>) =>
            runner.runSchematic(
                SCHEMATIC_NAME,
                { project: projects.keys().next().value!, fix: true, allowed: ['.html'], ...options },
                appTree
            );

        it('reads replace/replaceWith pairs from --custom-data-path, relative to the workspace root', async () => {
            appTree.create('/icons.json', JSON.stringify([{ replace: 'kbq-old_16', replaceWith: 'kbq-new_16' }]));

            const tree = await run({ customDataPath: 'icons.json' });

            expect(tree.readText(templatePath)).toBe('<i kbq-icon="kbq-new_16"></i>');
            expect(messages).toContain("Icon mapping: 1 entries from 'icons.json'.");
            expect(messages.some((message) => message.includes('deprecated'))).toBe(false);
        });

        it('still reads a from/to file through the deprecated --replacement-data-path, relative to the project', async () => {
            appTree.create(`/${project.root}/icons.json`, JSON.stringify([{ from: 'old_16', to: 'new_16' }]));

            const tree = await run({ replacementDataPath: 'icons.json' });

            expect(tree.readText(templatePath)).toBe('<i kbq-icon="kbq-new_16"></i>');
            expect(messages.some((message) => message.includes('deprecated { "from", "to" } pairs'))).toBe(true);
        });

        it('prefers --custom-data-path over the deprecated option', async () => {
            appTree.create('/icons.json', JSON.stringify([{ replace: 'kbq-old_16', replaceWith: 'kbq-new_16' }]));

            const tree = await run({ customDataPath: 'icons.json', replacementDataPath: 'missing.json' });

            expect(tree.readText(templatePath)).toBe('<i kbq-icon="kbq-new_16"></i>');
            expect(messages).toContain('--replacement-data-path is deprecated and ignored next to --custom-data-path.');
        });

        it('fails on a custom data file that does not exist', async () => {
            await expect(run({ customDataPath: 'missing.json' })).rejects.toThrow("Unable to find 'missing.json'");
        });
    });
});
