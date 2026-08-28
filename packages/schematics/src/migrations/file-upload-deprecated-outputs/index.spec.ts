import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'file-upload-deprecated-outputs';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let projects: workspaces.ProjectDefinitionCollection;
    let messages: string[];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;

        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    function paths(project: workspaces.ProjectDefinition) {
        // The exact file names from @schematics/angular:application vary across versions
        // (app.ts vs app.component.ts), so discover them from the tree.
        const root = `/${project.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return { ts, html };
    }

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    describe('templates', () => {
        it('renames (fileQueueChanged) to (filesChange) in an external template', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<kbq-file-upload multiple (fileQueueChanged)="onFilesChange($event)"></kbq-file-upload>\n'
            );

            const updated = (await run(first)).readText(html);

            expect(updated).toBe(
                '<kbq-file-upload multiple (filesChange)="onFilesChange($event)"></kbq-file-upload>\n'
            );
        });

        it('renames (fileQueueChange) to (fileChange) in an external template', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<kbq-file-upload (fileQueueChange)="onFileChange($event)"></kbq-file-upload>\n');

            const updated = (await run(first)).readText(html);

            expect(updated).toBe('<kbq-file-upload (fileChange)="onFileChange($event)"></kbq-file-upload>\n');
        });

        it('renames both bindings inside an inline component template', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component } from '@angular/core';\n\n" +
                    '@Component({\n' +
                    "    selector: 'my-uploads',\n" +
                    '    template: `\n' +
                    '        <kbq-file-upload (fileQueueChange)="onFileChange($event)"></kbq-file-upload>\n' +
                    '        <kbq-file-upload multiple (fileQueueChanged)="onFilesChange($event)"></kbq-file-upload>\n' +
                    '    `\n' +
                    '})\n' +
                    'export class MyUploads {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('(fileChange)="onFileChange($event)"');
            expect(updated).toContain('(filesChange)="onFilesChange($event)"');
            expect(updated).not.toContain('fileQueueChange');
        });
    });

    describe('programmatic access', () => {
        it('renames a .fileQueueChanged property read/subscribe', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component, viewChild } from '@angular/core';\n" +
                    "import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';\n\n" +
                    "@Component({ selector: 'my-uploads', template: '' })\n" +
                    'export class MyUploads {\n' +
                    '    readonly upload = viewChild.required(KbqMultipleFileUploadComponent);\n\n' +
                    '    ngAfterViewInit() {\n' +
                    '        this.upload().fileQueueChanged.subscribe((files) => console.log(files));\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('this.upload().filesChange.subscribe(');
            expect(updated).not.toContain('fileQueueChanged');
        });

        it('renames a .fileQueueChange property read/subscribe', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component, viewChild } from '@angular/core';\n" +
                    "import { KbqSingleFileUploadComponent } from '@koobiq/components/file-upload';\n\n" +
                    "@Component({ selector: 'my-upload', template: '' })\n" +
                    'export class MyUpload {\n' +
                    '    readonly upload = viewChild.required(KbqSingleFileUploadComponent);\n\n' +
                    '    ngAfterViewInit() {\n' +
                    '        this.upload().fileQueueChange.subscribe((file) => console.log(file));\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('this.upload().fileChange.subscribe(');
            expect(updated).not.toContain('fileQueueChange');
        });
    });

    describe('idempotency and no-op', () => {
        it('does not touch a file that already uses the canonical outputs', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<kbq-file-upload multiple (filesChange)="onFilesChange($event)"></kbq-file-upload>\n';

            appTree.overwrite(html, original);

            expect((await run(first)).readText(html)).toBe(original);
        });

        it('running twice does not double-rewrite', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(
                html,
                '<kbq-file-upload multiple (fileQueueChanged)="onFilesChange($event)"></kbq-file-upload>\n'
            );

            const once = (await run(first)).readText(html);

            appTree.overwrite(html, once);

            const twice = (await run(first)).readText(html);

            expect(twice).toBe(once);
        });

        it('does not write when fix is false', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const original = '<kbq-file-upload (fileQueueChange)="onFileChange($event)"></kbq-file-upload>\n';

            appTree.overwrite(html, original);

            expect((await run(first, false)).readText(html)).toBe(original);
        });

        it('logs which files would change when fix is false', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);

            appTree.overwrite(html, '<kbq-file-upload (fileQueueChange)="onFileChange($event)"></kbq-file-upload>\n');

            await run(first, false);

            expect(messages.some((message) => message.includes(`would update ${html}`))).toBe(true);
        });
    });

    describe('near-miss identifiers', () => {
        it('leaves identifiers that only contain the name as a substring untouched', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original =
                'export class Demo {\n' +
                '    onFileQueueChanged(files: unknown[]) {}\n' +
                '    fileQueueChangedAt = Date.now();\n' +
                '    myFileQueueChange = true;\n' +
                '}\n';

            appTree.overwrite(ts, original);

            expect((await run(first)).readText(ts)).toBe(original);
        });

        it('renames a genuine match while leaving a near-miss in the same file untouched', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'export class Demo {\n' +
                    '    fileQueueChangedAt = Date.now();\n\n' +
                    '    ngAfterViewInit() {\n' +
                    '        this.upload.fileQueueChanged.subscribe(() => {});\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('this.upload.filesChange.subscribe(');
            expect(updated).toContain('fileQueueChangedAt = Date.now();');
        });
    });

    describe('skipped directories', () => {
        it('does not touch files under node_modules or dist', async () => {
            const nodeModulesFile = '/node_modules/some-dep/index.ts';
            const distFile = '/dist/app/main.ts';
            const content = '(fileQueueChanged)="onFilesChange($event)"';

            appTree.create(nodeModulesFile, content);
            appTree.create(distFile, content);

            const [first] = projects.keys();

            await run(first);

            expect(appTree.readText(nodeModulesFile)).toBe(content);
            expect(appTree.readText(distFile)).toBe(content);
        });
    });
});
