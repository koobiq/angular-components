import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'locale-configuration-providers';

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

    function run(project: string, fix = true) {
        return runner.runSchematic(SCHEMATIC_NAME, { project, fix } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    describe('provider rewrite', () => {
        it('rewrites a useValue provider of a providers array to the helper call', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component } from '@angular/core';\n" +
                    "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                    '@Component({\n' +
                    "    selector: 'my-page',\n" +
                    '    providers: [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: myStrings }],\n' +
                    '    template: ``\n' +
                    '})\n' +
                    'export class MyPage {}\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toBe(
                "import { Component } from '@angular/core';\n" +
                    "import { kbqFilterBarLocaleConfigurationProvider } from '@koobiq/components/filter-bar';\n" +
                    '@Component({\n' +
                    "    selector: 'my-page',\n" +
                    '    providers: [kbqFilterBarLocaleConfigurationProvider(myStrings)],\n' +
                    '    template: ``\n' +
                    '})\n' +
                    'export class MyPage {}\n'
            );
        });

        it('preserves an object-literal value verbatim, across lines', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_VERTICAL_NAVBAR_CONFIGURATION } from '@koobiq/components/navbar';\n" +
                    'const providers = [\n' +
                    '    {\n' +
                    '        provide: KBQ_VERTICAL_NAVBAR_CONFIGURATION,\n' +
                    '        useValue: {\n' +
                    "            collapse: 'Collapse',\n" +
                    "            expand: 'Expand'\n" +
                    '        }\n' +
                    '    }\n' +
                    '];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain(
                'kbqVerticalNavbarLocaleConfigurationProvider({\n' +
                    "            collapse: 'Collapse',\n" +
                    "            expand: 'Expand'\n" +
                    '        })'
            );
        });

        it('ignores property order and a string-literal provide key', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_APP_SWITCHER_CONFIGURATION } from '@koobiq/components/app-switcher';\n" +
                    "const providers = [{ useValue: strings, 'provide': KBQ_APP_SWITCHER_CONFIGURATION }];\n"
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('const providers = [kbqAppSwitcherLocaleConfigurationProvider(strings)];');
        });

        it('rewrites two different tokens in the same array', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_NOTIFICATION_CENTER_CONFIGURATION } from '@koobiq/components/notification-center';\n" +
                    "import { KBQ_SEARCH_EXPANDABLE_CONFIGURATION } from '@koobiq/components/search-expandable';\n" +
                    'const providers = [\n' +
                    '    { provide: KBQ_NOTIFICATION_CENTER_CONFIGURATION, useValue: notifications },\n' +
                    '    { provide: KBQ_SEARCH_EXPANDABLE_CONFIGURATION, useValue: search }\n' +
                    '];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toBe(
                'import { kbqNotificationCenterLocaleConfigurationProvider } from ' +
                    "'@koobiq/components/notification-center';\n" +
                    'import { kbqSearchExpandableLocaleConfigurationProvider } from ' +
                    "'@koobiq/components/search-expandable';\n" +
                    'const providers = [\n' +
                    '    kbqNotificationCenterLocaleConfigurationProvider(notifications),\n' +
                    '    kbqSearchExpandableLocaleConfigurationProvider(search)\n' +
                    '];\n'
            );
        });

        it('keeps a call expression value intact', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_DATEPICKER_CONFIGURATION } from '@koobiq/components/datepicker';\n" +
                    'const providers = [{ provide: KBQ_DATEPICKER_CONFIGURATION, useValue: buildStrings(locale) }];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain('kbqDatepickerLocaleConfigurationProvider(buildStrings(locale))');
        });

        it('keeps sibling providers and does not reformat the array', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                    'const providers = [\n' +
                    '    A,\n' +
                    '    { provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings },\n' +
                    '    B\n' +
                    '];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain(
                'const providers = [\n' +
                    '    A,\n' +
                    '    kbqFilterBarLocaleConfigurationProvider(strings),\n' +
                    '    B\n' +
                    '];\n'
            );
        });
    });

    describe('imports', () => {
        it('drops the token from a shared clause and keeps the other symbols', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                'import { KBQ_FILTER_BAR_CONFIGURATION, KbqFilterBarModule } from ' +
                    "'@koobiq/components/filter-bar';\n" +
                    'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain(
                'import { KbqFilterBarModule, kbqFilterBarLocaleConfigurationProvider } from ' +
                    "'@koobiq/components/filter-bar';"
            );
            expect(updated).not.toContain('KBQ_FILTER_BAR_CONFIGURATION');
        });

        it('adds the helper to an existing clause of the same module written on another line', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KbqNavbarModule } from '@koobiq/components/navbar';\n" +
                    "import { KBQ_VERTICAL_NAVBAR_CONFIGURATION } from '@koobiq/components/navbar';\n" +
                    'const providers = [{ provide: KBQ_VERTICAL_NAVBAR_CONFIGURATION, useValue: strings }];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toBe(
                'import { KbqNavbarModule, kbqVerticalNavbarLocaleConfigurationProvider } from ' +
                    "'@koobiq/components/navbar';\n" +
                    'const providers = [kbqVerticalNavbarLocaleConfigurationProvider(strings)];\n'
            );
        });

        it('inserts a new import when the module is not imported by name', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import * as filterBar from '@koobiq/components/filter-bar';\n" +
                    'const providers = [{ provide: filterBar.KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n' +
                    'const other = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain(
                "import { kbqFilterBarLocaleConfigurationProvider } from '@koobiq/components/filter-bar';"
            );
            // A namespace access is not an identifier reference the AST pass matches.
            expect(updated).toContain('{ provide: filterBar.KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }');
            expect(updated).toContain('const other = [kbqFilterBarLocaleConfigurationProvider(strings)];');
        });

        it('keeps the token import when another reference to it remains', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                    'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n' +
                    'const defaults = inject(KBQ_FILTER_BAR_CONFIGURATION);\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toContain(
                'import { KBQ_FILTER_BAR_CONFIGURATION, kbqFilterBarLocaleConfigurationProvider } from ' +
                    "'@koobiq/components/filter-bar';"
            );
            expect(updated).toContain('const providers = [kbqFilterBarLocaleConfigurationProvider(strings)];');
        });

        it('keeps the blank line that follows the dropped import line', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { Component } from '@angular/core';\n" +
                    "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                    '\n' +
                    'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n'
            );

            const updated = (await run(first)).readText(ts);

            expect(updated).toBe(
                "import { Component } from '@angular/core';\n" +
                    "import { kbqFilterBarLocaleConfigurationProvider } from '@koobiq/components/filter-bar';\n" +
                    '\n' +
                    'const providers = [kbqFilterBarLocaleConfigurationProvider(strings)];\n'
            );
        });
    });

    describe('warnings', () => {
        it('leaves a useFactory provider alone and reports it', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original =
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useFactory: () => strings }];\n';
            const messages = collectLogs();

            appTree.overwrite(ts, original);

            expect((await run(first)).readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('useFactory provider no longer overrides the active locale');
        });

        it.each(['useClass: StringsFactory', 'useExisting: OTHER_TOKEN'])(
            'leaves a %s provider alone and reports it',
            async (property) => {
                const [first] = projects.keys();
                const { ts } = paths(projects.get(first)!);
                const original =
                    "import { KBQ_APP_SWITCHER_CONFIGURATION } from '@koobiq/components/app-switcher';\n" +
                    `const providers = [{ provide: KBQ_APP_SWITCHER_CONFIGURATION, ${property} }];\n`;
                const messages = collectLogs();

                appTree.overwrite(ts, original);

                expect((await run(first)).readText(ts)).toBe(original);
                expect(messages.join('\n')).toContain('KBQ_APP_SWITCHER_CONFIGURATION is now a defaults-only token');
            }
        );

        // Replacing it would leave the name bound to a Provider instead of an object literal.
        it('leaves a named-const provider alone and reports it', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original =
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n\n" +
                'export const FILTER_BAR_STRINGS = { provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings };\n';
            const messages = collectLogs();

            appTree.overwrite(ts, original);

            expect((await run(first)).readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('It is not an element of a provider array');
        });

        it('reports a token reference the rewrite could not remove only once', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n\n" +
                    'export const FILTER_BAR_STRINGS = { provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings };\n'
            );

            await run(first);

            const log = messages.join('\n');

            expect(log).toContain('It is not an element of a provider array');
            expect(log).not.toContain('KBQ_FILTER_BAR_CONFIGURATION now supplies the defaults only');
        });

        it('reports a leftover inject() of the token', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KBQ_DATEPICKER_CONFIGURATION } from '@koobiq/components/datepicker';\n" +
                    'const defaults = inject(KBQ_DATEPICKER_CONFIGURATION);\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('KBQ_DATEPICKER_CONFIGURATION now supplies the defaults only');
        });

        it('does not warn about a provider it already rewrote', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                    'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n'
            );

            await run(first);

            expect(messages.join('\n')).not.toContain('KBQ_FILTER_BAR_CONFIGURATION');
        });

        it('warns about a read of the removed externalConfiguration member', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(ts, 'export class App {\n    label = this.nav.externalConfiguration.collapse;\n}\n');

            await run(first);

            expect(messages.join('\n')).toContain('The externalConfiguration member was removed');
        });

        it('warns about a write to the now read-only configuration member', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                "import { KbqFilterBar } from '@koobiq/components/filter-bar';\n" +
                    'export class App {\n' +
                    '    bar!: KbqFilterBar;\n' +
                    '    apply() {\n' +
                    '        this.bar.configuration = strings;\n' +
                    '    }\n' +
                    '}\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('is a read-only getter over a signal');
        });

        it('does not warn about a .configuration write in a file unrelated to the components', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                ts,
                'export class App {\n    init() {\n        this.chart.configuration = {};\n    }\n}\n'
            );

            await run(first);

            expect(messages.join('\n')).not.toContain('is a read-only getter over a signal');
        });

        it('warns about an externalConfiguration read in an external template', async () => {
            const [first] = projects.keys();
            const { html } = paths(projects.get(first)!);
            const messages = collectLogs();

            appTree.overwrite(
                html,
                '<kbq-vertical-navbar #nav />\n<span>{{ nav.externalConfiguration.collapse }}</span>\n'
            );

            await run(first);

            expect(messages.join('\n')).toContain('The externalConfiguration member was removed');
        });

        it('always reports the locale resolution change', async () => {
            const [first] = projects.keys();
            const messages = collectLogs();

            await run(first);

            expect(messages.join('\n')).toContain('Locale resolution order changed');
        });
    });

    describe('files it must not touch', () => {
        it('leaves a provider for an unrelated token alone', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original = 'const providers = [{ provide: KBQ_SOME_OTHER_CONFIGURATION, useValue: strings }];\n';

            appTree.overwrite(ts, original);

            expect((await run(first)).readText(ts)).toBe(original);
        });

        it('leaves the token mentioned only in a comment or a string alone', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original =
                '// KBQ_FILTER_BAR_CONFIGURATION used to win over the locale service.\n' +
                "const name = 'KBQ_FILTER_BAR_CONFIGURATION';\n";
            const messages = collectLogs();

            appTree.overwrite(ts, original);

            expect((await run(first)).readText(ts)).toBe(original);
            expect(messages.join('\n')).not.toContain('KBQ_FILTER_BAR_CONFIGURATION now supplies the defaults only');
        });
    });

    describe('ng update entry point', () => {
        it('applies the fix when invoked without options', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                    'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n'
            );

            // `ng update` passes no options, and migrations.json declares no schema, so the
            // schema default never reaches the rule — it has to default `fix` itself.
            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);
            const result = await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(result.readText(ts)).toContain('kbqFilterBarLocaleConfigurationProvider(strings)');
        });
    });

    describe('dry run', () => {
        it('reports without writing when fix is false', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);
            const original =
                "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
                'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n';
            const messages = collectLogs();

            appTree.overwrite(ts, original);

            const result = await run(first, false);

            expect(result.readText(ts)).toBe(original);
            expect(messages.join('\n')).toContain('would update');
        });
    });

    it('leaves the second project untouched when scoped to the first', async () => {
        const [first, second] = projects.keys();
        const { ts: firstTs } = paths(projects.get(first)!);
        const { ts: secondTs } = paths(projects.get(second)!);
        const original =
            "import { KBQ_FILTER_BAR_CONFIGURATION } from '@koobiq/components/filter-bar';\n" +
            'const providers = [{ provide: KBQ_FILTER_BAR_CONFIGURATION, useValue: strings }];\n';

        appTree.overwrite(firstTs, original);
        appTree.overwrite(secondTs, original);

        const result = await run(first);

        expect(result.readText(firstTs)).not.toContain('KBQ_FILTER_BAR_CONFIGURATION');
        expect(result.readText(secondTs)).toBe(original);
    });
});
