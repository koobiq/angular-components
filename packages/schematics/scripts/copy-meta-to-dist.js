const { access, copyFile, mkdir } = require('fs/promises');
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

    // Ensure directories exist
    await ensureDirectoryExistence(distCLIPath);
    await ensureDirectoryExistence(schematicsPath);
    await ensureDirectoryExistence(ngAddPath);
    await ensureDirectoryExistence(utilsPath);

    // Copy files
    await copyFileWrapper(resolvePath('../dist/ng-add/index.js'), join(ngAddPath, 'index.js'));
    await copyFileWrapper(resolvePath('../src/ng-add/schema.json'), join(ngAddPath, 'schema.json'));
    await copyFileWrapper(resolvePath('../src/collection.json'), join(schematicsPath, 'collection.json'));
    await copyFileWrapper(resolvePath('../src/migrations.json'), join(schematicsPath, 'migrations.json'));

    for (const migration of getMigrations()) {
        const migrationPath = join(schematicsPath, 'migrations', migration);

        await ensureDirectoryExistence(migrationPath);

        await copyMigrationMeta(migration, migrationPath);

        await copyFileWrapper(resolvePath(`../dist/migrations/${migration}/index.js`), join(migrationPath, 'index.js'));
        const optionalMigrationData = resolvePath(`../dist/migrations/${migration}/data.js`);
        const fileExists = statSync(optionalMigrationData, { throwIfNoEntry: false });

        if (fileExists) {
            await copyFileWrapper(optionalMigrationData, join(migrationPath, 'data.js'));
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

    await copyFileWrapper(resolvePath('../dist/utils/package-config.js'), join(utilsPath, 'package-config.js'));
    await copyFileWrapper(resolvePath('../dist/utils/messages.js'), join(utilsPath, 'messages.js'));
    await copyFileWrapper(resolvePath('../dist/utils/typescript.js'), join(utilsPath, 'typescript.js'));
    await copyFileWrapper(resolvePath('../dist/utils/ast.js'), join(utilsPath, 'ast.js'));
    await copyFileWrapper(resolvePath('../dist/utils/angular-parsing.js'), join(utilsPath, 'angular-parsing.js'));

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
