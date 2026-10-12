import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { createTestApp } from '../../utils/testing';

const collectionPath = path.join(__dirname, '../../collection.json');
const SCHEMATIC_NAME = 'design-tokens-v4';
const PACKAGE = '@koobiq/design-tokens';

const readPackageJson = (tree: UnitTestTree) => JSON.parse(tree.get('/package.json')!.content.toString());

/** Everything the migration warns about, in the order it was logged. */
const collectWarnings = (runner: SchematicTestRunner): string[] => {
    const warnings: string[] = [];

    runner.logger.subscribe((entry) => {
        if (entry.level === 'warn') {
            warnings.push(entry.message);
        }
    });

    return warnings;
};

const declare = (tree: UnitTestTree, section: 'dependencies' | 'devDependencies', version: string) => {
    const json = readPackageJson(tree);

    json[section] = { ...json[section], [PACKAGE]: version };
    tree.overwrite('/package.json', JSON.stringify(json, null, 2));
};

describe(SCHEMATIC_NAME, () => {
    let runner: SchematicTestRunner;
    let appTree: UnitTestTree;

    beforeEach(async () => {
        runner = new SchematicTestRunner('schematics', collectionPath);
        appTree = await createTestApp(runner);
    });

    // Versions are injected by rollup at build time, so they read as the `^0.0.0` source default in
    // this suite; what matters is that the v3 range is gone.
    it('should overwrite a v3 range in dependencies', async () => {
        declare(appTree, 'dependencies', '^3.14.0');

        const tree = await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(readPackageJson(tree).dependencies[PACKAGE]).not.toBe('^3.14.0');
    });

    it('should overwrite the range where the project declared it', async () => {
        declare(appTree, 'devDependencies', '3.20.0');

        const tree = await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);
        const json = readPackageJson(tree);

        expect(json.devDependencies[PACKAGE]).not.toBe('3.20.0');
        // Moving it into `dependencies` would leave the stale devDependency behind, and the two
        // ranges would then resolve against each other.
        expect(json.dependencies?.[PACKAGE]).toBeUndefined();
    });

    it('should add the package when the project relied on the peer dependency alone', async () => {
        const tree = await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        expect(readPackageJson(tree).dependencies[PACKAGE]).toBeDefined();
    });

    it('should report the steps it cannot take', async () => {
        const warnings = collectWarnings(runner);

        await runner.runSchematic(SCHEMATIC_NAME, {}, appTree);

        const logged = warnings.join('\n');

        expect(logged).toContain('component-tokens.css');
        expect(logged).toContain('koobiq-tokens-codemod');
        expect(logged).toContain('scrollbars');
    });
});
