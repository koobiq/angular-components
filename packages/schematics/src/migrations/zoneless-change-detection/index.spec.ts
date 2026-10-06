import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'zoneless-change-detection';

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

    function specPath(project: workspaces.ProjectDefinition): string {
        return `/${project.root}/src/app/zone.spec.ts`;
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports a MockNgZone provider and its simulateZoneExit() calls', async () => {
        const [first] = projects.keys();
        const file = specPath(projects.get(first)!);
        const messages = collectLogs();

        appTree.create(
            file,
            "import { NgZone } from '@angular/core';\n" +
                "import { MockNgZone } from '@koobiq/components/core';\n" +
                'let zone: MockNgZone;\n' +
                'const providers = [{ provide: NgZone, useFactory: () => (zone = new MockNgZone()) }];\n' +
                'zone.simulateZoneExit();\n'
        );

        await run(first);

        const log = messages.join('\n');

        expect(log).toContain('MockNgZone was removed from @koobiq/components/core');
        expect(log).toContain('simulateZoneExit() has nothing left to flush');
        expect(log).toContain('2 use(s) reported');
    });

    it('stays silent for a project that never used the helper', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        await run(first);

        expect(messages.join('\n')).not.toContain('[zoneless-change-detection]');
    });

    it('leaves every file untouched', async () => {
        const [first] = projects.keys();
        const file = specPath(projects.get(first)!);
        const content = "import { MockNgZone } from '@koobiq/components/core';\nnew MockNgZone().simulateZoneExit();\n";

        appTree.create(file, content);

        const tree = await run(first);

        expect(tree.readContent(file)).toBe(content);
    });
});
