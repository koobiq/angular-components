const { access, copyFile, mkdir } = require('fs/promises');
const { resolve, join } = require('path');
const { getMigrations } = require('../src/utils/migrations');

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

    for (const migration of getMigrations()) {
        const migrationPath = join(schematicsPath, 'migrations', migration);
        await ensureDirectoryExistence(migrationPath);

        await copyFileWrapper(
            resolvePath(`../src/migrations/${migration}/schema.json`),
            join(migrationPath, 'schema.json')
        );
        await copyFileWrapper(resolvePath(`../dist/migrations/${migration}/index.js`), join(migrationPath, 'index.js'));
        await copyFileWrapper(resolvePath(`../dist/migrations/${migration}/data.js`), join(migrationPath, 'data.js'));
    }

    await copyFileWrapper(resolvePath('../dist/utils/package-config.js'), join(utilsPath, 'package-config.js'));
};

init().catch((error) => console.error(`Failed to initialize directories and copy files: ${error.message}`));
