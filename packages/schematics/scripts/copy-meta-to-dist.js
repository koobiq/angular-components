const { access, copyFile, mkdir } = require('fs/promises');
const { resolve, join } = require('path');
const { getMigrations } = require('../src/utils/migrations');
const { statSync } = require('fs');

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
        console.error(`Failed to copy file from ${src} to ${dest}: ${error.message}`);
        throw error;
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

        await copyFileWrapper(
            resolvePath(`../src/migrations/${migration}/schema.json`),
            join(migrationPath, 'schema.json')
        );
        // Optional, like `data.js` below. A migration that never got one must not abort the loop: the
        // copies that follow it include `utils/`, which every built migration requires at runtime.
        const migrationReadme = resolvePath(`../src/migrations/${migration}/README.md`);

        if (statSync(migrationReadme, { throwIfNoEntry: false })) {
            await copyFileWrapper(migrationReadme, join(migrationPath, 'README.md'));
        } else {
            console.warn(`No README.md for the "${migration}" migration — it ships without one.`);
        }

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
};

// A non-zero exit is what keeps a half-copied `schematics/` from shipping: the files this script places
// are what `ng update` loads, and a build that only logged the failure stayed green while the published
// package could no longer run a single migration.
init().catch((error) => {
    console.error(`Failed to initialize directories and copy files: ${error.message}`);
    process.exitCode = 1;
});
