import { copySync, ensureDirSync } from 'fs-extra';
import { dirname } from 'path';

if (require.main === module) {
    // copy Stackblitz Examples
    const execPath = 'packages/docs-examples/components/';
    const outDir = 'dist/docs-content/examples-source/components';

    ensureDirSync(dirname(outDir));

    copySync(execPath, outDir, {
        filter: (path) => !/.json/.test(path)
    });
}
