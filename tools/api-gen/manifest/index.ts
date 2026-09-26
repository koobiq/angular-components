import { DocEntry, MemberEntry } from '../rendering/entities';
import { EntryCollection, PackageApiInfo } from '../types';
import { getApiLookupKey, isDocumentedMember, isPublic, withoutHiddenDirective } from './helpers';

export function generateManifest(apiCollections: EntryCollection[]): EntryCollection<DocEntry>[] {
    // The extractor may report an overloaded function once per declaration; the first one stands for all.
    const seen = new Set<string>();

    for (const collection of apiCollections) {
        collection.packagesApiInfo.forEach((packageApi: PackageApiInfo) => {
            packageApi.entries = packageApi.entries.filter((entry: DocEntry) => {
                const lookupKey = getApiLookupKey(collection.moduleName, entry.name);

                if (seen.has(lookupKey)) return false;

                seen.add(lookupKey);

                return true;
            });
        });
    }

    const hidden = new Set(
        apiCollections.flatMap(({ packagesApiInfo }) =>
            packagesApiInfo.flatMap(({ entries }) =>
                entries.filter((entry) => !isPublic(entry)).map(({ name }) => name)
            )
        )
    );

    return apiCollections.map(({ moduleName, packagesApiInfo }: EntryCollection) => ({
        moduleName: moduleName,
        packagesApiInfo: packagesApiInfo.map(({ packageName, entries }) => ({
            packageName,
            entries: entries.filter(isPublic).map((entry) => ({
                ...entry,
                members:
                    entry.members
                        ?.filter((member: MemberEntry) => isDocumentedMember(entry, member))
                        .map((member) => withoutHiddenDirective(member, hidden)) || []
            }))
        }))
    }));
}
