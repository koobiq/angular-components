import { writeFileSync } from 'fs';

import { configureMarkedGlobally } from './marked/configuration.ts';
import { getRenderable } from './processing.ts';
import { renderEntry } from './rendering.ts';
import { createDirIfNotExists } from '../utils.ts';
import { EntryCollection, ManifestEntry, PackageApiInfo } from '../types/types.ts';
import { entryPointGrouper } from './helpers.ts';

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
