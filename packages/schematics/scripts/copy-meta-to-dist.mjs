import { access, copyFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolvePath = (...segments) => path.resolve(__dirname, ...segments);

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
    const schematicsPath = path.join(distCLIPath, 'schematics');
    const ngAddPath = path.join(schematicsPath, 'ng-add');

    // Ensure directories exist
    await ensureDirectoryExistence(distCLIPath);
    await ensureDirectoryExistence(schematicsPath);
    await ensureDirectoryExistence(ngAddPath);

    // Copy files
    await copyFileWrapper(resolvePath('../dist/ng-add/index.js'), path.join(ngAddPath, 'index.js'));
    await copyFileWrapper(resolvePath('../src/ng-add/schema.json'), path.join(ngAddPath, 'schema.json'));
    await copyFileWrapper(resolvePath('../src/collection.json'), path.join(schematicsPath, 'collection.json'));
};

init().catch((error) => console.error(`Failed to initialize directories and copy files: ${error.message}`));
