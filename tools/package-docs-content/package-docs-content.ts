import { cpSync, mkdirSync } from 'fs';
import { dirname } from 'path';

if (require.main === module) {
    // copy Stackblitz Examples
    const outDir = 'dist/docs-content/examples-source';

    mkdirSync(dirname(outDir), { recursive: true });

    for (const dir of ['components', 'i18n']) {
        // eslint-disable-next-line @angular-eslint/no-experimental
        cpSync(`packages/docs-examples/${dir}/`, `${outDir}/${dir}`, {
            recursive: true,
            // Copy the example sources (.ts/.html/.css) for the live example viewer; skip json (e.g.
            // ng-package.json). The filter must return true for directories so cpSync recurses.
            filter: (path) => !path.endsWith('.json')
        });
    }
}
