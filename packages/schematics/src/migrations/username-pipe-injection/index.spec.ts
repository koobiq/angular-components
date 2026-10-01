import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'username-pipe-injection';

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

    it('reports an injected KbqUsernamePipe, which no longer resolves', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqUsernamePipe } from '@koobiq/components/username';\n" +
                'export class App { private readonly pipe = inject(KbqUsernamePipe); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('kbqInjectUsernameFormatter()');
    });

    it('reports an injected KbqUsernameCustomPipe', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqUsernameCustomPipe } from '@koobiq/components/username';\n" +
                'export class App { private readonly pipe = inject(KbqUsernameCustomPipe); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('kbqFormatUsernameCustom');
    });

    it('reports a constructor parameter typed as one of the pipes', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqUsernamePipe } from '@koobiq/components/username';\n" +
                'export class App { constructor(private pipe: KbqUsernamePipe) {} }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('resolved through DI');
    });

    it('reports the removed KbqMappingMissingError', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqMappingMissingError } from '@koobiq/components/username';\n" +
                'export class App { fail() { throw KbqMappingMissingError(); } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KbqMappingMissingError is removed');
    });

    it('summarises the rendering changes for a project that only renders the component', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<kbq-username [userInfo]="user" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('only some of the name fields');
    });

    it('says nothing at all when the project does not use the component', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { name(user: any) { return user.login; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('[username-pipe-injection]');
    });
});
