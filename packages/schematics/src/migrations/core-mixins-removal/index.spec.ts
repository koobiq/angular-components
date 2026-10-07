import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'core-mixins-removal';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let project: string;
    let file: string;
    let messages: string[];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;

        [project] = projects.keys();
        file = `/${projects.get(project)!.root}/src/app/base.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports mixinDisabled and mixinTabIndex', async () => {
        appTree.create(
            file,
            "import { mixinDisabled, mixinTabIndex } from '@koobiq/components/core';\n" +
                'export const Base = mixinTabIndex(mixinDisabled(class {}));\n'
        );

        const before = appTree.readText(file);

        await run();

        const log = messages.join('\n');

        expect(log).toContain('mixinDisabled, CanDisable and CanDisableCtor were removed');
        expect(log).toContain('mixinTabIndex, HasTabIndex and HasTabIndexCtor were removed');
        expect(appTree.readText(file)).toBe(before);
    });

    it('says nothing when the mixins are not used', async () => {
        appTree.create(file, 'export class Base { disabled = false; }\n');

        await run();

        expect(messages.join('\n')).not.toContain('[core-mixins-removal]');
    });
});
