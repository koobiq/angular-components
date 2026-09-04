import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'accordion-state-saving-default';

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

        return { ts: appTree.exists(`${root}/app.ts`) ? `${root}/app.ts` : `${root}/app.component.ts` };
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    /** Runs the migration over a single file and returns everything it logged. */
    async function report(source: string): Promise<string> {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, source);

        await run(first);

        return messages.join('\n');
    }

    it('reports an accordion that never mentions useStateSaving', async () => {
        const messages = await report('const template = `<kbq-accordion><kbq-accordion-item /></kbq-accordion>`;\n');

        expect(messages).toContain('Accordions persist their expanded sections by default now');
    });

    it('stays quiet when the file already opts out', async () => {
        const messages = await report(
            'const template = `<kbq-accordion [useStateSaving]="false"><kbq-accordion-item /></kbq-accordion>`;\n'
        );

        expect(messages).not.toContain('Accordions persist their expanded sections by default now');
    });

    it('stays quiet when the file already opts in', async () => {
        const messages = await report(
            'const template = `<kbq-accordion useStateSaving stateSavingKey="faq"><kbq-accordion-item /></kbq-accordion>`;\n'
        );

        expect(messages).not.toContain('Accordions persist their expanded sections by default now');
    });

    it('reports defaultValue losing to the persisted state', async () => {
        const messages = await report('const template = `<kbq-accordion [defaultValue]="\'a\'"></kbq-accordion>`;\n');

        expect(messages).toContain('defaultValue now applies to the first visit only');
    });

    it('does not report defaultValue on an accordion that opts out', async () => {
        const messages = await report(
            'const template = `<kbq-accordion [useStateSaving]="false" [defaultValue]="\'a\'"></kbq-accordion>`;\n'
        );

        expect(messages).not.toContain('defaultValue now applies to the first visit only');
    });

    it('reports items left without a value', async () => {
        const messages = await report('const template = `<kbq-accordion><kbq-accordion-item /></kbq-accordion>`;\n');

        expect(messages).toContain('persisted by position now');
    });

    it('does not mistake defaultValue for an item value', async () => {
        const messages = await report(
            'const template = `<kbq-accordion [defaultValue]="\'a\'"><kbq-accordion-item /></kbq-accordion>`;\n'
        );

        expect(messages).toContain('persisted by position now');
    });

    it('does not report items that carry a value', async () => {
        const messages = await report(
            'const template = `<kbq-accordion><kbq-accordion-item [value]="\'a\'" /></kbq-accordion>`;\n'
        );

        expect(messages).not.toContain('persisted by position now');
    });

    it('says nothing at all when the project does not use accordions', async () => {
        const messages = await report('export class App {}\n');

        expect(messages).not.toContain('[accordion-state-saving-default]');
    });
});
