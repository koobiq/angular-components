import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'dropdown-signals';

const DROPDOWN_IMPORT =
    "import { KbqDropdown, KbqDropdownItem, KbqDropdownTrigger } from '@koobiq/components/dropdown';\n";

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

    describe('panel members', () => {
        it('rewrites reads on a receiver typed KbqDropdown', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    read(panel: KbqDropdown) {\n' +
                    '        return [panel.xPosition, panel.items, panel.hasBackdrop, panel.templateRef];\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain('panel.xPosition()');
            expect(updated).toContain('panel.items()');
            expect(updated).toContain('panel.hasBackdrop()');
            expect(updated).toContain('panel.templateRef()');
        });

        it('turns a write to a model() member into .set()', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    position(panel: KbqDropdown) {\n' +
                    "        panel.xPosition = 'before';\n" +
                    '        panel.overlapTriggerY = true;\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain("panel.xPosition.set('before');");
            expect(updated).toContain('panel.overlapTriggerY.set(true);');
        });

        it('leaves a write to a read-only input alone, so it becomes a compile error', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    hide(panel: KbqDropdown) {\n' +
                    '        panel.hasBackdrop = false;\n' +
                    '    }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('panel.hasBackdrop = false;');
        });
    });

    describe('trigger and item members', () => {
        it('rewrites reads scoped to the type that declares them', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    read(trigger: KbqDropdownTrigger, item: KbqDropdownItem) {\n' +
                    '        return [trigger.dropdown, trigger.restoreFocus, item.disabled, item.icon];\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain('trigger.dropdown()');
            expect(updated).toContain('trigger.restoreFocus()');
            expect(updated).toContain('item.disabled()');
            expect(updated).toContain('item.icon()');
        });

        it('does not rewrite a member on a type that does not own it', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    read(item: KbqDropdownItem) {\n' +
                    '        return item.xPosition;\n' +
                    '    }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('return item.xPosition;');
        });

        it('turns the navbar-style writes into .set()', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    shift(trigger: KbqDropdownTrigger) {\n' +
                    '        trigger.offsetX = -8;\n' +
                    '        trigger.openByArrowDown = false;\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain('trigger.offsetX.set(-8);');
            expect(updated).toContain('trigger.openByArrowDown.set(false);');
        });
    });

    describe('templates', () => {
        it('rewrites reads through a bare reference on <kbq-dropdown>', async () => {
            appTree.overwrite(htmlPath(), '<kbq-dropdown #panel />{{ panel.xPosition }}');

            expect((await run()).readText(htmlPath())).toContain('{{ panel.xPosition() }}');
        });

        it('rewrites reads through an exportAs reference on a trigger', async () => {
            appTree.overwrite(
                htmlPath(),
                '<button #t="kbqDropdownTrigger" [kbqDropdownTriggerFor]="panel">go</button>{{ t.restoreFocus }}'
            );

            expect((await run()).readText(htmlPath())).toContain('{{ t.restoreFocus() }}');
        });

        it('leaves the input bindings alone, because the aliases did not change', async () => {
            const source = '<kbq-dropdown [xPosition]="\'before\'" [panelWidth]="200" class="wide" />';

            appTree.overwrite(htmlPath(), source);

            expect((await run()).readText(htmlPath())).toBe(source);
        });
    });

    describe('reporting', () => {
        it('reports QueryList usage on items', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    watch(panel: KbqDropdown) {\n' +
                    '        return panel.items.changes;\n' +
                    '    }\n' +
                    '}\n'
            );

            await run();

            expect(messages.join('\n')).toContain('not a `QueryList`');
        });

        it('reports an operator chain on closed', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    watch(panel: KbqDropdown) {\n' +
                    '        return panel.closed.pipe();\n' +
                    '    }\n' +
                    '}\n'
            );

            await run();

            expect(messages.join('\n')).toContain('outputToObservable');
        });

        it('reports a custom panel implementation', async () => {
            appTree.overwrite(
                tsPath(),
                "import { KbqDropdownPanel } from '@koobiq/components/dropdown';\n" +
                    'class CustomPanel implements KbqDropdownPanel {}\n'
            );

            await run();

            expect(messages.join('\n')).toContain('Every member of `KbqDropdownPanel` changed shape');
        });

        it('reports classList becoming protected', async () => {
            appTree.overwrite(
                tsPath(),
                DROPDOWN_IMPORT +
                    'class Demo {\n' +
                    '    read(panel: KbqDropdown) {\n' +
                    '        return panel.classList;\n' +
                    '    }\n' +
                    '}\n'
            );

            await run();

            expect(messages.join('\n')).toContain('classList');
            expect(messages.join('\n')).toContain('derived state now');
        });

        it('stays silent for a project that does not use the dropdown', async () => {
            appTree.overwrite(tsPath(), 'export class Demo {}\n');
            appTree.overwrite(htmlPath(), '<p>nothing here</p>');

            await run();

            expect(messages.join('\n')).not.toContain('[dropdown-signals]');
        });
    });

    it('is idempotent', async () => {
        appTree.overwrite(
            tsPath(),
            DROPDOWN_IMPORT +
                'class Demo {\n' +
                '    read(panel: KbqDropdown) {\n' +
                '        return panel.items;\n' +
                '    }\n' +
                '}\n'
        );

        const once = (await run()).readText(tsPath());

        expect(once).toContain('panel.items()');
        expect((await run()).readText(tsPath())).toBe(once);
    });
});
