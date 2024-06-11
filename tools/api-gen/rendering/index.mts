import { writeFileSync } from 'fs';

import { configureMarkedGlobally } from './marked/configuration.mjs';
import { getRenderable } from './processing.mjs';
import { renderEntry } from './rendering.mjs';
import { createDirIfNotExists } from '../utils.mjs';
import { EntryCollection, ManifestEntry, PackageApiInfo } from '../types/index.mjs';
import { entryPointGrouper } from './helpers.mjs';

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
