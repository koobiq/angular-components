import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'icon-semantics-and-api';

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

    function paths(project: workspaces.ProjectDefinition) {
        // The exact file names from @schematics/angular:application vary across versions
        // (app.ts vs app.component.ts), so discover them from the tree.
        const root = `/${project.root}/src/app`;

        return { ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts` };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports a small binding on a plain icon', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<i kbq-icon="kbq-plus_16" [small]="true"></i>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('KbqIcon.small was removed');
    });

    it('reports a KbqIcon content query that starts resolving buttons and items', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqIcon } from '@koobiq/components/icon';\n" +
                'export class App { readonly icon = contentChild(KbqIcon); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('provide the KbqIcon token now');
    });

    it('reports a keydown handler sitting on an icon button', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'const template = `<i kbq-icon-button="kbq-xmark-s_16" (keydown.enter)="remove()"></i>`;\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('activates itself from Enter and Space');
    });

    it('reports a tabindex binding on an icon button', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<i kbq-icon-button="kbq-xmark-s_16" [tabindex]="-1"></i>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('number | null instead of any');
    });

    it('reports a subclass overriding the removed name marker', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqIcon } from '@koobiq/components/icon';\n" +
                "export class MyIcon extends KbqIcon { override name = 'MyIcon'; }\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('appliesMaxHeight');
    });

    it('says nothing at all when the project does not use icons', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { small = true; }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[icon-semantics-and-api]');
    });
});
