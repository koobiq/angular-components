import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'file-upload-cva-and-primitives';

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

    it('reports a remove() call, whose return value is now the opposite array', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqFileList } from '@koobiq/components/file-upload';\n" +
                'export class App { drop(list: KbqFileList<unknown>, item: unknown) { return list.remove(item); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('follows its documented contract now');
    });

    it('reports a removed member', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqMultipleFileUploadComponent } from '@koobiq/components/file-upload';\n" +
                'export class App { focused(u: KbqMultipleFileUploadComponent) { return u.hasFocus; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('hasFocus was removed');
    });

    it('reports an output binding that no longer fires for a programmatic write', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-multiple-file-upload (filesChange)="upload($event)" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer emits (fileChange)/(filesChange)');
    });

    it('reports the deprecated locale interface', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqInputFileMultipleLabel } from '@koobiq/components/file-upload';\n" +
                'export const labels: Partial<KbqInputFileMultipleLabel> = {};\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('deprecated in favour of KbqMultipleFileUploadLocaleConfiguration');
    });

    it('reports multiple set on the single uploader', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-single-file-upload multiple [accept]="types" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('no longer forwards `multiple`');
    });

    // The file reaches the component only through the import path: `KbqDropzoneData` names none of the
    // types the consumer regex matches, so a per-pattern anchor used to drop this file silently.
    it('reports a consumer that names no file-upload type', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqDropzoneData } from '@koobiq/components/file-upload';\n" +
                'export class App { config: KbqDropzoneData = {}; drop(list: any, item: unknown) ' +
                '{ return list.remove(item); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('follows its documented contract now');
    });

    it('says nothing at all when the project does not use the file-upload', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { drop(list: any, item: unknown) { return list.remove(item); } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[file-upload-cva-and-primitives]');
    });
});
