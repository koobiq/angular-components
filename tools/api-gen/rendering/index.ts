// import nunjucks from 'nunjucks';

//@ts-ignore
import { EntryCollection, ManifestEntry, PackageApiInfo } from '../types/types.js';
//@ts-ignore
import { configureMarkedGlobally } from './marked/configuration.js';
//@ts-ignore
import { getRenderable } from './processing.js';
//@ts-ignore
import { renderEntry } from './rendering.js';
import { writeFileSync } from 'fs';
import { createDirIfNotExists } from '../utils.js';
import { entryPointGrouper } from './helpers.js';

export function generateApiToHtml(entryCollections: EntryCollection<ManifestEntry>[]) {
    configureMarkedGlobally();

    for (const collection of entryCollections) {
        collection.packagesApiInfo.forEach((packageApiInfo: PackageApiInfo) => {
            const extractedEntries = packageApiInfo.entries;
            const renderableEntries = extractedEntries.map((entry) =>
                getRenderable(entry, collection.moduleName)
            )

            const entryPointContext = entryPointGrouper(
                renderableEntries, collection.moduleName, packageApiInfo.packageName
            );

            const htmlOutput = renderEntry(entryPointContext);

            createDirIfNotExists('dist/docs-content/api-docs').then(() => {
                writeFileSync(
                    `dist/docs-content/api-docs/${ collection.moduleName }-${ packageApiInfo.packageName }.html`,
                    htmlOutput,
                    { encoding: 'utf8' });
            });
        })
    }
}
