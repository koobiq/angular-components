import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'query-list-signals';

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
        file = `/${projects.get(project)!.root}/src/app/queries.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports a subclass that redeclares a query member', async () => {
        appTree.create(
            file,
            "import { ContentChildren, QueryList } from '@angular/core';\n" +
                "import { KbqOption } from '@koobiq/components/core';\n" +
                "import { KbqSelect } from '@koobiq/components/select';\n" +
                'export class MySelect extends KbqSelect {\n' +
                '    @ContentChildren(KbqOption, { descendants: true }) override options: QueryList<KbqOption>;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('A subclass can no longer redeclare them as fields');
    });

    it('reports a subclass that redeclares a member without a decorator', async () => {
        appTree.create(
            file,
            "import { QueryList } from '@angular/core';\n" +
                "import { KbqRadioButton, KbqRadioGroup } from '@koobiq/components/radio';\n" +
                'export class MyGroup extends KbqRadioGroup {\n' +
                '    declare radios: QueryList<KbqRadioButton>;\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('A subclass can no longer redeclare them as fields');
    });

    it('reports a write to a query member', async () => {
        appTree.create(
            file,
            "import { QueryList } from '@angular/core';\n" +
                "import { KbqTag, KbqTagList } from '@koobiq/components/tags';\n" +
                'export function set(list: KbqTagList) { list.tags = new QueryList<KbqTag>(); }\n'
        );

        await run();

        expect(messages.join('\n')).toContain('are read-only getters now');
    });

    it('reports a code block subclass reading tabLinkTemplate', async () => {
        appTree.create(
            file,
            "import { KbqCodeBlock } from '@koobiq/components/code-block';\n" +
                'export class MyCodeBlock extends KbqCodeBlock {\n' +
                '    get hasTabLink() { return !!this.tabLinkTemplate; }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).toContain('KbqCodeBlock.tabLinkTemplate is a protected signal now');
    });

    it('says nothing when the members are only read', async () => {
        appTree.create(
            file,
            "import { KbqSelect } from '@koobiq/components/select';\n" +
                'export function count(select: KbqSelect) { return select.options.length === select.tags.length; }\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[query-list-signals]');
    });
});
