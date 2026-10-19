import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tabs-signals-and-aria';

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;
    let project: string;
    let file: string;
    let messages: string[];

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner, { style: 'scss' });

        const projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;

        [project] = projects.keys();
        file = `/${projects.get(project)!.root}/src/app/tabs.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = async (content: string, at = file): Promise<string> => {
        appTree.create(at, content);
        await runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

        return messages.join('\n');
    };

    describe('signal inputs and queries', () => {
        it('reports a subclass of a tabs class', async () => {
            const log = await run(
                "import { KbqTab } from '@koobiq/components/tabs';\n" + 'export class MyTab extends KbqTab {}\n'
            );

            expect(log).toContain('A subclass of a Koobiq tabs class whose inputs became signal inputs');
            expect(log).not.toContain('declares a decorator query');
        });

        it('reports a subclass that redeclares a query', async () => {
            const log = await run(
                "import { ContentChildren, QueryList } from '@angular/core';\n" +
                    "import { KbqTab, KbqTabGroup } from '@koobiq/components/tabs';\n" +
                    'export class MyTabGroup extends KbqTabGroup {\n' +
                    '    @ContentChildren(KbqTab) override tabs: QueryList<KbqTab>;\n' +
                    '}\n'
            );

            expect(log).toContain('declares a decorator query');
        });

        it('reports a direct call of ngOnChanges', async () => {
            const log = await run(
                "import { SimpleChange } from '@angular/core';\n" +
                    "import { KbqTab } from '@koobiq/components/tabs';\n" +
                    'export function poke(t: KbqTab) { t.ngOnChanges({ disabled: new SimpleChange(false, true, false) }); }\n'
            );

            expect(log).toContain('A direct call of ngOnChanges');
        });

        it('does not report super.ngOnChanges', async () => {
            const log = await run(
                "import { SimpleChanges } from '@angular/core';\n" +
                    "import { KbqTabLink } from '@koobiq/components/tabs';\n" +
                    'export class MyTabLink extends KbqTabLink {\n' +
                    '    override ngOnChanges(changes: SimpleChanges) { super.ngOnChanges(changes); }\n' +
                    '}\n'
            );

            expect(log).not.toContain('A direct call of ngOnChanges');
        });

        it('reports no call site where the members are only read and written', async () => {
            const log = await run(
                "import { KbqTab, KbqTabGroup } from '@koobiq/components/tabs';\n" +
                    'export function select(g: KbqTabGroup, tab: KbqTab) {\n' +
                    '    g.selectedIndex = 1;\n' +
                    '    g.headerPosition = "below";\n' +
                    '    tab.disabled = tab.disabled === false;\n' +
                    '    return g.tabs.length;\n' +
                    '}\n'
            );

            expect(log).toContain('0 call site(s) reported');
            expect(log).toContain('accepts boolean | string | null | undefined');
        });
    });

    describe('review', () => {
        it('reports a push into the resize stream', async () => {
            const log = await run(
                "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                    'export class App { poke(g: KbqTabGroup) { g.resizeStream.next(new Event("resize")); } }\n'
            );

            expect(log).toContain('resizeStream and the (window:resize) host listener were removed');
        });

        it('reports the group-level disabled attribute in an inline template', async () => {
            const log = await run(
                'const template = `<kbq-tab-group disabled><kbq-tab label="A" /></kbq-tab-group>`;\n'
            );

            expect(log).toContain('KbqTabGroup.disabled was removed');
        });

        it('reports the group-level disabled attribute in an external template', async () => {
            const log = await run(
                '<kbq-tab-group [disabled]="locked"><kbq-tab label="A" /></kbq-tab-group>\n',
                file.replace(/\.ts$/, '.html')
            );

            expect(log).toContain('KbqTabGroup.disabled was removed');
        });

        it('reports the changed getTabIndex signature', async () => {
            const log = await run(
                "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                    'export class App { index(g: KbqTabGroup) { return g.getTabIndex(g.tabs.first, 0); } }\n'
            );

            expect(log).toContain('getTabIndex(tab, tabHeader, index)');
        });

        it('reports the deprecated vertical styler directive', async () => {
            const log = await run("import { KbqVerticalTabsCssStyler } from '@koobiq/components/tabs';\n");

            expect(log).toContain('KbqVerticalTabsCssStyler is a deprecated no-op');
        });

        it('reports a selector on the disabled attribute of a label', async () => {
            const log = await run(
                "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                    "export const label = (host: HTMLElement) => host.querySelector('.kbq-tab-label[disabled]');\n"
            );

            expect(log).toContain('no longer carries a bare `disabled` attribute');
        });

        it('always states the ARIA and tabNavPanel facts, which have no call site to match on', async () => {
            const log = await run('const template = `<kbq-tab-group><kbq-tab label="A" /></kbq-tab-group>`;\n');

            expect(log).toContain('ARIA tabs pattern');
            expect(log).toContain('[tabNavPanel]');
        });
    });

    it('says nothing at all when the project does not use tabs', async () => {
        const log = await run('export class App { poke(s: any) { return s.resizeStream; } }\n');

        expect(log).not.toContain('[tabs-signals-and-aria]');
    });

    it('does not mistake KbqTable for a tabs component', async () => {
        // `KbqTable` is a different component in the same library; a greedy `KbqTab\w*` swallows it.
        const log = await run(
            "import { KbqTable } from '@koobiq/components/table';\n" +
                'export class App { resizeStream = new Subject<Event>(); table?: KbqTable; }\n'
        );

        expect(log).not.toContain('[tabs-signals-and-aria]');
    });
});
