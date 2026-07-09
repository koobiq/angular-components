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
        // Copy the example sources (.ts/.html/.css) for the live example viewer; skip json (e.g.
        // ng-package.json). The filter must return true for directories so cpSync recurses.
        filter: (path) => !path.endsWith('.json')
    });
}
