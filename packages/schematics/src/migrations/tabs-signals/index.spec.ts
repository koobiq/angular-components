import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'tabs-signals';

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

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports a subclass of a tabs class', async () => {
        appTree.create(
            file,
            "import { KbqTab } from '@koobiq/components/tabs';\n" + 'export class MyTab extends KbqTab {}\n'
        );

        await run();

        const log = messages.join('\n');

        expect(log).toContain('A subclass of a Koobiq tabs class whose inputs became signal inputs');
        expect(log).not.toContain('declares a decorator query');
        expect(log).toContain('accepts boolean | string | null | undefined');
    });

    it('reports a subclass that redeclares a query', async () => {
        appTree.create(
            file,
            "import { ContentChildren, QueryList } from '@angular/core';\n" +
                "import { KbqTab, KbqTabGroup } from '@koobiq/components/tabs';\n" +
                'export class MyTabGroup extends KbqTabGroup {\n' +
                '    @ContentChildren(KbqTab) override tabs: QueryList<KbqTab>;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('declares a decorator query');
    });

    it('reports a direct call of ngOnChanges, but not super.ngOnChanges', async () => {
        appTree.create(
            file,
            "import { SimpleChange } from '@angular/core';\n" +
                "import { KbqTab } from '@koobiq/components/tabs';\n" +
                'export function poke(t: KbqTab) { t.ngOnChanges({ disabled: new SimpleChange(false, true, false) }); }\n'
        );

        await run();

        expect(messages.join('\n')).toContain('A direct call of ngOnChanges');

        messages = [];
        appTree.overwrite(
            file,
            "import { SimpleChanges } from '@angular/core';\n" +
                "import { KbqTabLink } from '@koobiq/components/tabs';\n" +
                'export class MyTabLink extends KbqTabLink {\n' +
                '    override ngOnChanges(changes: SimpleChanges) { super.ngOnChanges(changes); }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('A direct call of ngOnChanges');
    });

    it('says nothing when the tabs are only used', async () => {
        appTree.create(
            file,
            "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                'export function select(g: KbqTabGroup) { g.selectedIndex = 1; g.headerPosition = "below"; ' +
                'return g.tabs.length; }\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[tabs-signals]');
    });
});
