import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { extractApiToJson } from '../api-gen/extraction';
import { generateManifest } from '../api-gen/manifest';

/**
 * POC-scoped stand-in for `docs:api-gen`: reuses the same Angular-compiler-based extraction and
 * manifest filtering, but writes structured JSON for `ApiTable.astro` to render instead of running
 * the Nunjucks-to-HTML rendering step.
 */
const OUT_DIR = join(__dirname, '../../apps/docs-v2/src/generated/api');

const run = () => {
    // `getModulePackagePaths`'s `include` option builds a bare `(accordion)/` glob without the
    // `@` extglob prefix it needs, so it never matches anything (the real `docs:api-gen` script
    // never passes `include`, so this is dormant/untested upstream, not something to lean on).
    // Extract every `components` package, same as the real tool always does, and filter locally.
    const data = extractApiToJson([{ moduleName: 'components' }]);
    const manifest = generateManifest(data);
    const accordionEntries = manifest
        .flatMap((collection) => collection.packagesApiInfo)
        .filter((pkg) => pkg.packageName === 'accordion')
        .flatMap((pkg) => pkg.entries);

    mkdirSync(OUT_DIR, { recursive: true });
    writeFileSync(join(OUT_DIR, 'accordion.json'), JSON.stringify(accordionEntries, null, 2));

    console.log(`Wrote ${accordionEntries.length} API entries to ${join(OUT_DIR, 'accordion.json')}`);
};

run();
