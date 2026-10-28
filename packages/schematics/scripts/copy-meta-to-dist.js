const { access, copyFile, mkdir, readdir, readFile, rm, writeFile } = require('fs/promises');
const { resolve, join } = require('path');
const { getMigrations } = require('../src/utils/migrations');
const { statSync } = require('fs');

/** Files every migration directory has to provide; they ship next to the compiled rule. */
const MIGRATION_META_FILES = ['schema.json', 'README.md'];

/**
 * Everything that could not be copied. Collected rather than thrown so that one missing file
 * neither hides the ones after it nor leaves the remaining copies undone — an aborted run used
 * to publish a truncated `dist/components/schematics`.
 */
const failures = [];

const resolvePath = (...segments) => resolve(__dirname, ...segments);

const ensureDirectoryExistence = async (filePath) => {
    try {
        await access(filePath);
    } catch (error) {
        await mkdir(filePath, { recursive: true });
    }
};

const copyFileWrapper = async (src, dest) => {
    try {
        await copyFile(src, dest);
    } catch (error) {
        failures.push(`Failed to copy file from ${src} to ${dest}: ${error.message}`);
    }
};

/**
 * Copies collection.json or migrations.json with every factory pointing at its `.cjs` module. The sources
 * keep the factories extension-less for the specs, which load the `.ts` files, and `require.resolve()`
 * does not try `.cjs` on its own.
 */
const copyCollection = async (name, destDir) => {
    const src = resolvePath(`../src/${name}`);

    try {
        const collection = JSON.parse(await readFile(src, 'utf8'));

        for (const schematic of Object.values(collection.schematics)) {
            schematic.factory = schematic.factory.replace(/^[^#]+/, '$&.cjs');
        }

        await writeFile(join(destDir, name), `${JSON.stringify(collection, null, 4)}\n`);
    } catch (error) {
        failures.push(`Failed to copy ${src}: ${error.message}`);
    }
};

/** Copies the meta files of one migration, naming the migration instead of reporting a bare ENOENT path. */
const copyMigrationMeta = async (migration, migrationPath) => {
    for (const file of MIGRATION_META_FILES) {
        const src = resolvePath(`../src/migrations/${migration}/${file}`);

        if (statSync(src, { throwIfNoEntry: false })) {
            await copyFileWrapper(src, join(migrationPath, file));
        } else {
            failures.push(`No ${file} for the ${migration} migration`);
        }
    }
};

const init = async () => {
    const distCLIPath = resolvePath('../../../dist/components');
    const schematicsPath = join(distCLIPath, 'schematics');
    const ngAddPath = join(schematicsPath, 'ng-add');
    const utilsPath = join(schematicsPath, 'utils');

    // Without a clean start a renamed or removed migration would stay in the package.
    await rm(schematicsPath, { recursive: true, force: true });

    // Ensure directories exist
    await ensureDirectoryExistence(distCLIPath);
    await ensureDirectoryExistence(schematicsPath);
    await ensureDirectoryExistence(ngAddPath);
    await ensureDirectoryExistence(utilsPath);

    // Copy files
    await copyFileWrapper(resolvePath('../dist/ng-add/index.cjs'), join(ngAddPath, 'index.cjs'));
    await copyFileWrapper(resolvePath('../src/ng-add/schema.json'), join(ngAddPath, 'schema.json'));
    await copyCollection('collection.json', schematicsPath);
    await copyCollection('migrations.json', schematicsPath);

    for (const migration of getMigrations()) {
        const migrationPath = join(schematicsPath, 'migrations', migration);

        await ensureDirectoryExistence(migrationPath);

        await copyMigrationMeta(migration, migrationPath);

        await copyFileWrapper(
            resolvePath(`../dist/migrations/${migration}/index.cjs`),
            join(migrationPath, 'index.cjs')
        );
        const optionalMigrationData = resolvePath(`../dist/migrations/${migration}/data.cjs`);
        const fileExists = statSync(optionalMigrationData, { throwIfNoEntry: false });

        if (fileExists) {
            await copyFileWrapper(optionalMigrationData, join(migrationPath, 'data.cjs'));
        }
    }

    await copyFileWrapper(
        resolvePath('../src/migrations/new-icons-pack/migration.json'),
        join(schematicsPath, 'migrations', 'new-icons-pack', 'migration.json')
    );
    await copyFileWrapper(
        resolvePath('../src/migrations/new-icons-pack/replacement.json'),
        join(schematicsPath, 'migrations', 'new-icons-pack', 'replacement.json')
    );

    // Copy every compiled util rather than a hand-maintained list: rollup.config.js gives each
    // `src/utils` module an entry under `utils/` and puts the shared chunks there too, so a new one
    // is shipped automatically.
    const distUtilsPath = resolvePath('../dist/utils');
    const utilFiles = statSync(distUtilsPath, { throwIfNoEntry: false }) ? await readdir(distUtilsPath) : [];

    for (const file of utilFiles) {
        await copyFileWrapper(join(distUtilsPath, file), join(utilsPath, file));
    }

    if (failures.length > 0) {
        throw new Error([`${failures.length} file(s) missing from the package:`, ...failures].join('\n  '));
    }
};

init().catch((error) => {
    console.error(`Failed to initialize directories and copy files: ${error.message}`);
    // Without this the rejection is swallowed, the build stays green, and an incomplete
    // dist/components/schematics gets published.
    process.exitCode = 1;
});
