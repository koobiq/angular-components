import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'clamped-text-disclosure';

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

    it('reports an aria-expanded read off the container', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-clamped-text aria-expanded="true">text</kbq-clamped-text>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('aria-expanded is no longer rendered');
    });

    it('reports a stylesheet that overrides the borrowed toggle class', async () => {
        const [first] = projects.keys();
        const styles = `/${projects.get(first)!.root}/src/styles.scss`;
        const messages = collectLogs();

        appTree.overwrite(styles, '.kbq-clamped-list__trigger.kbq-clamped-text__toggle { margin-top: 0; }\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer carries the kbq-clamped-text__toggle class');
    });

    it('reports a hand-written role on the trigger', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<a kbqClampedListTrigger role="button">more</a>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('supplies role="button" and tabindex="0" itself');
    });

    it('reports an isCollapsedChange handler on the clamped text', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-clamped-text (isCollapsedChange)="sync($event)" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('reports user intent only');
    });

    it('leaves the clamped list two-way channel alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<div kbqClampedList (isCollapsedChange)="sync($event)"></div>`;\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('reports user intent only');
    });

    it('reports a write to hasToggle and a read of the view queries', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqClampedText } from '@koobiq/components/clamped-text';\n" +
                'export class App {\n' +
                '    hide(t: KbqClampedText) { t.hasToggle.set(false); }\n' +
                '    box(t: KbqClampedText) { return t.textContainer().nativeElement; }\n' +
                '}\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('hasToggle is a read-only Signal now');
        expect(messages.join('\n')).toContain('are protected');
    });

    it('says nothing at all when the project does not use the package', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { toggle(x: any) { return x.hasToggle.set(false); } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[clamped-text-disclosure]');
    });
});
