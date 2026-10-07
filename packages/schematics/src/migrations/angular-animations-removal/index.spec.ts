import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'angular-animations-removal';

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

    function filePath(project: workspaces.ProjectDefinition, name: string): string {
        return `/${project.root}/src/app/${name}`;
    }

    function run(project: string) {
        return runner.runSchematic(SCHEMATIC_NAME, { project } satisfies Schema, appTree);
    }

    function collectLogs(): string[] {
        const messages: string[] = [];

        runner.logger.subscribe((entry) => messages.push(entry.message));

        return messages;
    }

    it('reports the removed triggers and the members that carried an AnimationEvent', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        appTree.create(
            filePath(projects.get(first)!, 'dropdown.ts'),
            "import { kbqDropdownAnimations } from '@koobiq/components/dropdown';\n" +
                'const animations = [kbqDropdownAnimations.transformDropdown];\n' +
                'dropdown.animationDone.subscribe(() => dropdown.isAnimating);\n'
        );
        appTree.create(
            filePath(projects.get(first)!, 'popover.ts'),
            'class CustomPopover extends KbqPopoverComponent {\n' +
                '    override animationDone(event: AnimationEvent) { super.animationDone(event); }\n' +
                '}\n'
        );

        await run(first);

        const log = messages.join('\n');

        expect(log).toContain('kbqDropdownAnimations, fadeInItems and transformDropdown were removed');
        expect(log).toContain('KbqDropdown lost isAnimating');
        expect(log).toContain('KbqPopUp.animationStart() and animationDone() were removed');
        expect(log).toContain('3 use(s) reported');
    });

    it('suggests KBQ_ANIMATIONS_CONFIG in place of the no-op animations', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        appTree.create(
            filePath(projects.get(first)!, 'noop.spec.ts'),
            "import { NoopAnimationsModule } from '@angular/platform-browser/animations';\n" +
                'TestBed.configureTestingModule({ imports: [NoopAnimationsModule] });\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KBQ_ANIMATIONS_CONFIG');
    });

    it('stays silent for a project that never touched the animations', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        await run(first);

        expect(messages.join('\n')).not.toContain('[angular-animations-removal]');
    });

    it('leaves every file untouched', async () => {
        const [first] = projects.keys();
        const file = filePath(projects.get(first)!, 'tabs.ts');
        const content = "import { kbqTabsAnimations } from '@koobiq/components/tabs';\nexport { kbqTabsAnimations };\n";

        appTree.create(file, content);

        const tree = await run(first);

        expect(tree.readContent(file)).toBe(content);
    });
});
