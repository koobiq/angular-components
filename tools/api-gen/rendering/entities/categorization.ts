import { ClassEntry, DocEntry, EntryType, JsDocTagEntry } from '../entities';

/** The kinds of entry the extractor reports for a class, decorated or not. */
const CLASS_ENTRY_TYPES = new Set<EntryType>([
    EntryType.UndecoratedClass,
    EntryType.Component,
    EntryType.Directive,
    EntryType.Pipe,
    EntryType.NgModule
]);

/** Gets whether the given entry represents a class */
export function isClassEntry(entry: DocEntry): entry is ClassEntry {
    return CLASS_ENTRY_TYPES.has(entry.entryType);
}

/** Gets whether the given entry is deprecated. */
export function isDeprecatedEntry(entry: { jsdocTags: JsDocTagEntry[] }): boolean {
    return entry.jsdocTags.some((tag) => tag.name === 'deprecated');
}
