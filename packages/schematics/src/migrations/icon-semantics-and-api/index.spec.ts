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

    it('reports a small attribute on an icon item', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<i kbq-icon-item="kbq-plus_16" small></i>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('KbqIcon.small was removed');
    });

    // v21-upgrade rewrites `small` on an icon button to `size` and reports what it leaves.
    it('leaves small on an icon button to v21-upgrade', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'const template = `<i kbq-icon="kbq-plus_16"></i><i kbq-icon-button="kbq-plus_16" [small]="true"></i>`;\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('KbqIcon.small was removed');
    });

    // KbqIconButton and KbqIconItem deliberately do not register under the KbqIcon token, so a consumer
    // query keeps resolving exactly what it resolved before and there is nothing to report.
    it('leaves a KbqIcon content query alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqIcon } from '@koobiq/components/icon';\n" +
                'export class App { readonly icon = contentChild(KbqIcon); }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('contentChild');
    });

    it('reports an icon button on a non-button host that handles a click but no key', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<i kbq-icon-button="kbq-xmark-s_16" (click)="remove()"></i>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('does not activate itself from Enter or Space');
    });

    it('leaves an icon button that handles its keys or sits on a native button alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'const template = `' +
                '<i kbq-icon-button="kbq-xmark-s_16" (click)="remove()" (keydown.enter)="remove()"></i>' +
                '<button kbq-icon-button="kbq-xmark-s_16" (click)="remove()"></button>`;\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('does not activate itself');
    });

    it('reports a tabindex binding on an icon button', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<i kbq-icon-button="kbq-xmark-s_16" [tabindex]="-1"></i>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('number | null instead of any');
    });

    it('reports a tabindex written to an icon button in code', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqIconButton } from '@koobiq/components/icon';\n" +
                "export function park(button: KbqIconButton) { button.tabindex = '-1'; }\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer type-checks');
    });

    it('leaves a tabindex on another element alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'const template = `<i kbq-icon-button="kbq-xmark-s_16" aria-label="Remove"></i><div tabindex="0"></div>`;\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('number | null instead of any');
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

    // `.name` is one of the most common property names there is, and the file-level anchor is any
    // KbqIcon identifier — an icon-heavy component reading `file.name` must not be reported.
    it('leaves an unrelated .name read alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqIconModule } from '@koobiq/components/icon';\n" +
                'export class App { label(file: File) { return file.name; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('appliesMaxHeight');
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
