import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'toast-stack-and-defaults';

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
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return { ts, html };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports a subclass of KbqToastComponent', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            'export class MyToast extends KbqToastComponent {\n' +
                '    ok() {\n' +
                '        this.service.hide(this.id);\n' +
                '    }\n' +
                '}\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('inject(KBQ_TOAST_STACK)');
    });

    it('reports a replayed read of the animation subject', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export const last = toastService.animation.getValue();\n');

        await run(first);

        expect(messages.join('\n')).toContain('plain Subject<AnimationEvent>');
    });

    it('reports a read of a removed member through the toasts getter', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export const stop = () => (service.toasts[0].instance.ttl = 0);\n');

        await run(first);

        expect(messages.join('\n')).toContain('lifetime of a toast is owned by the service');
    });

    it('reports the changed template context of showTemplate', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const { ref } = service.showTemplate(data, template, 0);\n');

        await run(first);

        expect(messages.join('\n')).toContain('EmbeddedViewRef<KbqToastTemplateContext>');
    });

    it('reports a template reference variable on a toast', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(html, '<kbq-toast #toast>{{ toast.style }}</kbq-toast>\n');

        await run(first);

        expect(messages.join('\n')).toContain('became protected');
    });

    it('does not report a toast container as a toast', async () => {
        const [first] = projects.keys();
        const { html } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(html, '<kbq-toast-container />\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('became protected');
    });

    it('leaves every file untouched', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const source = 'export class MyToast extends KbqToastComponent {}\n';

        appTree.overwrite(ts, source);

        expect((await run(first)).readText(ts)).toBe(source);
    });

    it('prints the behaviour note once per run', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        await run(first);

        const note = messages.join('\n');

        expect(note).toContain('no longer written to');
        expect(note).toContain('toastRegion');
    });
});
