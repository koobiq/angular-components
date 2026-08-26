import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const migrationsPath = path.join(__dirname, '../../migrations.json');
const SCHEMATIC_NAME = 'notification-center-signals';

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

    it('reports the removed scroll strategy provider', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/notification-center';\n" +
                'export const providers = [KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER];\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER');
        expect(messages.join('\n')).toContain('kbqNotificationCenterScrollStrategyFactory');
    });

    it('reports .emit() on the three notification-center streams', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';\n" +
                'export function reload(service: KbqNotificationCenterService) { service.onReload.emit(); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('`.next(…)`');
    });

    it('reports imperative reads of the trigger inputs that became signals', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';\n" +
                'export function read(trigger: KbqNotificationCenterTrigger) { return trigger.offset; }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('scrolledToBottomOffset');
    });

    it('does not report a trigger input that is already read as a signal', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(
            ts,
            "import { KbqNotificationCenterTrigger } from '@koobiq/components/notification-center';\n" +
                'export function read(trigger: KbqNotificationCenterTrigger) { return trigger.offset(); }\n'
        );

        await run(first);

        expect(messages.join('\n')).not.toContain('scrolledToBottomOffset');
    });

    it('reports a changes subscriber that takes the payload, but not one that ignores it', async () => {
        const [first, second] = projects.keys();
        const withPayload = paths(projects.get(first)!).ts;
        const withoutPayload = paths(projects.get(second)!).ts;
        const messages = collectLogs();

        appTree.overwrite(
            withPayload,
            "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';\n" +
                'export function watch(service: KbqNotificationCenterService) { service.changes.subscribe((state) => state); }\n'
        );
        appTree.overwrite(
            withoutPayload,
            "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';\n" +
                'export function watch(service: KbqNotificationCenterService) { service.changes.subscribe(() => undefined); }\n'
        );

        await run(first);

        expect(messages.join('\n')).toContain('Observable<void>');

        const afterFirst = messages.length;

        await run(second);

        expect(messages.slice(afterFirst).join('\n')).not.toContain('Observable<void>');
    });

    it('leaves a file that never names the notification center alone', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const messages = collectLogs();

        appTree.overwrite(ts, 'export function read(other: { offset: number }) { return other.offset; }\n');

        await run(first);

        expect(messages.join('\n')).not.toContain('scrolledToBottomOffset');
    });

    it('never writes to the tree', async () => {
        const [first] = projects.keys();
        const { ts } = paths(projects.get(first)!);
        const original =
            "import { KbqNotificationCenterService } from '@koobiq/components/notification-center';\n" +
            'export function reload(service: KbqNotificationCenterService) { service.onReload.emit(); }\n';

        appTree.overwrite(ts, original);

        expect((await run(first)).readText(ts)).toBe(original);
    });

    describe('ng update entry point', () => {
        it('runs when invoked without options', async () => {
            const [first] = projects.keys();
            const { ts } = paths(projects.get(first)!);

            appTree.overwrite(
                ts,
                "import { KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER } from '@koobiq/components/notification-center';\n" +
                    'export const providers = [KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER];\n'
            );

            const runnerFromMigrations = new SchematicTestRunner('migrations', migrationsPath);
            const messages: string[] = [];

            runnerFromMigrations.logger.subscribe((entry) => messages.push(entry.message));

            await runnerFromMigrations.runSchematic(SCHEMATIC_NAME, {}, appTree);

            expect(messages.join('\n')).toContain('KBQ_NOTIFICATION_CENTER_SCROLL_STRATEGY_FACTORY_PROVIDER');
        });
    });
});
