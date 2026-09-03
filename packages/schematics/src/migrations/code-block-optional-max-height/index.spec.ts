import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'code-block-optional-max-height';

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

    function firstTsPath(): string {
        const [first] = projects.keys();
        const root = `/${projects.get(first)!.root}/src/app`;

        return appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
    }

    async function run(): Promise<Tree> {
        const [first] = projects.keys();

        return runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);
    }

    it('reports a maxHeight read without touching the file', async () => {
        const ts = firstTsPath();
        const source =
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
            'class Demo {\n' +
            '    read(codeBlock: KbqCodeBlock) {\n' +
            '        const height: number = codeBlock.maxHeight();\n' +
            '        return height;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(ts, source);

        expect((await run()).readText(ts)).toBe(source);
        expect(messages.join('\n')).toContain('number | undefined');
    });

    it('reports a write to the highlight file input', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { KbqCodeBlockHighlight } from '@koobiq/components/code-block';\n" +
                'class Demo {\n' +
                '    highlight(directive: KbqCodeBlockHighlight) {\n' +
                "        directive.file = { language: 'ts', content: '' };\n" +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('write-only required input');
    });

    it('prints the summary once for a consumer', async () => {
        const ts = firstTsPath();

        appTree.overwrite(ts, "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" + 'class Demo {}\n');

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('backed by signals');
        expect(summary.match(/backed by signals/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the code block', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
