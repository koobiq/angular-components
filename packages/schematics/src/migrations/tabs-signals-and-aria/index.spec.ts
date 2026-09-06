import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tabs-signals-and-aria';

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

    it('reports a push into the resize stream, which was subscribed by nothing', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                'export class App { poke(g: KbqTabGroup) { g.resizeStream.next(new Event("resize")); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('resizeStream and the (window:resize) host listener were removed');
    });

    it('reports the group-level disabled attribute, which was read by nothing', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-tab-group disabled><kbq-tab label="A" /></kbq-tab-group>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('KbqTabGroup.disabled was removed');
    });

    it('separates a write to the tab disabled input from a read', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTab } from '@koobiq/components/tabs';\n" +
                'export class App { lock(t: KbqTab) { t.disabled = true; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('takes no assignment');
        expect(messages.join('\n')).not.toContain('read it as a call');
    });

    it('reports the changed getTabIndex signature', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                'export class App { index(g: KbqTabGroup) { return g.getTabIndex(g.tabs.first, 0); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('getTabIndex(tab, tabHeader, index)');
    });

    it('reports the deprecated vertical styler directive', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { KbqVerticalTabsCssStyler } from '@koobiq/components/tabs';\n");

        await run(first);

        expect(messages.join('\n')).toContain('KbqVerticalTabsCssStyler is a deprecated no-op');
    });

    it('always states the ARIA and tabNavPanel facts, which have no call site to match on', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-tab-group><kbq-tab label="A" /></kbq-tab-group>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('ARIA tabs pattern');
        expect(messages.join('\n')).toContain('[tabNavPanel]');
    });

    it('says nothing at all when the project does not use tabs', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { poke(s: any) { return s.resizeStream; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[tabs-signals-and-aria]');
    });
});
