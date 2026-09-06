import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'radio-name-and-aria';

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

        return {
            ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`,
            scss: `${root}/radio-overrides.scss`
        };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports an [isFocused] binding, which never had an effect and no longer exists', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-radio-button [isFocused]="true" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('isFocused was removed');
    });

    it('reports a radioGroup access, which is nullable now', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqRadioButton } from '@koobiq/components/radio';\n" +
                'export class App { name(r: KbqRadioButton) { return r.radioGroup.name; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqRadioGroup | null');
    });

    it('reports an override of a removed custom property', async () => {
        const [first] = projects.keys();
        const { scss } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.create(scss, '.kbq-radio-button {\n    --kbq-radio-size-big-top: 2px;\n}\n');

        await run(first);

        expect(messages.join('\n')).toContain('custom properties were removed');
    });

    it('reports the behaviour changes that have no call site once a consumer is found', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-radio-group><kbq-radio-button /></kbq-radio-group>`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('used outside a <kbq-radio-group> is independent now');
    });

    it('says nothing at all when the project does not use the radio', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { name(r: any) { return r.radioGroup.name; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[radio-name-and-aria]');
    });
});
