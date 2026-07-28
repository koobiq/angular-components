import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'dropdown-demote-overlay';

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

        return { ts, html, scss: `/${project.root}/src/styles.scss` };
    }

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    describe('templates', () => {
        it('removes a static demoteOverlay attribute written on its own line', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<button\n' +
                    '    kbq-button\n' +
                    '    demoteOverlay="false"\n' +
                    '    [kbqDropdownTriggerFor]="menu"\n' +
                    '>\n' +
                    '    Open\n' +
                    '</button>\n'
            );

            const updated = (await run(first)).readText(html);

            expect(updated).not.toContain('demoteOverlay');
            expect(updated).toBe(
                '<button\n' +
                    '    kbq-button\n' +
                    '    [kbqDropdownTriggerFor]="menu"\n' +
                    '>\n' +
                    '    Open\n' +
                    '</button>\n'
            );
        });

        it('removes an inline property binding without touching neighbouring attributes', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="false">Open</button>\n');

            const updated = (await run(first)).readText(html);

            expect(updated).toBe('<button [kbqDropdownTriggerFor]="menu">Open</button>\n');
        });

        it('removes a bare demoteOverlay attribute placed before the closing bracket', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<button [kbqDropdownTriggerFor]="menu" demoteOverlay>Open</button>\n');

            const updated = (await run(first)).readText(html);

            expect(updated).toBe('<button [kbqDropdownTriggerFor]="menu">Open</button>\n');
        });

        it('does not touch an attribute whose name merely starts with demoteOverlay', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<button [demoteOverlayMode]="mode">Open</button>\n';

            appTree.overwrite(html, original);

            expect((await run(first)).readText(html)).toBe(original);
        });

        it('removes the binding from an inline template', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { Component } from "@angular/core";\n' +
                    '@Component({\n' +
                    '    template: `\n' +
                    '        <button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="false">Open</button>\n' +
                    '    `\n' +
                    '})\n' +
                    'export class App {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('<button [kbqDropdownTriggerFor]="menu">Open</button>');
            expect(updated).not.toContain('demoteOverlay');
        });
    });

    describe('TypeScript outside templates', () => {
        it('leaves a forwarding class member alone while removing its template binding', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { Component, Input } from "@angular/core";\n' +
                    '@Component({\n' +
                    '    template: `\n' +
                    '        <button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="demoteOverlay">Open</button>\n' +
                    '    `\n' +
                    '})\n' +
                    'export class App {\n' +
                    '    @Input() demoteOverlay = false;\n' +
                    '}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('@Input() demoteOverlay = false;');
            expect(updated).toContain('<button [kbqDropdownTriggerFor]="menu">Open</button>');
        });

        it('removes the KBQ_DROPDOWN_HOST provider, its import and the emptied providers array', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { Component } from "@angular/core";\n' +
                    "import { KBQ_DROPDOWN_HOST } from '@koobiq/components/dropdown';\n" +
                    '@Component({\n' +
                    "    selector: 'my-header',\n" +
                    '    providers: [{ provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }],\n' +
                    '    template: ``\n' +
                    '})\n' +
                    'export class MyHeader {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).not.toContain('KBQ_DROPDOWN_HOST');
            expect(updated).not.toContain('providers');
            expect(updated).toContain("selector: 'my-header'");
            expect(updated).toContain('template: ``');
        });

        it('keeps sibling providers and the rest of the import clause', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_DROPDOWN_HOST, KbqDropdownModule } from '@koobiq/components/dropdown';\n" +
                    '@Component({\n' +
                    '    providers: [OtherService, { provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }],\n' +
                    '    template: ``\n' +
                    '})\n' +
                    'export class MyHeader {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain("import { KbqDropdownModule } from '@koobiq/components/dropdown';");
            expect(updated).toContain('providers: [OtherService]');
            expect(updated).not.toContain('KBQ_DROPDOWN_HOST');
        });

        it('keeps the blank line that follows the dropped import line', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component } from '@angular/core';\n" +
                    "import { KBQ_DROPDOWN_HOST } from '@koobiq/components/dropdown';\n" +
                    '\n' +
                    '@Component({\n' +
                    '    providers: [OtherService, { provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }],\n' +
                    '    template: ``\n' +
                    '})\n' +
                    'export class MyHeader {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain("import { Component } from '@angular/core';\n\n@Component({");
        });

        it('drops a multi-line providers array the removal emptied, without eating the next property', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_DROPDOWN_HOST } from '@koobiq/components/dropdown';\n" +
                    '@Component({\n' +
                    "    selector: 'my-header',\n" +
                    '    providers: [\n' +
                    '        { provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }\n' +
                    '    ],\n' +
                    '    changeDetection: ChangeDetectionStrategy.OnPush\n' +
                    '})\n' +
                    'export class MyHeader {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain(
                "    selector: 'my-header',\n    changeDetection: ChangeDetectionStrategy.OnPush\n"
            );
            expect(updated).not.toContain('providers');
        });
    });

    describe('warnings', () => {
        it('warns about programmatic demoteOverlay access it cannot rewrite', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                'export class App {\n    toggle() {\n        this.trigger.demoteOverlay = false;\n    }\n}\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('KbqDropdownTrigger.demoteOverlay was removed');
        });

        it('warns about a dead cdk-overlay-container_dropdown style override', async () => {
            const [first] = projects.keys();
            const { scss } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(scss, '.cdk-overlay-container.cdk-overlay-container_dropdown {\n    z-index: 1000;\n}\n');

            await run(first);

            expect(messages.join('\n')).toContain('.cdk-overlay-container_dropdown class is no longer applied');
        });

        it('does not warn about a usage it already auto-fixed', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KBQ_DROPDOWN_HOST } from '@koobiq/components/dropdown';\n" +
                    '@Component({\n' +
                    '    providers: [{ provide: KBQ_DROPDOWN_HOST, useExisting: MyHeader }],\n' +
                    '    template: ``\n' +
                    '})\n' +
                    'export class MyHeader {}\n'
            );

            await run(first);

            expect(messages.join('\n')).not.toContain('KBQ_DROPDOWN_HOST was removed');
        });

        it('always reports the layering behaviour change', async () => {
            const [first] = projects.keys();
            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('Layering behaviour changed');
        });
    });

    describe('dry run', () => {
        it('reports without writing when fix is false', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="false">Open</button>\n';
            const messages = collectLogs();

            appTree.overwrite(html, original);

            const result = await run(first, false);

            expect(result.readText(html)).toBe(original);
            expect(messages.join('\n')).toContain('would update');
        });
    });

    it('leaves the second project untouched when scoped to the first', async () => {
        const [first, second] = projects.keys();
        const { html: firstHtml } = paths(projects.get(first)!);
        const { html: secondHtml } = paths(projects.get(second)!);
        const original = '<button [kbqDropdownTriggerFor]="menu" [demoteOverlay]="false">Open</button>\n';

        appTree.overwrite(firstHtml, original);
        appTree.overwrite(secondHtml, original);

        const result = await run(first);

        expect(result.readText(firstHtml)).not.toContain('demoteOverlay');
        expect(result.readText(secondHtml)).toBe(original);
    });
});
