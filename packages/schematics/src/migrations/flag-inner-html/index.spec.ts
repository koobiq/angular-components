import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'flag-inner-html';

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

    /** Writes the markup to a file of its own, so the spec does not depend on the app's file names. */
    function writeTemplate(project: workspaces.ProjectDefinition, name: string, content: string): string {
        const filePath = `/${project.root}/src/app/${name}`;

        appTree.create(filePath, content);

        return filePath;
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('rewrites [innerHTML] on the host to the svg input', async () => {
        const [first] = projects.keys();
        const filePath = writeTemplate(
            projects.get(first)!,
            'flag.html',
            '<kbq-flag decorative [innerHTML]="flag" />\n'
        );

        const tree = await run(first);

        expect(tree.readContent(filePath)).toContain('[svg]="flag"');
        expect(tree.readContent(filePath)).not.toContain('innerHTML');
    });

    it('rewrites a binding spread across several lines', async () => {
        const [first] = projects.keys();
        const filePath = writeTemplate(
            projects.get(first)!,
            'flag-multiline.html',
            '<kbq-flag\n    decorative\n    [innerHTML]="flag"\n></kbq-flag>\n'
        );

        const tree = await run(first);

        expect(tree.readContent(filePath)).toContain('[svg]="flag"');
    });

    it('rewrites an inline template in a .ts file', async () => {
        const [first] = projects.keys();
        const filePath = writeTemplate(
            projects.get(first)!,
            'flag-host.ts',
            'const template = `<kbq-flag [innerHTML]="flag" />`;\n'
        );

        const tree = await run(first);

        expect(tree.readContent(filePath)).toContain('[svg]="flag"');
    });

    it('leaves an [innerHTML] binding on any other element alone', async () => {
        const [first] = projects.keys();
        const markup = '<kbq-flag decorative><span [innerHTML]="flag"></span></kbq-flag>\n';
        const filePath = writeTemplate(projects.get(first)!, 'flag-projected.html', markup);

        const tree = await run(first);

        expect(tree.readContent(filePath)).toBe(markup);
    });

    it('reports the behavior changes that have no call site', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        writeTemplate(projects.get(first)!, 'flag-plain.html', '<kbq-flag decorative />\n');

        await run(first);

        expect(messages.join('\n')).toContain('is now aria-hidden');
        expect(messages.join('\n')).toContain('cropped instead of letterboxed');
    });

    it('says nothing at all when the project does not use the flag', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        writeTemplate(projects.get(first)!, 'no-flag.html', '<span [innerHTML]="flag"></span>\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
