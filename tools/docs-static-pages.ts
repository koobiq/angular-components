import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { EXAMPLE_COMPONENTS } from '../packages/docs-examples/example-module';

const root = 'dist/releases/koobiq-docs/browser';

copyFileSync(join(root, '404/index.html'), join(root, '404.html'));

for (const id of Object.keys(EXAMPLE_COMPONENTS)) {
    const directory = join(root, 'examples', id);

    mkdirSync(directory, { recursive: true });
    copyFileSync(join(root, 'index.csr.html'), join(directory, 'index.html'));
}
