import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

import { createTestApp } from '../utils/testing';
import * as messages from './messages';

describe(`ng add '@koobiq/components'`, () => {
    let runner: SchematicTestRunner;
    let appTree: Tree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', require.resolve('../collection.json'));
        appTree = await createTestApp(runner);
    });

    it(`should add missing dependencies to 'package.json'`, async () => {
        const tree = await runner.runSchematic('ng-add', {}, appTree);
        const { dependencies } = JSON.parse(tree.get('/package.json')!.content.toString());

        expect(dependencies['@angular/cdk']).withContext('@angular/cdk should be installed').toBeDefined();
        expect(dependencies['@koobiq/cdk']).withContext('@koobiq/cdk should be installed').toBeDefined();
        expect(dependencies['@koobiq/angular-luxon-adapter'])
            .withContext('@koobiq/angular-luxon-adapter should be installed')
            .toBeDefined();
        expect(dependencies['@koobiq/date-formatter'])
            .withContext('@koobiq/date-formatter should be installed')
            .toBeDefined();
        expect(dependencies['@koobiq/date-adapter'])
            .withContext('@koobiq/date-adapter should be installed')
            .toBeDefined();
        expect(dependencies['@koobiq/icons']).withContext('@koobiq/icons should be installed').toBeDefined();
        expect(dependencies['@messageformat/core'])
            .withContext('@messageformat/core should be installed')
            .toBeDefined();
        expect(dependencies['luxon']).withContext('luxon should be installed').toBeDefined();
        expect(dependencies['marked']).withContext('marked should be installed').toBeDefined();
        expect(dependencies['overlayscrollbars']).withContext('overlayscrollbars should be installed').toBeDefined();
        expect(dependencies['ngx-highlightjs']).withContext('ngx-highlightjs should be installed').toBeDefined();
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
