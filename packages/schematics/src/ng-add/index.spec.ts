import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { join } from 'path';
import { createTestApp } from '../utils/testing';
import * as messages from './messages';

describe(`ng add '@koobiq/components'`, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', join(__dirname, '../collection.json'));
        appTree = await createTestApp(runner);
    });

    it(`should add missing dependencies to 'package.json'`, async () => {
        const tree = await runner.runSchematic('ng-add', {}, appTree);
        const { dependencies } = JSON.parse(tree.get('/package.json')!.content.toString());

        expect(dependencies['@angular/cdk']).toBeDefined();
        expect(dependencies['@koobiq/cdk']).toBeDefined();
        expect(dependencies['@koobiq/angular-luxon-adapter']).toBeDefined();
        expect(dependencies['@koobiq/date-formatter']).toBeDefined();
        expect(dependencies['@koobiq/date-adapter']).toBeDefined();
        expect(dependencies['@koobiq/tokens-builder']).toBeDefined();
        expect(dependencies['@koobiq/design-tokens']).toBeDefined();
        expect(dependencies['@koobiq/icons']).toBeDefined();
        expect(dependencies['@messageformat/core']).toBeDefined();
        expect(dependencies['luxon']).toBeDefined();
        expect(dependencies['marked']).toBeDefined();
        expect(dependencies['overlayscrollbars']).toBeDefined();
        expect(dependencies['ngx-highlightjs']).toBeDefined();
    });

    it(`should report when specified 'project' is not found`, async () => {
        let message = '';
        try {
            await runner.runSchematic('ng-add', { project: 'test' }, appTree);
        } catch (e) {
            message = (e as Error).message;
        } finally {
            expect(message).toBe(messages.noProject('test'));
        }
    });
});
