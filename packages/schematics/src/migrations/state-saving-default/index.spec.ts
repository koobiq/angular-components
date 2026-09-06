import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'state-saving-default';

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

    /** Runs the migration over a single file and returns everything it logged. */
    async function report(source: string): Promise<string> {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, source);

        await run(first);

        return messages.join('\n');
    }

    describe('tabs', () => {
        it('reports a tab group that never mentions useStateSaving', async () => {
            const messages = await report('const template = `<kbq-tab-group><kbq-tab /></kbq-tab-group>`;\n');

            expect(messages).toContain('Tab groups remember the selected tab by default now');
        });

        it('stays quiet when the file already opts out', async () => {
            const messages = await report(
                'const template = `<kbq-tab-group [useStateSaving]="false"><kbq-tab /></kbq-tab-group>`;\n'
            );

            expect(messages).not.toContain('Tab groups remember the selected tab by default now');
        });

        it('stays quiet when the application drives the selection', async () => {
            const messages = await report(
                'const template = `<kbq-tab-group [(selectedIndex)]="index"><kbq-tab /></kbq-tab-group>`;\n'
            );

            expect(messages).not.toContain('Tab groups remember the selected tab by default now');
        });

        it('reports tabs left without a tabId', async () => {
            const messages = await report('const template = `<kbq-tab-group><kbq-tab /></kbq-tab-group>`;\n');

            expect(messages).toContain('These tabs carry no tabId');
        });

        it('does not report tabs that carry a tabId', async () => {
            const messages = await report(
                'const template = `<kbq-tab-group><kbq-tab tabId="one" /></kbq-tab-group>`;\n'
            );

            expect(messages).not.toContain('These tabs carry no tabId');
        });
    });

    describe('sidebar', () => {
        it('reports a sidebar that never mentions useStateSaving', async () => {
            const messages = await report('const template = `<kbq-sidebar></kbq-sidebar>`;\n');

            expect(messages).toContain('Sidebars remember whether they were open');
        });

        it('stays quiet when the application drives the opened state', async () => {
            const messages = await report('const template = `<kbq-sidebar [opened]="isOpen"></kbq-sidebar>`;\n');

            expect(messages).not.toContain('Sidebars remember whether they were open');
        });
    });

    describe('content panel', () => {
        it('reports a container that never mentions useStateSaving', async () => {
            const messages = await report(
                'const template = `<kbq-content-panel-container></kbq-content-panel-container>`;\n'
            );

            expect(messages).toContain('Content panels remember their width');
        });

        it('reports the container even when opened is bound, because the width is still restored', async () => {
            const messages = await report(
                'const template = `<kbq-content-panel-container [(opened)]="open"></kbq-content-panel-container>`;\n'
            );

            expect(messages).toContain('Content panels remember their width');
        });

        it('reports reading opened off the component', async () => {
            const messages = await report(
                "import { KbqContentPanelContainer } from '@koobiq/components/content-panel';\n" +
                    'export class App { isOpen(panel: KbqContentPanelContainer) { return panel.opened(); } }\n'
            );

            expect(messages).toContain('is now openedInput');
        });

        it('does not report opened written in markup', async () => {
            const messages = await report(
                'const template = `<kbq-content-panel-container [opened]="true"></kbq-content-panel-container>`;\n'
            );

            expect(messages).not.toContain('is now openedInput');
        });
    });

    it('says nothing at all when the project uses none of the three', async () => {
        const messages = await report('export class App {}\n');

        expect(messages).not.toContain('[state-saving-default]');
    });
});
