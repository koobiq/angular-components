import { DocEntry } from '../rendering/entities';
import { EntryCollection, ManifestEntry, PackageApiInfo } from '../types';
import { computeApiDocumentUrl, getApiLookupKey, isPublic } from './helpers';

export function generateManifest(apiCollections: EntryCollection[]): EntryCollection<ManifestEntry>[] {
    // Filter out repeated entries for function overloads, but also keep track of
    // all symbols keyed to their lookup key. We need this lookup later for determining whether
    // to mark an entry as deprecated.
    const entryLookup = new Map<string, DocEntry[]>();
    for (const collection of apiCollections) {
        collection.packagesApiInfo.forEach((packageApi: PackageApiInfo) => {
            packageApi.entries = packageApi.entries.filter((entry: DocEntry) => {
                const lookupKey = getApiLookupKey(collection.moduleName, entry.name);
                if (entryLookup.has(lookupKey)) {
                    entryLookup.get(lookupKey)!.push(entry);
                    return false;
                }

                entryLookup.set(lookupKey, [entry]);
                return true;
            });
        });
    }

    return apiCollections.map(({ moduleName, packagesApiInfo }: EntryCollection) => ({
        moduleName: moduleName,
        packagesApiInfo: packagesApiInfo.map(({ packageName, entries }) => {
            return {
                packageName,
                entries: entries.filter(isPublic).map((entry) => ({
                    ...entry,
                    members: entry.members?.filter(isPublic),
                    publicUrl: computeApiDocumentUrl(moduleName, packageName, entry)
                }))
            };
        })
    }));
}
