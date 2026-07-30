import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'app-switcher-signals';

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

        return { ts, html };
    }

    function firstProject() {
        const [first] = projects.keys();

        return { name: first, ...paths(projects.get(first)!) };
    }

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    /** A `.ts` file that declares a `KbqAppSwitcherTrigger`-typed field around the given body. */
    const withTrigger = (body: string): string => [
            "import { KbqAppSwitcherTrigger } from '@koobiq/components/app-switcher';",
            '',
            'export class Host {',
            '    trigger: KbqAppSwitcherTrigger;',
            '',
            '    run() {',
            `        ${body}`,
            '    }',
            '}',
            ''
        ].join('\n');

    describe('selectedApp (auto-fixed)', () => {
        it('rewrites a read into a call', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger('const app = this.trigger.selectedApp;'));

            expect((await run(name)).readText(ts)).toContain('const app = this.trigger.selectedApp();');
        });

        it('rewrites a read chained into a property access', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger('console.log(this.trigger.selectedApp.name);'));

            expect((await run(name)).readText(ts)).toContain('this.trigger.selectedApp().name');
        });

        it('rewrites a write into .set()', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger('this.trigger.selectedApp = this.apps[0];'));

            expect((await run(name)).readText(ts)).toContain('this.trigger.selectedApp.set(this.apps[0]);');
        });

        it('rewrites a read on a typed parameter', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                [
                    "import { KbqAppSwitcherTrigger } from '@koobiq/components/app-switcher';",
                    '',
                    'export function current(trigger: KbqAppSwitcherTrigger) {',
                    '    return trigger.selectedApp;',
                    '}',
                    ''
                ].join('\n')
            );

            expect((await run(name)).readText(ts)).toContain('return trigger.selectedApp();');
        });

        it('is idempotent', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger('const app = this.trigger.selectedApp;'));

            const once = (await run(name)).readText(ts);

            appTree.overwrite(ts, once);

            expect((await run(name)).readText(ts)).toBe(once);
        });

        it('leaves a receiver that is not typed as the trigger alone', async () => {
            const { name, ts } = firstProject();
            const original = [
                "import { KbqAppSwitcherApp } from '@koobiq/components/app-switcher';",
                '',
                'export class Host {',
                '    state: { selectedApp?: KbqAppSwitcherApp } = {};',
                '',
                '    run() {',
                '        return this.state.selectedApp;',
                '    }',
                '}',
                ''
            ].join('\n');

            appTree.overwrite(ts, original);

            expect((await run(name)).readText(ts)).toBe(original);
        });
    });

    describe('selectedAppChange → selectedApp', () => {
        it('renames a subscription, since ModelSignal implements OutputRef', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger('this.trigger.selectedAppChange.subscribe((app) => this.log(app));'));

            const updated = (await run(name)).readText(ts);

            expect(updated).toContain('this.trigger.selectedApp.subscribe((app) => this.log(app));');
            expect(updated).not.toContain('selectedAppChange');
        });

        it('does not turn the renamed subscription into a call on a second run', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger('this.trigger.selectedAppChange.subscribe(fn);'));

            const once = (await run(name)).readText(ts);

            appTree.overwrite(ts, once);

            expect((await run(name)).readText(ts)).toBe(once);
        });

        it('leaves .emit() alone and warns instead', async () => {
            const { name, ts } = firstProject();
            const original = withTrigger('this.trigger.selectedAppChange.emit(app);');

            appTree.overwrite(ts, original);

            const messages = collectLogs();

            expect((await run(name)).readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('replace `.emit(v)` with `trigger.selectedApp.set(v)`');
        });
    });

    describe('templates', () => {
        it('rewrites a read through a #ref="kbqAppSwitcher" reference', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<button #switcher="kbqAppSwitcher" kbqAppSwitcher [sites]="sites">Open</button>\n' +
                    '<span>{{ switcher.selectedApp.name }}</span>\n'
            );

            expect((await run(name)).readText(html)).toContain('{{ switcher.selectedApp().name }}');
        });

        it('rewrites the canonical ref- form', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<button ref-switcher="kbqAppSwitcher" kbqAppSwitcher>Open</button>\n' +
                    '<span>{{ switcher.selectedApp }}</span>\n'
            );

            expect((await run(name)).readText(html)).toContain('{{ switcher.selectedApp() }}');
        });

        it('leaves the two-way binding and the output binding untouched', async () => {
            const { name, html } = firstProject();
            const original =
                '<button kbqAppSwitcher [sites]="sites" [(selectedApp)]="app" (selectedAppChange)="onApp($event)">\n' +
                '    Open\n' +
                '</button>\n';

            appTree.overwrite(html, original);

            expect((await run(name)).readText(html)).toBe(original);
        });

        it('does not append a call to an already-migrated write through a ref', async () => {
            const { name, html } = firstProject();
            const original =
                '<button #switcher="kbqAppSwitcher" kbqAppSwitcher></button>\n' +
                '<button (click)="switcher.selectedApp.set(app)">Pick</button>\n';

            appTree.overwrite(html, original);

            expect((await run(name)).readText(html)).toBe(original);
        });

        it('does not touch a ref exported as something else', async () => {
            const { name, html } = firstProject();
            const original =
                '<button #switcher="kbqDropdownTrigger">Open</button>\n<span>{{ switcher.selectedApp }}</span>\n';

            appTree.overwrite(html, original);

            expect((await run(name)).readText(html)).toBe(original);
        });

        it('rewrites reads inside an inline component template', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                [
                    "import { Component } from '@angular/core';",
                    "import { KbqAppSwitcherModule } from '@koobiq/components/app-switcher';",
                    '',
                    '@Component({',
                    "    selector: 'host',",
                    '    imports: [KbqAppSwitcherModule],',
                    '    template: \'<button #s="kbqAppSwitcher" kbqAppSwitcher></button>{{ s.selectedApp }}\'',
                    '})',
                    'export class Host {}',
                    ''
                ].join('\n')
            );

            expect((await run(name)).readText(ts)).toContain('{{ s.selectedApp() }}');
        });
    });

    describe('warnings', () => {
        const warningsFor = async (body: string): Promise<string> => {
            const { name, ts } = firstProject();

            appTree.overwrite(ts, withTrigger(body));

            const messages = collectLogs();

            await run(name);

            return messages.join('\n');
        };

        it('warns that selectedSite changed its value, without rewriting it', async () => {
            const { name, ts } = firstProject();
            const original = withTrigger('const site = this.trigger.selectedSite;');

            appTree.overwrite(ts, original);

            const messages = collectLogs();

            expect((await run(name)).readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('trigger.parsedSelectedSite()');
        });

        it('warns about the removed header and footer members', async () => {
            const messages = await warningsFor('this.trigger.header = tpl;');

            expect(messages).toContain('`KbqAppSwitcherTrigger.header` was removed');
        });

        it('warns about the removed focus-trap members', async () => {
            const messages = await warningsFor('this.popup.updateTrapFocus(true);');

            expect(messages).toContain('`updateTrapFocus()` were removed');
        });

        it('warns about the removed getIcon of the flyout row', async () => {
            const messages = await warningsFor('this.row.getIcon(app.icon);');

            expect(messages).toContain('`KbqAppSwitcherDropdownApp.getIcon()` was removed');
        });

        it('warns that inline icon markup is now sanitized', async () => {
            const { name, ts } = firstProject();

            appTree.overwrite(
                ts,
                [
                    "import { KbqAppSwitcherSite } from '@koobiq/components/app-switcher';",
                    '',
                    'export class Host {',
                    '    sites: KbqAppSwitcherSite[] = [',
                    "        { id: 1, name: 'One', apps: [{ id: 1, name: 'App', icon: '<svg></svg>' }] }",
                    '    ];',
                    '}',
                    ''
                ].join('\n')
            );

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('sanitized against a strict SVG allow-list');
        });

        it('warns about a selectedSite read through a template reference variable', async () => {
            const { name, html } = firstProject();

            appTree.overwrite(
                html,
                '<button #switcher="kbqAppSwitcher" kbqAppSwitcher></button>\n' +
                    '<span>{{ switcher.selectedSite.name }}</span>\n'
            );

            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('`selectedSite` is now a `model()`');
        });

        it('prints the behaviour note once per run', async () => {
            const { name } = firstProject();
            const messages = collectLogs();

            await run(name);

            expect(messages.join('\n')).toContain('KbqAppSwitcherModule no longer provides FocusTrapFactory');
        });
    });

    describe('dry run', () => {
        it('reports what would change without writing', async () => {
            const { name, ts } = firstProject();
            const original = withTrigger('const app = this.trigger.selectedApp;');

            appTree.overwrite(ts, original);

            const messages = collectLogs();
            const tree = await run(name, false);

            expect(tree.readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('run with --fix to apply');
        });
    });

    describe('scoping', () => {
        it('leaves files of another project untouched', async () => {
            const [first, second] = projects.keys();
            const secondPaths = paths(projects.get(second)!);
            const original = withTrigger('const app = this.trigger.selectedApp;');

            appTree.overwrite(secondPaths.ts, original);
            appTree.overwrite(paths(projects.get(first)!).ts, original);

            const tree = await run(first);

            expect(tree.readText(secondPaths.ts)).toBe(original);
            expect(tree.readText(paths(projects.get(first)!).ts)).not.toBe(original);
        });

        it('skips a file that never mentions the app-switcher', async () => {
            const { name, ts } = firstProject();
            const original = 'export class Host {\n    selectedApp = 1;\n}\n';

            appTree.overwrite(ts, original);

            expect((await run(name)).readText(ts)).toBe(original);
        });
    });
});
