import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'sidepanel-non-modal-behavior';

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

    it('reports a non-modal sidepanel, which no longer freezes the page or leaves focus alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSidepanelService } from '@koobiq/components/sidepanel';\n" +
                'export class App { open(s: KbqSidepanelService, t: any) { s.open(t, { hasBackdrop: false }); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer blocks the page scroll');
        expect(messages.join('\n')).toContain('captures focus on open');
    });

    it('reports a write to hasBackdrop on an open sidepanel', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSidepanelRef } from '@koobiq/components/sidepanel';\n" +
                'export class App { hide(r: KbqSidepanelRef) { r.config.hasBackdrop = false; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('has never done anything');
    });

    it('reports a reach into the raw overlay backdrop element', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSidepanelRef } from '@koobiq/components/sidepanel';\n" +
                'export class App { hide(r: KbqSidepanelRef) { r.overlayRef.backdropElement!.hidden = true; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('throws on any panel');
    });

    it('reports a stylesheet hook that is no longer stamped', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqSidepanelModule } from '@koobiq/components/sidepanel';\n" +
                "const styles = ['.kbq-sidepanel-overlay { z-index: 5 }'];\n"
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer added to the overlay host element');
    });

    it('always names the focus-trap provider that stopped leaking application-wide', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { KbqSidepanelModule } from '@koobiq/components/sidepanel';\n");

        await run(first);

        expect(messages.join('\n')).toContain('ConfigurableFocusTrapFactory');
    });

    it('says nothing at all when the project does not use the sidepanel', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { open(s: any, t: any) { s.open(t, { hasBackdrop: false }); } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[sidepanel-non-modal-behavior]');
    });
});
