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
        expect(log).toContain('KbqDropdown.animationDone was removed');
        expect(log).toContain('KbqPopUp.animationStart() and animationDone() were removed');
        expect(log).toContain('4 use(s) reported');
    });

    it('reports a subscription to the animationDone of a dropdown, not of a tab group', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();
        const dropdownFile = filePath(projects.get(first)!, 'dropdown-closed.ts');
        const tabsFile = filePath(projects.get(first)!, 'tabs-done.ts');

        appTree.create(
            dropdownFile,
            "import { KbqDropdown } from '@koobiq/components/dropdown';\n" +
                'export const closed = (dropdown: KbqDropdown) => dropdown.animationDone.pipe(take(1));\n'
        );
        appTree.create(
            tabsFile,
            "import { KbqTabGroup } from '@koobiq/components/tabs';\n" +
                'export const done = (tabs: KbqTabGroup) => tabs.animationDone.subscribe();\n'
        );

        await run(first);

        const log = messages.join('\n');

        expect(log).toContain(`[angular-animations-removal] ${dropdownFile}`);
        expect(log).toContain('KbqDropdown.animationDone was removed');
        expect(log).not.toContain(tabsFile);
        expect(log).toContain('1 use(s) reported');
    });

    it('reports the removed animation state of the sidepanel container, sidebar and toast', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        appTree.create(
            filePath(projects.get(first)!, 'sidepanel.ts'),
            "import { KbqSidebar } from '@koobiq/components/sidebar';\n" +
                "import { KbqSidepanelRef } from '@koobiq/components/sidepanel';\n" +
                "export const hide = (ref: KbqSidepanelRef) => ref.containerInstance.setAnimationState('hidden');\n" +
                'export const opened = (sidebar: KbqSidebar) => sidebar.animationState;\n'
        );

        await run(first);

        const log = messages.join('\n');

        expect(log).toContain('The animation state of KbqSidepanelContainerComponent');
        expect(log).toContain('1 use(s) reported');
    });

    it('reports the animation state of the content panel container, not its current members', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        appTree.create(
            filePath(projects.get(first)!, 'content-panel.ts'),
            "import { KbqContentPanelContainer } from '@koobiq/components/content-panel';\n" +
                'export class Container extends KbqContentPanelContainer {\n' +
                '    protected readonly shifted = computed(() => this.contentAnimationState().value);\n' +
                '}\n'
        );
        appTree.create(
            filePath(projects.get(first)!, 'content.ts'),
            'export const margin = (container: any) => [container.contentMargin(), container.contentAnimating()];\n'
        );

        await run(first);

        const log = messages.join('\n');

        expect(log).toContain('KbqContentPanelContainer.contentAnimationState was removed');
        expect(log).toContain('1 use(s) reported');
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

    it('stays silent for a component that animates itself with the same member names', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        appTree.create(
            filePath(projects.get(first)!, 'slide.ts'),
            "import { AnimationEvent, trigger } from '@angular/animations';\n" +
                "import { KbqButtonModule } from '@koobiq/components/button';\n" +
                "const fadeAnimation = trigger('fade', []);\n" +
                '@Component({\n' +
                '    template: \'<div [@slide]="animationState" (@slide.done)="onAnimationDone($event)"></div>\',\n' +
                '    imports: [KbqButtonModule],\n' +
                "    animations: [fadeAnimation, trigger('slide', [])]\n" +
                '})\n' +
                'export class Slide {\n' +
                '    readonly animationStateChanged = new EventEmitter<AnimationEvent>();\n' +
                '    readonly animation = new Subject<AnimationEvent>();\n' +
                '    isAnimating = false;\n' +
                "    animationState = 'open';\n" +
                '    onAnimationStart() { this.isAnimating = true; }\n' +
                '    onAnimationDone(event: AnimationEvent) {\n' +
                '        this.isAnimating = false;\n' +
                '        this.animationStateChanged.emit(event);\n' +
                '        this.animation.next(event);\n' +
                '        this.player.animationDone(event);\n' +
                '    }\n' +
                '    onAnimation(event: AnimationEvent) { this.setAnimationState(event.toState); }\n' +
                '}\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('[angular-animations-removal]');
    });

    it('reports the callbacks and streams in a file that names the component owning them', async () => {
        const [first] = projects.keys();
        const messages = collectLogs();

        appTree.create(
            filePath(projects.get(first)!, 'sidebar.ts'),
            "import { KbqSidebar } from '@koobiq/components/sidebar';\n" +
                'export const done = (sidebar: KbqSidebar) => sidebar.onAnimationDone();\n'
        );
        appTree.create(
            filePath(projects.get(first)!, 'toast.ts'),
            "import { KbqToastService } from '@koobiq/components/toast';\n" +
                'export const watch = (toasts: KbqToastService) => toasts.animation.subscribe();\n'
        );

        await run(first);

        const log = messages.join('\n');

        expect(log).toContain('The animation callbacks taking an AnimationEvent were removed');
        expect(log).toContain('KbqToastService.animation (and KbqToastStack.animation) were removed');
        expect(log).toContain('2 use(s) reported');
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
