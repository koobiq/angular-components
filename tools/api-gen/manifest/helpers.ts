import { DocEntry, JsDocTagEntry } from '../rendering/entities';

/* Add mapping to use nunjucks rendering */

/** Gets a unique lookup key for an API */
export function getApiLookupKey(moduleName: string, name: string) {
    return `${moduleName}/${name}`;
}

/** Gets whether the given entry has the "@deprecated" JsDoc tag. */
export function hasDeprecatedTag(entry: DocEntry) {
    return entry.jsdocTags.some((t: JsDocTagEntry) => t.name === 'deprecated');
}

/** Gets whether the given entry has the "@developerPreview" JsDoc tag. */
export function hasDeveloperPreviewTag(entry: DocEntry) {
    return entry.jsdocTags.some((t: JsDocTagEntry) => t.name === 'developerPreview');
}

/** Gets whether the given entry is deprecated in the manifest. */
export function isDeprecated(lookup: Map<string, DocEntry[]>, moduleName: string, entry: DocEntry): boolean {
    const entriesWithSameName = lookup.get(getApiLookupKey(moduleName, entry.name));

    // If there are multiple entries with the same name in the same module, only mark them as
    // deprecated if *all* of the entries with the same name are deprecated (e.g. function overloads).
    if (entriesWithSameName && entriesWithSameName.length > 1) {
        return entriesWithSameName.every((entry) => hasDeprecatedTag(entry));
    }

    return hasDeprecatedTag(entry);
}

/** Gets whether the given entry is hasDeveloperPreviewTag in the manifest. */
export function isDeveloperPreview(lookup: Map<string, DocEntry[]>, moduleName: string, entry: DocEntry): boolean {
    const entriesWithSameName = lookup.get(getApiLookupKey(moduleName, entry.name));

    // If there are multiple entries with the same name in the same module, only mark them as
    // developer preview if *all* of the entries with the same name are hasDeveloperPreviewTag (e.g. function overloads).
    if (entriesWithSameName && entriesWithSameName.length > 1) {
        return entriesWithSameName.every((entry) => hasDeveloperPreviewTag(entry));
    }

    return hasDeveloperPreviewTag(entry);
}

export function isPublic(entry: DocEntry) {
    return entry.jsdocTags.every((t: JsDocTagEntry) => t.name !== 'docs-private');
}

/**
 * Computes an URL that refers to the given API document in the docs. Note that this logic
 * needs to be kept in sync with the routes from the material.angular.io CLI project.
 */
export function computeApiDocumentUrl(moduleName: string, packageName: string, entry: DocEntry): string {
    return `${moduleName}/${packageName}/api#${entry.name}`;
}
