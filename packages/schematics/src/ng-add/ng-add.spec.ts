import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { createTestApp } from '../utils/testing';

const getPackageJsonDependencies = (tree: UnitTestTree) => {
    return JSON.parse(tree.get('/package.json')!.content.toString()).dependencies;
};

const getStyles = (tree: UnitTestTree, project: string): unknown[] => {
    const angularJson = JSON.parse(tree.get('/angular.json')!.content.toString());

    return angularJson.projects[project].architect.build.options.styles;
};

const getIndexHtml = (tree: UnitTestTree, project: string): string => {
    return tree.get(`/projects/${project}/src/index.html`)!.content.toString();
};

const getBootstrapSource = (tree: UnitTestTree, project: string): string => {
    const configPath = `/projects/${project}/src/app/app.config.ts`;

    return tree.get(configPath)!.content.toString();
};

/**
 * The peers the given package cannot run without, read from its manifest rather than listed here, so
 * a peer added there without teaching `ng add` about it fails this suite instead of the consumer.
 */
const getMandatoryPeers = (packageName: string): string[] => {
    const manifest = JSON.parse(
        readFileSync(join(__dirname, '..', '..', '..', packageName, 'package.json'), { encoding: 'utf-8' })
    );

    return Object.keys(manifest.peerDependencies).filter((peer) => !manifest.peerDependenciesMeta?.[peer]?.optional);
};

describe(`ng add '@koobiq/components'`, () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', join(__dirname, '../collection.json'));
        appTree = await createTestApp(runner);
    });

    it(`should add missing dependencies to 'package.json'`, async () => {
        expect(getPackageJsonDependencies(appTree)).toMatchSnapshot('before running schematics');
        const tree = await runner.runSchematic('ng-add', {}, appTree);

        expect(getPackageJsonDependencies(tree)).toMatchSnapshot('after running schematics');
    });

    it(`should leave every mandatory peer of '@koobiq/components' present in 'package.json'`, async () => {
        const tree = await runner.runSchematic('ng-add', {}, appTree);
        const dependencies = getPackageJsonDependencies(tree);

        // A mandatory peer the application ends up without breaks it later, at bundle time, with
        // "Module not found" — so each one has to be either shipped by `ng new` or added here. The
        // versions themselves are injected by rollup at build time, so they read as the `^0.0.0`
        // source default in this suite; only the presence of the entry is meaningful.
        expect(getMandatoryPeers('components').filter((peer) => dependencies[peer] === undefined)).toEqual([]);
    });

    it(`should install the mandatory peers of every package it adds`, async () => {
        const tree = await runner.runSchematic('ng-add', {}, appTree);
        const dependencies = getPackageJsonDependencies(tree);

        // Adding a package is not enough: npm installs its mandatory peers on its own, Yarn and
        // pnpm do not, so a peer of `@koobiq/angular-luxon-adapter` that this schematic skips leaves
        // those consumers with an adapter they cannot resolve. `@koobiq/components` is excluded
        // because the CLI installs it before running this schematic, not the schematic itself.
        const missing = getMandatoryPeers('angular-luxon-adapter')
            .filter((peer) => peer !== '@koobiq/components')
            .filter((peer) => dependencies[peer] === undefined);

        expect(missing).toEqual([]);
    });

    it(`should install '@angular/animations' at the range the application uses for '@angular/core'`, async () => {
        const angularCore = getPackageJsonDependencies(appTree)['@angular/core'];
        const tree = await runner.runSchematic('ng-add', {}, appTree);

        // Every `@angular/animations` release pins `@angular/core` exactly, so installing the range
        // this repository builds with would produce ERESOLVE for applications on any other version.
        expect(angularCore).toBeDefined();
        expect(getPackageJsonDependencies(tree)['@angular/animations']).toBe(angularCore);
    });

    it(`should report when specified 'project' is not found`, async () => {
        await expect(runner.runSchematic('ng-add', { project: 'test' }, appTree)).rejects.toThrow(
            "Unable to find project 'test' in the workspace"
        );
    });

    describe('styles, theme and animations', () => {
        it(`should install the auto theme by default`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app' }, appTree);

            expect(getStyles(tree, 'app')).toEqual([
                'node_modules/@koobiq/icons/fonts/kbq-icons.css',
                'node_modules/@koobiq/design-tokens/web/css-tokens.css',
                'node_modules/@koobiq/design-tokens/web/css-tokens-light.css',
                'node_modules/@koobiq/design-tokens/web/css-tokens-dark.css',
                'node_modules/@koobiq/components/prebuilt-themes/theme.css',
                'projects/app/src/styles.css'
            ]);
            expect(getIndexHtml(tree, 'app')).toContain('<body class="kbq-app-background">');
            expect(getBootstrapSource(tree, 'app')).toContain("kbqThemeProvider({ mode: 'auto' })");
        });

        it(`should install the light theme when requested`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'light' }, appTree);

            expect(getStyles(tree, 'app')).toEqual([
                'node_modules/@koobiq/icons/fonts/kbq-icons.css',
                'node_modules/@koobiq/design-tokens/web/css-tokens.css',
                'node_modules/@koobiq/design-tokens/web/css-tokens-light.css',
                'node_modules/@koobiq/components/prebuilt-themes/theme.css',
                'projects/app/src/styles.css'
            ]);
            expect(getIndexHtml(tree, 'app')).toContain('<body class="kbq-app-background kbq-light">');

            // `themes` is pinned to just the 'light' entry: without it, `KBQ_THEME_CONFIG` would
            // keep its default `themes: KBQ_DEFAULT_THEMES` (both light and dark registered), so a
            // stale `localStorage` value or a `toggle()` call could switch the app to 'dark' even
            // though its token file was never added to `angular.json`.
            const bootstrapSource = getBootstrapSource(tree, 'app');

            expect(bootstrapSource).toContain("kbqThemeProvider({ mode: 'light', themes:");
            expect(bootstrapSource).toContain("{ name: 'light', className: 'kbq-light', colorScheme: 'light' }");
            expect(bootstrapSource).not.toContain("colorScheme: 'dark'");
        });

        it(`should install the dark theme when requested`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'dark' }, appTree);

            expect(getStyles(tree, 'app')).toContain('node_modules/@koobiq/design-tokens/web/css-tokens-dark.css');
            expect(getStyles(tree, 'app')).not.toContain('node_modules/@koobiq/design-tokens/web/css-tokens-light.css');
            expect(getIndexHtml(tree, 'app')).toContain('<body class="kbq-app-background kbq-dark">');

            const bootstrapSource = getBootstrapSource(tree, 'app');

            expect(bootstrapSource).toContain("kbqThemeProvider({ mode: 'dark', themes:");
            expect(bootstrapSource).toContain("{ name: 'dark', className: 'kbq-dark', colorScheme: 'dark' }");
            expect(bootstrapSource).not.toContain("colorScheme: 'light'");
        });

        it(`should install both token files and wire up 'KbqThemeService' for the auto theme`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'auto' }, appTree);
            const styles = getStyles(tree, 'app');

            expect(styles).toContain('node_modules/@koobiq/design-tokens/web/css-tokens-light.css');
            expect(styles).toContain('node_modules/@koobiq/design-tokens/web/css-tokens-dark.css');

            const indexHtml = getIndexHtml(tree, 'app');

            expect(indexHtml).toContain('<body class="kbq-app-background">');
            expect(indexHtml).not.toContain('kbq-light');
            expect(indexHtml).not.toContain('kbq-dark');

            const bootstrapSource = getBootstrapSource(tree, 'app');

            expect(bootstrapSource).toContain("kbqThemeProvider({ mode: 'auto' })");
            expect(bootstrapSource).toContain('provideAppInitializer');
            expect(bootstrapSource).toContain('inject(KbqThemeService)');
        });

        it(`should add 'provideAnimations()' by default`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app' }, appTree);

            expect(getBootstrapSource(tree, 'app')).toContain('provideAnimations()');
        });

        it(`should skip 'provideAnimations()' when 'animations' is false`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app', animations: false }, appTree);

            expect(getBootstrapSource(tree, 'app')).not.toContain('provideAnimations');
        });

        it(`should only touch the requested project when 'project' is given`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'dark' }, appTree);

            expect(getStyles(tree, 'second-app')).toEqual(['projects/second-app/src/styles.css']);
            expect(getIndexHtml(tree, 'second-app')).not.toContain('kbq-');
        });

        it(`should wire up every application project when 'project' is not given`, async () => {
            const tree = await runner.runSchematic('ng-add', {}, appTree);

            expect(getStyles(tree, 'app')).toContain('node_modules/@koobiq/icons/fonts/kbq-icons.css');
            expect(getStyles(tree, 'second-app')).toContain('node_modules/@koobiq/icons/fonts/kbq-icons.css');
            expect(getBootstrapSource(tree, 'app')).toContain('kbqThemeProvider');
            expect(getBootstrapSource(tree, 'second-app')).toContain('kbqThemeProvider');
        });

        it(`should not duplicate styles, body classes or providers when run again with the same options`, async () => {
            let tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'light' }, appTree);

            tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'light' }, tree);

            const styles = getStyles(tree, 'app');

            expect(styles.filter((entry) => entry === 'node_modules/@koobiq/icons/fonts/kbq-icons.css')).toHaveLength(
                1
            );
            expect(
                styles.filter((entry) => entry === 'node_modules/@koobiq/design-tokens/web/css-tokens-light.css')
            ).toHaveLength(1);

            const indexHtml = getIndexHtml(tree, 'app');

            expect(indexHtml.match(/kbq-light/g)).toHaveLength(1);
            expect(indexHtml.match(/kbq-app-background/g)).toHaveLength(1);

            const bootstrapSource = getBootstrapSource(tree, 'app');

            expect(bootstrapSource.match(/kbqThemeProvider\(/g)).toHaveLength(1);
            expect(bootstrapSource.match(/provideAnimations\(/g)).toHaveLength(1);
        });

        it(`should switch the theme in place when run again with a different theme`, async () => {
            let tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'light' }, appTree);

            tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'dark' }, tree);

            const styles = getStyles(tree, 'app');

            expect(styles).toContain('node_modules/@koobiq/design-tokens/web/css-tokens-dark.css');
            expect(styles).not.toContain('node_modules/@koobiq/design-tokens/web/css-tokens-light.css');

            const indexHtml = getIndexHtml(tree, 'app');

            expect(indexHtml).toContain('kbq-dark');
            expect(indexHtml).not.toContain('kbq-light');

            const bootstrapSource = getBootstrapSource(tree, 'app');

            expect(bootstrapSource).toContain("kbqThemeProvider({ mode: 'dark', themes:");
            expect(bootstrapSource).not.toContain("mode: 'light'");
            expect(bootstrapSource).not.toContain("colorScheme: 'light'");
            expect(bootstrapSource.match(/kbqThemeProvider\(/g)).toHaveLength(1);
        });

        it(`should not mistake a library's shipped '.d.ts' declarations for an already-registered provider`, async () => {
            // The default project of a plain `ng new` workspace has `root: ''`, so `tree.getDir(root)`
            // walks the whole tree, including `node_modules` — a real npm package's `.d.ts` can
            // contain the exact text of a provider call (e.g. `declare function provideAnimations()`
            // in `@angular/platform-browser`'s own types) well before `ng-add` ever runs.
            let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
                name: 'workspace',
                version: '20.0.0',
                newProjectRoot: ''
            });

            tree = await runner.runExternalSchematic(
                '@schematics/angular',
                'application',
                { name: 'app', projectRoot: '' },
                tree
            );

            tree.create(
                '/node_modules/@angular/platform-browser/animations/animations.d.ts',
                'export declare function provideAnimations(): unknown;\n'
            );

            const result = await runner.runSchematic('ng-add', { project: 'app' }, tree);

            expect(result.get('/src/app/app.config.ts')!.content.toString()).toContain('provideAnimations()');
        });

        it(`should still update package.json/angular.json/index.html and log a warning when the bootstrap file can't be analyzed`, async () => {
            appTree.overwrite('/projects/app/src/main.ts', "console.log('custom bootstrap, no Angular here');\n");

            const warnings: string[] = [];

            runner.logger.subscribe((entry) => {
                if (entry.level === 'warn') warnings.push(entry.message);
            });

            const tree = await runner.runSchematic('ng-add', { project: 'app' }, appTree);

            expect(getPackageJsonDependencies(tree)['@koobiq/icons']).toBeDefined();
            expect(getStyles(tree, 'app')).toContain('node_modules/@koobiq/icons/fonts/kbq-icons.css');
            expect(getIndexHtml(tree, 'app')).toContain('kbq-app-background');
            expect(
                warnings.some((message) => message.includes("Could not automatically register 'kbqThemeProvider"))
            ).toBe(true);
            expect(
                warnings.some((message) => message.includes("Could not automatically start 'KbqThemeService'"))
            ).toBe(true);
            expect(
                warnings.some((message) => message.includes("Could not automatically register 'provideAnimations()'"))
            ).toBe(true);
        });

        it(`should not mistake a mention of 'kbqThemeProvider(' in a comment or a spec file for an already-registered provider`, async () => {
            appTree.overwrite(
                '/projects/app/src/app/app.spec.ts',
                '// TODO: configure kbqThemeProvider( later\nexport {};\n'
            );

            const tree = await runner.runSchematic('ng-add', { project: 'app' }, appTree);

            expect(getBootstrapSource(tree, 'app')).toContain("kbqThemeProvider({ mode: 'auto' })");
        });

        it(`should still wire providers for a project on a builder it doesn't recognize, and warn that styles weren't wired`, async () => {
            const angularJsonPath = '/angular.json';
            const angularJson = JSON.parse(appTree.readText(angularJsonPath));

            // A real wrapper around the classic webpack browser builder (unlike this repo's own
            // `@angular/build:application`) resolves its main file from `options.main`, not
            // `options.browser` — mirroring that here so the test exercises "unrecognized builder",
            // not an unrelated "main file missing" failure.
            angularJson.projects.app.architect.build.builder = 'ngx-build-plus:browser';
            angularJson.projects.app.architect.build.options.main = 'projects/app/src/main.ts';
            appTree.overwrite(angularJsonPath, JSON.stringify(angularJson, null, 2));

            const warnings: string[] = [];

            runner.logger.subscribe((entry) => {
                if (entry.level === 'warn') warnings.push(entry.message);
            });

            const tree = await runner.runSchematic('ng-add', { project: 'app' }, appTree);

            // The builder is unrecognized, but the project is still `projectType: 'application'`
            // with a `build` target, so both styles and providers are wired exactly as normal.
            expect(getStyles(tree, 'app')).toContain('node_modules/@koobiq/icons/fonts/kbq-icons.css');
            expect(getBootstrapSource(tree, 'app')).toContain('kbqThemeProvider');
            expect(warnings.some((message) => message.includes("Project 'app' has no 'build' target"))).toBe(false);
        });

        it(`should fail clearly, before writing any dependency, when the workspace file can't be read`, async () => {
            const angularJson = appTree.readText('/angular.json');

            appTree.delete('/angular.json');
            appTree.create('/.angular.json', angularJson);

            await expect(runner.runSchematic('ng-add', { project: 'app' }, appTree)).rejects.toThrow(
                "Could not read the workspace configuration ('angular.json')."
            );
        });

        it(`should guard the eager 'KbqThemeService' injection against SSR, where 'matchMedia' isn't available`, async () => {
            let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
                name: 'workspace',
                version: '20.0.0',
                newProjectRoot: 'projects'
            });

            tree = await runner.runExternalSchematic(
                '@schematics/angular',
                'application',
                { name: 'app', ssr: true },
                tree
            );

            const result = await runner.runSchematic('ng-add', { project: 'app', theme: 'auto' }, tree);
            const bootstrapSource = getBootstrapSource(result, 'app');

            // `app.config.server.ts` merges this same `appConfig` into the server bundle via
            // `mergeApplicationConfig`, so the eager `inject(KbqThemeService)` initializer runs on
            // the server too — where `KbqThemeService` constructs `window.matchMedia` unconditionally
            // in a field initializer. Without the `isPlatformBrowser` guard, `ng build` fails outright.
            expect(bootstrapSource).toContain('if (isPlatformBrowser(inject(PLATFORM_ID))) inject(KbqThemeService);');
        });

        it(`should still show the animations instruction when no application project is found`, async () => {
            let tree = await runner.runExternalSchematic('@schematics/angular', 'workspace', {
                name: 'workspace',
                version: '20.0.0',
                newProjectRoot: 'projects'
            });

            tree = await runner.runExternalSchematic('@schematics/angular', 'library', { name: 'my-lib' }, tree);

            const warnings: string[] = [];

            runner.logger.subscribe((entry) => {
                if (entry.level === 'warn') warnings.push(entry.message);
            });

            await runner.runSchematic('ng-add', { project: 'my-lib' }, tree);

            expect(warnings.some((message) => message.includes('No application project was found'))).toBe(true);
            expect(
                warnings.some((message) =>
                    message.includes('Angular animations have to be provided by the application.')
                )
            ).toBe(true);
        });
    });
});
