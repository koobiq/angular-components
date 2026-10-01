import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'input-number-surface';

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

    it('reports a read of a member removed with the KbqFormFieldControl surface', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                'export class App { invalid(i: KbqNumberInput) { return i.errorState; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer implements KbqFormFieldControl');
    });

    it('reports the unprefixed validator classes', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { MinValidator } from '@koobiq/components/input';\n");

        await run(first);

        expect(messages.join('\n')).toContain('deprecated aliases of KbqMinValidator');
    });

    it('reports the unprefixed validator providers', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, "import { MAX_VALIDATOR } from '@koobiq/components/input';\n");

        await run(first);

        expect(messages.join('\n')).toContain('KBQ_MAX_VALIDATOR');
    });

    it('reports a native number type on the number input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<input kbqNumberInput type="number" />`;\n');

        await run(first);

        expect(messages.join('\n')).toContain('is reset to type="text"');
    });

    it('reports a read of the removed valueAsNumber prototype patch', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                'export class App { read(e: HTMLInputElement) { return e.valueAsNumber; } }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer redefines HTMLInputElement.prototype.valueAsNumber');
    });

    it('does not report a KbqInput-typed reference, even in a file that also mentions kbqNumberInput', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqInput } from '@koobiq/components/input';\n" +
                "const selector = 'input[kbqNumberInput]';\n" +
                'export class App {\n' +
                '  input: KbqInput;\n' +
                '  get invalid() { return this.input.errorState; }\n' +
                '}\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('no longer implements KbqFormFieldControl');
    });

    it('still reports a member read off a KbqNumberInput-typed reference', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqInput, KbqNumberInput } from '@koobiq/components/input';\n" +
                'export class App {\n' +
                '  input: KbqInput;\n' +
                '  numberInput: KbqNumberInput;\n' +
                '  get invalid() { return this.numberInput.errorState; }\n' +
                '}\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('no longer implements KbqFormFieldControl');
    });

    it('does not report a native type="number" on an unrelated input in the same file', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'const template = `<input kbqNumberInput /><input type="number" />`;\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('is reset to type="text"');
    });

    it('says nothing at all when the project does not use the input', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export class App { invalid(i: any) { return i.errorState; } }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });

    describe('password id namespace', () => {
        it('reports a selector keyed on a generated password id', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                '@Component({ template: `<input kbqInputPassword />`, styles: `#kbq-input-3 { color: red; }` })\n' +
                    'export class App {}\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('kbq-input-password- namespace');
        });

        it('does not report a file that never names the password directive', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                '@Component({ template: `<input kbqNumberInput />`, styles: `#kbq-input-3 { color: red; }` })\n' +
                    'export class App {}\n'
            );

            await run(first);

            expect(messages.join('\n')).not.toContain('kbq-input-password- namespace');
        });
    });

    describe('signal members', () => {
        it('rewrites reads on a KbqNumberInput-typed receiver to calls', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                    'export class App {\n' +
                    '    bounds(i: KbqNumberInput) { return [i.min, i.max, i.step, i.bigStep]; }\n' +
                    '}\n'
            );

            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('return [i.min(), i.max(), i.step(), i.bigStep()]');
        });

        it('leaves the same member names on an unrelated receiver alone', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                    'export class App {\n' +
                    '    range = { min: 0, max: 10 };\n' +
                    '    read() { return this.range.min + this.range.max; }\n' +
                    '}\n'
            );

            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('return this.range.min + this.range.max;');
        });

        it('is idempotent — a second run does not double the call', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                    'export class App { bounds(i: KbqNumberInput) { return i.min; } }\n'
            );

            await run(first);
            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('return i.min();');
            expect(tree.readContent(ts)).not.toContain('i.min()()');
        });

        it('rewrites reads through an exportAs template reference', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                '@Component({ template: `<input kbqNumberInput #ref="kbqNumberInput" />{{ ref.max }}` })\n' +
                    'export class App {}\n'
            );

            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('{{ ref.max() }}');
        });

        it('leaves a template binding untouched', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                '@Component({ template: `<input kbqNumberInput [min]="min" big-step="2" />` })\n' +
                    'export class App { min = 3; }\n'
            );

            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('[min]="min" big-step="2"');
        });

        it('reports a write instead of rewriting it', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                    'export class App { clamp(i: KbqNumberInput) { i.min = 0; } }\n'
            );

            const tree = await run(first);

            expect(tree.readContent(ts)).toContain('i.min = 0;');
            expect(messages.join('\n')).toContain('read-only input() and cannot be assigned');
        });

        it('reports .emit() on the members that became Subjects', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                    'export class App { push(i: KbqNumberInput) { i.valueChange.emit(1); } }\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('.emit() becomes .next()');
        });

        it('writes nothing when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const source =
                "import { KbqNumberInput } from '@koobiq/components/input';\n" +
                'export class App { bounds(i: KbqNumberInput) { return i.min; } }\n';

            appTree.overwrite(ts, source);

            const tree = await runner.runSchematic(
                SCHEMATIC_NAME,
                { project: first, fix: false } satisfies Schema,
                appTree
            );

            expect(tree.readContent(ts)).toBe(source);
        });
    });
});
