import { writeFileSync } from 'fs';
import { EntryCollection, ManifestEntry, PackageApiInfo } from '../types';
import { createDirIfNotExists } from '../utils';
import { entryPointGrouper } from './helpers';
import { configureMarkedGlobally } from './marked/configuration';
import { getRenderable } from './processing';
import { renderEntry } from './rendering';

export function generateApiToHtml(entryCollections: EntryCollection<ManifestEntry>[]) {
    configureMarkedGlobally();

    for (const collection of entryCollections) {
        collection.packagesApiInfo.forEach((packageApiInfo: PackageApiInfo) => {
            const extractedEntries = packageApiInfo.entries;
            const renderableEntries = extractedEntries.map((entry) => getRenderable(entry, collection.moduleName));

            const entryPointContext = entryPointGrouper(
                renderableEntries,
                collection.moduleName,
                packageApiInfo.packageName
            );

            const htmlOutput = renderEntry(entryPointContext);

            createDirIfNotExists('dist/docs-content/api-docs').then(() => {
                writeFileSync(
                    `dist/docs-content/api-docs/${collection.moduleName}-${packageApiInfo.packageName}.html`,
                    htmlOutput,
                    { encoding: 'utf8' }
                );
            });
        });
    }
}
