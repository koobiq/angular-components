import { cpSync, mkdirSync } from 'fs';
import { dirname } from 'path';

if (require.main === module) {
    // copy Stackblitz Examples
    const execPath = 'packages/docs-examples/components/';
    const outDir = 'dist/docs-content/examples-source/components';

    mkdirSync(dirname(outDir), { recursive: true });

    // eslint-disable-next-line @angular-eslint/no-experimental
    cpSync(execPath, outDir, {
        recursive: true,
        filter: (path) => path.endsWith('.json')
    });
}
