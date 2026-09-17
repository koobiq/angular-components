import { workspaces } from '@angular-devkit/core';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { SignalMembersConfig, signalMembersRule } from './signal-members-migration';
import { createTestApp } from './testing';

const collectionPath = path.join(__dirname, '../collection.json');

/**
 * A synthetic component, so these tests pin the engine's mechanism rather than any one migration's policy.
 * `Widget` owns two members and `WidgetTrigger` one, which is what proves a read is only rewritten on the
 * type that declares it. `label` is the writable member; `size` and `armed` are read-only inputs.
 */
const config: SignalMembersConfig = {
    label: '[widget-signals]',
    package: '@acme/widgets',
    membersByType: {
        Widget: ['size', 'label'],
        WidgetTrigger: ['armed']
    },
    exportAsToType: { widget: 'Widget', widgetTrigger: 'WidgetTrigger' },
    elementToType: { 'acme-widget': 'Widget' },
    writableMembers: new Set(['label']),
    protectedMembers: ['internals'],
    warnPatterns: [
        {
            anchor: '\\bWidget\\w*\\b',
            pattern: '\\bWidgetHarness\\b',
            message: 'WidgetHarness was removed.'
        }
    ],
    messages: {
        unparseableTemplate: 'This template renders a widget but could not be parsed.',
        unresolvedReceiver: 'Unresolvable widget mention on lines:',
        protectedHint: 'Bind the inputs instead.',
        summary: ['  Widget members are signals now.']
    }
};

describe('signalMembersRule', () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;
    let projects: workspaces.ProjectDefinitionCollection;
    let messages: string[];
    let project: string;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const workspace = await getWorkspace(appTree);

        projects = workspace.projects as unknown as workspaces.ProjectDefinitionCollection;
        [project] = projects.keys();

        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    /**
     * The rule only ever reads `context.logger`, so a stub context is enough — and it keeps the engine
     * testable without registering a throwaway schematic in `collection.json`.
     */
    async function run(fix: boolean = true, overrides: Partial<SignalMembersConfig> = {}): Promise<Tree> {
        const rule = signalMembersRule({ ...config, ...overrides }, { project, fix });

        await rule(appTree, { logger: runner.logger } as unknown as SchematicContext);

        return appTree;
    }

    function paths() {
        const root = `/${projects.get(project)!.root}/src/app`;
        const ts = appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
        const html = appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;

        return { ts, html };
    }

    const tsPath = () => paths().ts;
    const htmlPath = () => paths().html;

    describe('receiver resolution', () => {
        it('rewrites reads on a parameter typed by the component, including an optional chain', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: Widget) {\n' +
                    '        return widget.size ?? widget?.size;\n' +
                    '    }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('widget.size() ?? widget?.size()');
        });

        it('resolves an inject() initializer', async () => {
            appTree.overwrite(
                tsPath(),
                "import { inject } from '@angular/core';\n" +
                    "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    private widget = inject(Widget);\n' +
                    '    read() { return this.widget.size; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('this.widget.size()');
        });

        it('leaves a viewChild() receiver alone, because the read through it needs two calls', async () => {
            appTree.overwrite(
                tsPath(),
                "import { viewChild } from '@angular/core';\n" +
                    "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    private widget = viewChild.required(Widget);\n' +
                    '    read() { return this.widget.size; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('this.widget.size;');
        });

        it('sees through an aliased import', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget as W } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: W) { return widget.size; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('widget.size()');
        });

        it('sees through a non-null assertion and parentheses', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: Widget) { return widget!.size + (widget).size; }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain('widget!.size()');
            expect(updated).toContain('(widget).size()');
        });

        it('does not rewrite a same-named local that shadows the receiver', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: Widget) {\n' +
                    '        const outer = widget.size;\n' +
                    '        {\n' +
                    '            const widget = { size: 1 };\n' +
                    '            return [outer, widget.size];\n' +
                    '        }\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            // Two-sided: the outer read proves resolution ran at all, so the inner one is skipped on
            // purpose rather than because nothing was resolved.
            expect(updated).toContain('const outer = widget.size();');
            expect(updated).toContain('return [outer, widget.size];');
        });

        it('does not rewrite this.widget inside a nested function, where `this` is rebound', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    widget!: Widget;\n' +
                    '    read() {\n' +
                    '        return function (this: any) { return this.widget.size; };\n' +
                    '    }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('this.widget.size;');
        });

        it('rewrites this.widget inside an arrow, where `this` is not rebound', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    widget!: Widget;\n' +
                    '    read() { return () => this.widget.size; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('this.widget.size()');
        });

        it('only rewrites a member on the type that declares it', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget, WidgetTrigger } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: Widget, trigger: WidgetTrigger) {\n' +
                    '        return [widget.armed, trigger.armed, trigger.size];\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain('widget.armed,');
            expect(updated).toContain('trigger.armed()');
            expect(updated).toContain('trigger.size]');
        });
    });

    describe('writes', () => {
        it('turns an assignment to a writable member into .set()', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    write(widget: Widget) { widget.label = "a" + "b"; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('widget.label.set("a" + "b");');
        });

        it('leaves an assignment to a read-only member untouched, so it becomes a compile error', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    write(widget: Widget) { widget.size = 2; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('widget.size = 2;');
        });

        it('leaves a compound assignment to a writable member untouched', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    write(widget: Widget) { widget.label += "x"; }\n' +
                    '}\n'
            );

            expect((await run()).readText(tsPath())).toContain('widget.label += "x";');
        });

        it('leaves increments and destructuring targets untouched', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    write(widget: Widget) {\n' +
                    '        widget.size++;\n' +
                    '        ({ size: widget.size } = { size: 3 });\n' +
                    '    }\n' +
                    '}\n'
            );

            const updated = (await run()).readText(tsPath());

            expect(updated).toContain('widget.size++;');
            expect(updated).toContain('({ size: widget.size } = { size: 3 });');
        });
    });

    describe('idempotence', () => {
        it('leaves an already-migrated read and signal-API call alone', async () => {
            const source =
                "import { Widget } from '@acme/widgets';\n" +
                'class Demo {\n' +
                '    read(widget: Widget) {\n' +
                '        widget.label.set("a");\n' +
                '        return widget.size();\n' +
                '    }\n' +
                '}\n';

            appTree.overwrite(tsPath(), source);

            expect((await run()).readText(tsPath())).toBe(source);
        });

        it('produces the same output when run twice', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: Widget) { return widget.size; }\n' +
                    '}\n'
            );

            const once = (await run()).readText(tsPath());

            expect((await run()).readText(tsPath())).toBe(once);
        });
    });

    describe('templates', () => {
        it('rewrites reads through a bare reference on the component element', async () => {
            appTree.overwrite(htmlPath(), '<acme-widget #w />{{ w.size }}');

            expect((await run()).readText(htmlPath())).toBe('<acme-widget #w />{{ w.size() }}');
        });

        it('rewrites reads through an exportAs reference on a host element', async () => {
            appTree.overwrite(htmlPath(), '<button #t="widgetTrigger">{{ t.armed }}</button>');

            expect((await run()).readText(htmlPath())).toContain('{{ t.armed() }}');
        });

        it('ignores a reference that names a foreign directive', async () => {
            appTree.overwrite(htmlPath(), '<acme-widget #w="cdkOverlayOrigin" />{{ w.size }}');

            expect((await run()).readText(htmlPath())).toContain('{{ w.size }}');
        });

        it('rewrites inside a property binding but not in surrounding prose', async () => {
            appTree.overwrite(htmlPath(), '<acme-widget #w /><div [title]="w.size">w.size</div>');

            const updated = (await run()).readText(htmlPath());

            expect(updated).toContain('[title]="w.size()"');
            expect(updated).toContain('>w.size<');
        });

        it('does not rewrite a reference shadowed by a @for variable', async () => {
            appTree.overwrite(htmlPath(), '<acme-widget #w />@for (w of rows; track w) {{{ w.size }}}');

            expect((await run()).readText(htmlPath())).toContain('{{ w.size }}');
        });

        it('does not rewrite a reference declared in an ng-template from outside it', async () => {
            appTree.overwrite(
                htmlPath(),
                '<ng-template><acme-widget #w />{{ w.size }}</ng-template>{{ w.size }}<acme-widget #v />{{ v.size }}'
            );

            const updated = (await run()).readText(htmlPath());

            // Two-sided again: the sibling `#v` proves the template pass ran, and the read inside the
            // <ng-template> proves the ref works where it is visible.
            expect(updated).toContain('{{ v.size() }}');
            expect(updated).toContain('<acme-widget #w />{{ w.size() }}</ng-template>{{ w.size }}');
        });

        it('rewrites inline templates too', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Component } from '@angular/core';\n" +
                    "@Component({ template: '<acme-widget #w />{{ w.size }}' })\n" +
                    'class Demo {}\n'
            );

            expect((await run()).readText(tsPath())).toContain('{{ w.size() }}');
        });
    });

    describe('reporting', () => {
        it('reports a protected member read through a receiver', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" +
                    'class Demo {\n' +
                    '    read(widget: Widget) { return widget.internals; }\n' +
                    '}\n'
            );

            await run();

            expect(messages.join('\n')).toContain('internals');
            expect(messages.join('\n')).toContain('Bind the inputs instead.');
        });

        it('reports a mention that cannot be scoped to a single receiver', async () => {
            appTree.overwrite(
                tsPath(),
                "import { Widget } from '@acme/widgets';\n" + 'class Demo {\n' + '    all!: Widget[];\n' + '}\n'
            );

            await run();

            expect(messages.join('\n')).toContain('Unresolvable widget mention on lines:');
        });

        it('reports a configured warn pattern only when its anchor is present', async () => {
            appTree.overwrite(tsPath(), 'const a = 1;\nconst b = WidgetHarness;\n');
            await run();
            expect(messages.join('\n')).toContain('WidgetHarness was removed.');

            messages.length = 0;
            appTree.overwrite(tsPath(), "import { Widget } from '@acme/widgets';\nconst c: Widget = null!;\n");
            await run();
            expect(messages.join('\n')).not.toContain('WidgetHarness was removed.');
        });

        it('reports a template it renders the component in but cannot parse', async () => {
            appTree.overwrite(htmlPath(), '<acme-widget #w ><div [x]="(" ></acme-widget>');
            await run();

            expect(messages.join('\n')).toContain('could not be parsed');
        });

        it('stays silent when nothing in the project uses the component', async () => {
            appTree.overwrite(tsPath(), 'export class Demo {}\n');
            appTree.overwrite(htmlPath(), '<p>nothing here</p>');
            await run();

            expect(messages.join('\n')).not.toContain('[widget-signals]');
        });
    });

    describe('fix flag', () => {
        it('reports without writing when fix is false', async () => {
            const source =
                "import { Widget } from '@acme/widgets';\n" +
                'class Demo {\n' +
                '    read(widget: Widget) { return widget.size; }\n' +
                '}\n';

            appTree.overwrite(tsPath(), source);

            const updated = (await run(false)).readText(tsPath());

            expect(updated).toBe(source);
            expect(messages.join('\n')).toContain('run with --fix to apply');
        });
    });
});
