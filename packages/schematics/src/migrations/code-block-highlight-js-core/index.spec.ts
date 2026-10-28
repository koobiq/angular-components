import { workspaces } from '@angular-devkit/core';
import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { getWorkspace } from '@schematics/angular/utility/workspace';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';
import { migrateSource } from './index';
import { Schema } from './schema';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'code-block-highlight-js-core';
const FULL_BUNDLE_PROVIDER = "kbqCodeBlockHighlightJsConfigProvider({ core: () => import('highlight.js') })";

const migrate = (source: string): string => migrateSource(source, 'file.ts').content;

describe(SCHEMATIC_NAME, () => {
    describe('configurations', () => {
        it('should ask for the full bundle in a configuration without core', () => {
            expect(
                migrate(
                    'export const providers = [\n' +
                        '    kbqCodeBlockHighlightJsConfigProvider({\n' +
                        "        languages: { foo: () => import('./foo') }\n" +
                        '    })\n' +
                        '];\n'
                )
            ).toBe(
                'export const providers = [\n' +
                    '    kbqCodeBlockHighlightJsConfigProvider({\n' +
                    "        core: () => import('highlight.js'),\n" +
                    "        languages: { foo: () => import('./foo') }\n" +
                    '    })\n' +
                    '];\n'
            );
        });

        it('should keep a configuration on one line', () => {
            expect(
                migrate("kbqCodeBlockHighlightJsConfigProvider({ languages: { foo: () => import('./foo') } });\n")
            ).toBe(
                "kbqCodeBlockHighlightJsConfigProvider({ core: () => import('highlight.js'), languages: { foo: () => import('./foo') } });\n"
            );
        });

        it('should keep the line endings of the file', () => {
            expect(migrate('kbqCodeBlockHighlightJsConfigProvider({\r\n    languages: {}\r\n});\r\n')).toBe(
                "kbqCodeBlockHighlightJsConfigProvider({\r\n    core: () => import('highlight.js'),\r\n    languages: {}\r\n});\r\n"
            );
        });

        it('should put core above the comment of the first property', () => {
            expect(
                migrate(
                    'kbqCodeBlockHighlightJsConfigProvider({\n    // The languages of the pages.\n    languages: {}\n});\n'
                )
            ).toBe(
                'kbqCodeBlockHighlightJsConfigProvider({\n' +
                    "    core: () => import('highlight.js'),\n" +
                    '    // The languages of the pages.\n' +
                    '    languages: {}\n' +
                    '});\n'
            );
        });

        it('should fill an empty configuration', () => {
            expect(migrate('kbqCodeBlockHighlightJsConfigProvider({});\n')).toBe(`${FULL_BUNDLE_PROVIDER};\n`);
        });

        it('should keep the comment of an empty configuration', () => {
            expect(migrate('kbqCodeBlockHighlightJsConfigProvider({\n    // TODO: the languages\n});\n')).toBe(
                "kbqCodeBlockHighlightJsConfigProvider({\n    core: () => import('highlight.js')\n    // TODO: the languages\n});\n"
            );
        });

        it('should ask for the full bundle in the value of a provider of the token', () => {
            expect(
                migrate(
                    'export const provider = { provide: KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG, useValue: { languages: {} } };\n'
                )
            ).toBe(
                'export const provider = { provide: KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG, ' +
                    "useValue: { core: () => import('highlight.js'), languages: {} } };\n"
            );
        });

        it('should ask for the full bundle in a provider imported under another name and in an overridden one', () => {
            expect(
                migrate(
                    "import { kbqCodeBlockHighlightJsConfigProvider as provideHighlight, KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG as CONFIG } from '@koobiq/components/code-block';\n" +
                        'provideHighlight({ languages: {} });\n' +
                        'TestBed.overrideProvider(CONFIG, { useValue: { languages: {} } });\n'
                )
            ).toBe(
                "import { kbqCodeBlockHighlightJsConfigProvider as provideHighlight, KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG as CONFIG } from '@koobiq/components/code-block';\n" +
                    "provideHighlight({ core: () => import('highlight.js'), languages: {} });\n" +
                    "TestBed.overrideProvider(CONFIG, { useValue: { core: () => import('highlight.js'), languages: {} } });\n"
            );
        });

        it('should leave a configuration with core alone', () => {
            const source =
                "kbqCodeBlockHighlightJsConfigProvider({ core: () => import('highlight.js/lib/core'), languages: {} });\n" +
                "export const provider = { provide: KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG, useValue: { 'core': load } };\n" +
                "kbqCodeBlockHighlightJsConfigProvider({ ['core']: load, languages: {} });\n" +
                'kbqCodeBlockHighlightJsConfigProvider({ ...base, core: load });\n';

            expect(migrateSource(source, 'file.ts')).toEqual({
                content: source,
                changed: false,
                unreadLines: [],
                configs: 4
            });
        });

        it('should leave the other calls and providers alone', () => {
            const source =
                'kbqCodeBlockFallbackFileLanguageProvider({});\n' +
                'export const provider = { provide: KBQ_CODE_BLOCK_FALLBACK_FILE_LANGUAGE, useValue: {} };\n';

            expect(migrateSource(source, 'file.ts')).toEqual({
                content: source,
                changed: false,
                unreadLines: [],
                configs: 0
            });
        });

        it('should report a configuration it cannot read', () => {
            const source =
                'kbqCodeBlockHighlightJsConfigProvider(config);\n' +
                'kbqCodeBlockHighlightJsConfigProvider({ ...base, languages: {} });\n' +
                'export const provider = { provide: KBQ_CODE_BLOCK_HIGHLIGHT_JS_CONFIG, useFactory: () => config };\n' +
                'kbqCodeBlockHighlightJsConfigProvider({ [CORE]: load });\n';

            expect(migrateSource(source, 'file.ts')).toEqual({
                content: source,
                changed: false,
                unreadLines: [1, 2, 3, 4],
                configs: 4
            });
        });
    });

    describe('schematic', () => {
        let runner: SchematicTestRunner;
        let appTree: Tree;
        let projects: workspaces.ProjectDefinitionCollection;
        let messages: string[];

        beforeEach(async () => {
            runner = new SchematicTestRunner('schematics', collectionPath);
            appTree = await createTestApp(runner, { style: 'scss' });
            projects = (await getWorkspace(appTree)).projects as unknown as workspaces.ProjectDefinitionCollection;
            messages = [];
            runner.logger.subscribe((entry) => messages.push(entry.message));
        });

        const appDir = (project = 'app'): string => `/${projects.get(project)!.root}/src/app`;

        const componentPath = (): string =>
            appTree.exists(`${appDir()}/app.ts`) ? `${appDir()}/app.ts` : `${appDir()}/app.component.ts`;

        const appConfigPath = (project = 'app'): string => `${appDir(project)}/app.config.ts`;

        const run = (options: Partial<Schema> = {}): Promise<Tree> =>
            runner.runSchematic(SCHEMATIC_NAME, options satisfies Schema, appTree);

        const component = (providers = ''): string =>
            "import { Component } from '@angular/core';\n" +
            `import { KbqCodeBlock${providers ? ', kbqCodeBlockHighlightJsConfigProvider' : ''} } from '@koobiq/components/code-block';\n` +
            '\n' +
            `@Component({ selector: 'app-root', imports: [KbqCodeBlock], providers: [${providers}], template: '' })\n` +
            'export class App {}\n';

        const log = (): string => messages.join('\n');

        it('should ask for the full bundle at the root of an application that renders code blocks with no configuration', async () => {
            appTree.overwrite(componentPath(), component());

            const tree = await run();
            const appConfig = tree.readText(appConfigPath());

            expect(appConfig).toContain(FULL_BUNDLE_PROVIDER);
            expect(appConfig).toContain(
                "import { kbqCodeBlockHighlightJsConfigProvider } from '@koobiq/components/code-block';"
            );
            expect(log()).toContain(
                'Project "app" renders code blocks without a highlight.js configuration in its root providers. Added'
            );
            // The second application renders no code blocks.
            expect(tree.readText(appConfigPath('second-app'))).not.toContain('kbqCodeBlockHighlightJsConfigProvider');
        });

        it('should leave the root alone where its providers have a configuration, and complete it', async () => {
            appTree.overwrite(componentPath(), component());
            appTree.overwrite(
                appConfigPath(),
                "import { ApplicationConfig } from '@angular/core';\n" +
                    "import { kbqCodeBlockHighlightJsConfigProvider } from '@koobiq/components/code-block';\n" +
                    '\n' +
                    'export const appConfig: ApplicationConfig = {\n' +
                    '    providers: [kbqCodeBlockHighlightJsConfigProvider({ languages: {} })]\n' +
                    '};\n'
            );

            const tree = await run({ project: 'app' });

            expect(tree.readText(appConfigPath())).toContain(
                "providers: [kbqCodeBlockHighlightJsConfigProvider({ core: () => import('highlight.js'), languages: {} })]"
            );
            expect(log()).not.toContain('Added');
        });

        it('should ask for the full bundle at the root next to a configuration of a component, and say so', async () => {
            appTree.overwrite(componentPath(), component('kbqCodeBlockHighlightJsConfigProvider({ languages: {} })'));

            const tree = await run({ project: 'app' });

            expect(tree.readText(appConfigPath())).toContain(FULL_BUNDLE_PROVIDER);
            expect(tree.readText(componentPath())).toContain(
                "providers: [kbqCodeBlockHighlightJsConfigProvider({ core: () => import('highlight.js'), languages: {} })]"
            );
            expect(log()).toContain(
                'Project "app" also provides a highlight.js configuration outside its root providers'
            );
        });

        it('should not touch root providers it cannot extend', async () => {
            appTree.overwrite(componentPath(), component());
            appTree.overwrite(
                appConfigPath(),
                "import { ApplicationConfig } from '@angular/core';\n" +
                    "import { APP_PROVIDERS } from './providers';\n" +
                    '\n' +
                    'export const appConfig: ApplicationConfig = { providers: APP_PROVIDERS };\n'
            );
            const appConfig = appTree.readText(appConfigPath());

            const tree = await run({ project: 'app' });

            expect(tree.readText(appConfigPath())).toBe(appConfig);
            expect(log()).toContain('Could not tell whether project "app" provides a highlight.js configuration');
            expect(log()).not.toContain('Added');
        });

        it('should not touch a bootstrap it cannot analyze', async () => {
            const mainPath = `/${projects.get('app')!.root}/src/main.ts`;
            const main =
                "import { bootstrapApplication } from '@angular/platform-browser';\n" +
                "import { App } from './app/app';\n" +
                "import { makeConfig } from './app/make-config';\n" +
                '\n' +
                'bootstrapApplication(App, makeConfig());\n';

            appTree.overwrite(componentPath(), component());
            appTree.overwrite(mainPath, main);

            const tree = await run({ project: 'app' });

            expect(tree.readText(mainPath)).toBe(main);
            expect(log()).toContain('Could not tell whether project "app" provides a highlight.js configuration');
            expect(log()).not.toContain('Added');
        });

        it('should ask for the full bundle at the root of an NgModule application', async () => {
            appTree = await createTestApp(runner, { style: 'scss', standalone: false });

            const files = appTree.getDir(appDir()).subfiles.map((name) => `${appDir()}/${name}`);
            const modulePath = files.find((file) => appTree.readText(file).includes('export class AppModule'))!;
            const componentFile = files.find((file) => appTree.readText(file).includes('@Component'))!;

            appTree.overwrite(
                componentFile,
                `import { KbqCodeBlock } from '@koobiq/components/code-block';\n${appTree.readText(componentFile)}`
            );

            const tree = await run({ project: 'app' });

            expect(tree.readText(modulePath)).toContain(FULL_BUNDLE_PROVIDER);
        });

        it.each([true, false])(
            'should migrate the sources of the project only, at the workspace root (source root: %s)',
            async (hasSourceRoot) => {
                const workspace = JSON.parse(appTree.readText('/angular.json'));

                workspace.projects.app.root = '';

                if (!hasSourceRoot) delete workspace.projects.app.sourceRoot;
                appTree.overwrite('/angular.json', JSON.stringify(workspace));
                appTree.overwrite(
                    appConfigPath('second-app'),
                    "import { kbqCodeBlockHighlightJsConfigProvider } from '@koobiq/components/code-block';\n" +
                        'export const appConfig = { providers: [kbqCodeBlockHighlightJsConfigProvider({})] };\n'
                );
                const secondAppConfig = appTree.readText(appConfigPath('second-app'));
                const appConfig = appTree.readText(appConfigPath());

                const tree = await run({ project: 'app' });

                expect(tree.readText(appConfigPath('second-app'))).toBe(secondAppConfig);
                // The code blocks of the second application are not those of the first.
                expect(tree.readText(appConfigPath())).toBe(appConfig);
            }
        );

        it('should change nothing and say nothing in an application without code blocks', async () => {
            const appConfig = appTree.readText(appConfigPath());

            const tree = await run({ project: 'app' });

            expect(tree.readText(appConfigPath())).toBe(appConfig);
            expect(messages).toEqual([]);
        });

        it('should only report what it would change without fix', async () => {
            // A spec gets none of the root providers, so its configuration does not stand for the application's.
            const spec =
                'TestBed.configureTestingModule({ providers: [kbqCodeBlockHighlightJsConfigProvider({})] });\n';
            const specPath = `${appDir()}/viewer.spec.ts`;

            appTree.overwrite(componentPath(), component());
            appTree.create(specPath, spec);
            const appConfig = appTree.readText(appConfigPath());

            const tree = await run({ project: 'app', fix: false });

            expect(tree.readText(appConfigPath())).toBe(appConfig);
            expect(tree.readText(specPath)).toBe(spec);
            expect(log()).toContain(
                'Project "app" renders code blocks without a highlight.js configuration in its root providers. Would add'
            );
            expect(log()).not.toContain('also provides');
            expect(log()).toContain(`would update ${specPath}`);
        });
    });
});
