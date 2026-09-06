import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'input-number-surface';

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

    it('reports a read of a member removed with the KbqFormFieldControl surface', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                'export class App { invalid(i: KbqNumberInput) { return i.errorState; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer implements KbqFormFieldControl');
    });

    it('reports the unprefixed validator classes', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { MinValidator } from '@koobiq/components/input';\n");

        await run(first);

        expect(messages.join('\n')).toContain('deprecated aliases of KbqMinValidator');
    });

    it('reports the unprefixed validator providers', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { MAX_VALIDATOR } from '@koobiq/components/input';\n");

        await run(first);

        expect(messages.join('\n')).toContain('KBQ_MAX_VALIDATOR');
    });

    it('reports a native number type on the number input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<input kbqNumberInput type="number" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('is reset to type="text"');
    });

    it('reports a read of the removed valueAsNumber prototype patch', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                'export class App { read(e: HTMLInputElement) { return e.valueAsNumber; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer redefines HTMLInputElement.prototype.valueAsNumber');
    });

    it('says nothing at all when the project does not use the input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { invalid(i: any) { return i.errorState; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
