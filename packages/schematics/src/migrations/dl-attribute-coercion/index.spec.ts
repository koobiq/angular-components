import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'dl-attribute-coercion';

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

    function firstHtmlPath(): string {
        const [first] = projects.keys();
        const root = `/${projects.get(first)!.root}/src/app`;

        return appTree.exists(`${root}/app.html`) ? `${root}/app.html` : `${root}/app.component.html`;
    }

    function firstTsPath(): string {
        const [first] = projects.keys();
        const root = `/${projects.get(first)!.root}/src/app`;

        return appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts`;
    }

    async function run(): Promise<Tree> {
        const [first] = projects.keys();

        return runner.runSchematic(SCHEMATIC_NAME, { project: first } satisfies Schema, appTree);
    }

    it('reports a valueless wide attribute without touching the file', async () => {
        const html = firstHtmlPath();
        const source = '<kbq-dl wide><kbq-dt>a</kbq-dt><kbq-dd>b</kbq-dd></kbq-dl>\n';

        appTree.overwrite(html, source);

        expect((await run()).readText(html)).toBe(source);
        expect(messages.join('\n')).toContain('used to pass the empty string');
    });

    it('reports an empty wide the same way as a valueless one', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl wide=""></kbq-dl>\n');

        await run();

        // Byte-for-byte the same value as the valueless form, and the old pattern excluded it.
        expect(messages.join('\n')).toContain('used to pass the empty string');
    });

    it('reports wide="false" as the form whose meaning inverts', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl wide="false"></kbq-dl>\n');

        await run();

        expect(messages.join('\n')).toContain('meaning inverts');
    });

    it('points a valueless vertical at [vertical]="false" rather than deletion', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl vertical></kbq-dl>\n');

        await run();

        // Deleting it hands the decision back to `verticalBreakpoint`, which is not what it used to do.
        expect(messages.join('\n')).toContain('[vertical]="false"');
    });

    it('reports a binding, whose meaning the transform also changes', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl [vertical]="row.vertical"></kbq-dl>\n');

        await run();

        expect(messages.join('\n')).toContain('runs the bound value through a coercion');
    });

    it('reports a two-way binding, which the canonical dtWidth call site uses', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl resizable [(dtWidth)]="width"></kbq-dl>\n');

        await run();

        const logged = messages.join('\n');

        // The name is reported as written, so `[(dtWidth)]` has to be matched in full: stripping the
        // leading `[` and trailing `]` leaves `(dtWidth)`, which matches no input.
        expect(logged).toContain('`[dtWidth]`');
        expect(logged).toContain('runs the bound value through a coercion');
    });

    it('reports the canonical bind- and bindon- spellings', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl bind-wide="a" bindon-dtWidth="b"></kbq-dl>\n');

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('`[wide]`');
        expect(logged).toContain('`[dtWidth]`');
    });

    it('reports an inline template in a .ts file', async () => {
        const ts = firstTsPath();

        appTree.overwrite(
            ts,
            "import { Component } from '@angular/core';\n" +
                "import { KbqDlModule } from '@koobiq/components/dl';\n" +
                '@Component({\n' +
                '    imports: [KbqDlModule],\n' +
                '    template: `<kbq-dl wide></kbq-dl>`\n' +
                '})\n' +
                'export class Demo {}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('used to pass the empty string');
    });

    it('ignores the attribute names inside other attributes and other elements', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(
            html,
            '<kbq-dl class="my-list vertical" title="Very wide list"></kbq-dl>\n' +
                '<kbq-dl-other wide></kbq-dl-other>\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('used to pass the empty string');
    });

    it('leaves a numeric literal alone, because it behaved the same before', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl dtMinWidth="120"></kbq-dl>\n');

        await run();

        // `Math.max(0, '120')` was already 120 - nothing about this call site changed.
        // Anchored on the per-attribute wording: the summary is printed unconditionally and names
        // the same three attributes, so a looser substring would match the footer instead.
        expect(messages.join('\n')).not.toContain('on <kbq-dl> holds a value');
        expect(messages.join('\n')).toContain('0 attribute(s) reported');
    });

    it('reports dtWidth with `null` as its fallback rather than `undefined`', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl resizable dtWidth="abc"></kbq-dl>\n');

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('`dtWidth` on <kbq-dl> holds a value that is not a finite number');
        // The other four widths report `undefined`; `dtWidth` keeps `null` as its "no width" state.
        expect(logged).toContain('it reports `null` now');
        expect(logged).toContain('skipped the clamp against `dtMinWidth`');
    });

    it('reports a numeric attribute that is not a finite number', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl dtMinWidth ddMinWidth="abc"></kbq-dl>\n');

        await run();

        const logged = messages.join('\n');

        expect(logged).toContain('`dtMinWidth` on <kbq-dl> holds a value that is not a finite number');
        expect(logged).toContain('`ddMinWidth` on <kbq-dl> holds a value that is not a finite number');
        expect(logged).toContain('2 attribute(s) reported');
    });

    it('prints the summary once for a consumer', async () => {
        const html = firstHtmlPath();

        appTree.overwrite(html, '<kbq-dl></kbq-dl>\n');

        await run();

        const summary = messages.join('\n');

        expect(summary).toContain('number | undefined');
        expect(summary.match(/number \| undefined/g)!.length).toBe(1);
    });

    it('stays silent for a workspace that does not use the description list', async () => {
        await run();

        expect(messages.join('\n')).not.toContain(`[${SCHEMATIC_NAME}]`);
    });
});
