import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'modal-signals';

const MODAL_IMPORT = "import { KbqModalComponent, KbqModalService } from '@koobiq/components/modal';\n";

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
        const root = `/${project.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return { ts, html };
    }

    async function run(fix: boolean = true): Promise<Tree> {
        const [first] = projects.keys();

        return runner.runSchematic(SCHEMATIC_NAME, { project: first, fix } satisfies Schema, appTree);
    }

    function tsPath(): string {
        const [first] = projects.keys();

        return paths(projects.get(first)!).ts;
    }

    function htmlPath(): string {
        const [first] = projects.keys();

        return paths(projects.get(first)!).html;
    }

    it('rewrites reads on a receiver typed KbqModalComponent', async () => {
        appTree.overwrite(
            tsPath(),
            MODAL_IMPORT +
                'class Demo {\n' +
                '    read(modal: KbqModalComponent) {\n' +
                '        return [modal.kbqVisible, modal.kbqTitle, modal.kbqSize, modal.kbqMaskClosable];\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(tsPath());

        expect(updated).toContain('modal.kbqVisible()');
        expect(updated).toContain('modal.kbqTitle()');
        expect(updated).toContain('modal.kbqSize()');
        expect(updated).toContain('modal.kbqMaskClosable()');
    });

    it('turns a write to kbqVisible into .set(), because it is the one model()', async () => {
        appTree.overwrite(
            tsPath(),
            MODAL_IMPORT +
                'class Demo {\n' +
                '    show(modal: KbqModalComponent) {\n' +
                '        modal.kbqVisible = true;\n' +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(tsPath())).toContain('modal.kbqVisible.set(true);');
    });

    it('leaves a write to a read-only input alone, so it becomes a compile error', async () => {
        appTree.overwrite(
            tsPath(),
            MODAL_IMPORT +
                'class Demo {\n' +
                '    rename(modal: KbqModalComponent) {\n' +
                "        modal.kbqTitle = 'Renamed';\n" +
                '    }\n' +
                '}\n'
        );

        expect((await run()).readText(tsPath())).toContain("modal.kbqTitle = 'Renamed';");
    });

    it('rewrites reads through a #ref on a kbq-modal element', async () => {
        appTree.overwrite(htmlPath(), '<kbq-modal #dialog />\n<span>{{ dialog.kbqTitle }}</span>\n');
        appTree.overwrite(tsPath(), MODAL_IMPORT + 'class Demo {}\n');

        expect((await run()).readText(htmlPath())).toContain('dialog.kbqTitle()');
    });

    it('reports the renamed decision handler without rewriting it', async () => {
        appTree.overwrite(
            tsPath(),
            MODAL_IMPORT +
                'class Demo {\n' +
                '    open(modal: KbqModalService) {\n' +
                "        modal.create({ kbqOnOk: () => console.log('ok') });\n" +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(tsPath());

        // Reported rather than rewritten: `kbqOnOk` is still a valid output name, so the key only
        // moves in an options object and an input binding.
        expect(updated).toContain('kbqOnOk:');
        expect(messages.join('\n')).toContain('kbqOkClick');
    });

    it('reports a read behind KbqModalRef.getInstance(), which it cannot resolve', async () => {
        appTree.overwrite(
            tsPath(),
            MODAL_IMPORT +
                'class Demo {\n' +
                '    open(service: KbqModalService) {\n' +
                '        return service.create().getInstance().kbqVisible;\n' +
                '    }\n' +
                '}\n'
        );

        const updated = (await run()).readText(tsPath());

        expect(updated).toContain('getInstance().kbqVisible;');
        expect(messages.join('\n')).toContain('getInstance()');
    });

    it('reports the removed okText/cancelText getters', async () => {
        appTree.overwrite(
            tsPath(),
            MODAL_IMPORT +
                'class Demo {\n' +
                '    label(modal: KbqModalComponent) {\n' +
                '        return modal.okText;\n' +
                '    }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('okText');
    });

    it('writes nothing when fix is false', async () => {
        const source =
            MODAL_IMPORT +
            'class Demo {\n' +
            '    read(modal: KbqModalComponent) {\n' +
            '        return modal.kbqTitle;\n' +
            '    }\n' +
            '}\n';

        appTree.overwrite(tsPath(), source);

        expect((await run(false)).readText(tsPath())).toBe(source);
    });
});
