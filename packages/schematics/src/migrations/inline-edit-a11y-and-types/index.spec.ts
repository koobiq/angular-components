import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'inline-edit-a11y-and-types';

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

    function run(project: string, fix?: boolean) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports the removed focus region sentinel directive', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqFocusRegionItem } from '@koobiq/components/inline-edit';\n" +
                'export class App { item?: KbqFocusRegionItem; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqFocusRegionItem was removed');
    });

    it('reports a value handler typed against the concrete value', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqInlineEditModule } from '@koobiq/components/inline-edit';\n" +
                'export class App { setValueHandler = (value: string) => value; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('takes `(value: unknown) => void`');
    });

    it('reports the new required key of the a11y locale configuration', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqA11yLocaleConfiguration } from '@koobiq/components/core';\n" +
                'export class App { configuration?: KbqA11yLocaleConfiguration; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('gained a required `edit` key');
    });

    it('reports a selector that targeted the host as the tab stop', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const styles = `.kbq-inline-edit[tabindex="0"] { outline: none; }`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer the tab stop');
    });

    describe('modeAsReadonly rename', () => {
        const HOST = "import { KbqInlineEditModule } from '@koobiq/components/inline-edit';\n";

        it('rewrites a read in an inline template and in the class body', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                HOST +
                    '@Component({ template: `<kbq-inline-edit #edit>{{ edit.modeAsReadonly() }}</kbq-inline-edit>` })\n' +
                    'export class App { isEditing = () => this.edit.modeAsReadonly() === "edit"; }\n'
            );

            const tree = await run(first);
            const content = tree.readContent(ts);

            expect(content).not.toContain('modeAsReadonly');
            expect(content).toContain('edit.mode()');
            expect(content).toContain('this.edit.mode() === "edit"');
        });

        it('rewrites a read through a template reference in an external template', async () => {
            const [first] = projects.keys();
            const project = projects.get(first)!;
            const html = `/${project.root}/src/app/inline-edit-host.html`;

            appTree.create(
                html,
                '<kbq-inline-edit #edit="kbqInlineEdit">\n' +
                    '    @if (edit.modeAsReadonly() === "edit") { <span>editing</span> }\n' +
                    '</kbq-inline-edit>\n'
            );

            const tree = await run(first);

            expect(tree.readContent(html)).toContain('edit.mode() === "edit"');
        });

        it('leaves the tree untouched and says what it would change when the fix is off', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();
            const original = HOST + 'export class App { mode = this.edit.modeAsReadonly(); }\n';

            appTree.overwrite(ts, original);

            const tree = await run(first, false);

            expect(tree.readContent(ts)).toBe(original);
            expect(messages.join('\n')).toContain(`would update ${ts}`);
        });

        it('leaves a same-named member alone in a file that never names the inline edit', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(ts, 'export class App { mode = this.other.modeAsReadonly(); }\n');

            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('this.other.modeAsReadonly()');
        });

        it('reports an index read, which it cannot rewrite', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, HOST + "export class App { mode = this.edit['modeAsReadonly'](); }\n");

            await run(first);

            expect(messages.join('\n')).toContain('not a property access');
        });

        it('reports a programmatic subscription to modeChange', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, HOST + 'export class App { s = this.edit.modeChange.subscribe(() => {}); }\n');

            await run(first);

            expect(messages.join('\n')).toContain('`mode` is a model() now');
        });
    });

    it('says nothing at all when the project does not use the inline edit', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { handler = (value: any) => value; }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
