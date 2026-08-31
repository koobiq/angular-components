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
            expect(getBootstrapSource(tree, 'app')).toContain("kbqThemeProvider({ mode: 'light' })");
        });

        it(`should install the dark theme when requested`, async () => {
            const tree = await runner.runSchematic('ng-add', { project: 'app', theme: 'dark' }, appTree);

            expect(getStyles(tree, 'app')).toContain('node_modules/@koobiq/design-tokens/web/css-tokens-dark.css');
            expect(getStyles(tree, 'app')).not.toContain('node_modules/@koobiq/design-tokens/web/css-tokens-light.css');
            expect(getIndexHtml(tree, 'app')).toContain('<body class="kbq-app-background kbq-dark">');
            expect(getBootstrapSource(tree, 'app')).toContain("kbqThemeProvider({ mode: 'dark' })");
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

            expect(bootstrapSource).toContain("kbqThemeProvider({ mode: 'dark' })");
            expect(bootstrapSource).not.toContain("mode: 'light'");
            expect(bootstrapSource.match(/kbqThemeProvider\(/g)).toHaveLength(1);
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
    });
});
