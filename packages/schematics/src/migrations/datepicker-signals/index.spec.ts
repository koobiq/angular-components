import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'datepicker-signals';

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
        file = `/${projects.get(project)!.root}/src/app/datepicker.ts`;
        messages = [];
        runner.logger.subscribe((entry) => messages.push(entry.message));
    });

    const run = () => runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);

    it('reports a subclass of a datepicker class', async () => {
        appTree.create(
            file,
            "import { KbqDatepickerInput } from '@koobiq/components/datepicker';\n" +
                'export class MyDateInput<D> extends KbqDatepickerInput<D> {}\n'
        );

        await run();

        const log = messages.join('\n');

        expect(log).toContain('A subclass of a Koobiq datepicker class');
        expect(log).toContain('accepts boolean | string | null | undefined');
    });

    it('reports a direct call of ngOnChanges, but not super.ngOnChanges', async () => {
        appTree.create(
            file,
            "import { SimpleChange } from '@angular/core';\n" +
                "import { KbqCalendar } from '@koobiq/components/datepicker';\n" +
                'export function poke(c: KbqCalendar<Date>) { c.ngOnChanges({ minDate: new SimpleChange(null, 1, false) }); }\n'
        );

        await run();

        expect(messages.join('\n')).toContain('A direct call of ngOnChanges');

        messages = [];
        appTree.overwrite(
            file,
            "import { SimpleChanges } from '@angular/core';\n" +
                "import { KbqCalendar } from '@koobiq/components/datepicker';\n" +
                'export class MyCalendar<D> extends KbqCalendar<D> {\n' +
                '    override ngOnChanges(changes: SimpleChanges) { super.ngOnChanges(changes); }\n' +
                '}\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('A direct call of ngOnChanges');
    });

    it('says nothing when the datepicker is only used', async () => {
        appTree.create(
            file,
            "import { KbqDatepicker, KbqDatepickerModule } from '@koobiq/components/datepicker';\n" +
                'export function open(d: KbqDatepicker<Date>) { d.startAt = null; d.opened = true; }\n'
        );

        await run();

        expect(messages.join('\n')).not.toContain('[datepicker-signals]');
    });
});
