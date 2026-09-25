import {
    ClassEntry,
    ConstantEntry,
    DocEntry,
    EntryType,
    EnumEntry,
    FunctionEntry,
    InterfaceEntry,
    JsDocTagEntry,
    MemberEntry,
    MemberType,
    MethodEntry,
    TypeAliasEntry
} from '../entities';
import {
    ClassEntryRenderable,
    ConstantEntryRenderable,
    DocEntryRenderable,
    EnumEntryRenderable,
    FunctionEntryRenderable,
    InterfaceEntryRenderable,
    TypeAliasEntryRenderable
} from './renderables';
import { HasJsDocTags } from './traits';

/** The kinds of entry the extractor reports for a class, decorated or not. */
const CLASS_ENTRY_TYPES = new Set<EntryType>([
    EntryType.UndecoratedClass,
    EntryType.Component,
    EntryType.Directive,
    EntryType.Pipe,
    EntryType.NgModule
]);

/** Gets whether the given entry represents a class */
export function isClassEntry(entry: DocEntryRenderable): entry is ClassEntryRenderable;
export function isClassEntry(entry: DocEntry): entry is ClassEntry;
export function isClassEntry(entry: DocEntry): entry is ClassEntry {
    return CLASS_ENTRY_TYPES.has(entry.entryType);
}

/** Gets whether the given entry represents a constant */
export function isConstantEntry(entry: DocEntryRenderable): entry is ConstantEntryRenderable;
export function isConstantEntry(entry: DocEntry): entry is ConstantEntry;
export function isConstantEntry(entry: DocEntry): entry is ConstantEntry {
    return entry.entryType === EntryType.Constant;
}

/** Gets whether the given entry represents a type alias */
export function isTypeAliasEntry(entry: DocEntryRenderable): entry is TypeAliasEntryRenderable;
export function isTypeAliasEntry(entry: DocEntry): entry is TypeAliasEntry;
export function isTypeAliasEntry(entry: DocEntry): entry is TypeAliasEntry {
    return entry.entryType === EntryType.TypeAlias;
}

/** Gets whether the given entry represents an enum */
export function isEnumEntry(entry: DocEntryRenderable): entry is EnumEntryRenderable;
export function isEnumEntry(entry: DocEntry): entry is EnumEntry;
export function isEnumEntry(entry: DocEntry): entry is EnumEntry {
    return entry.entryType === EntryType.Enum;
}

/** Gets whether the given entry represents an interface. */
export function isInterfaceEntry(entry: DocEntryRenderable): entry is InterfaceEntryRenderable;
export function isInterfaceEntry(entry: DocEntry): entry is InterfaceEntry;
export function isInterfaceEntry(entry: DocEntry): entry is InterfaceEntry {
    return entry.entryType === EntryType.Interface;
}

/** Gets whether the given member entry is a method entry. */
export function isClassMethodEntry(entry: MemberEntry): entry is MethodEntry {
    return entry.memberType === MemberType.Method;
}

/** Gets whether the given entry represents a function */
export function isFunctionEntry(entry: DocEntryRenderable): entry is FunctionEntryRenderable;
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry;
export function isFunctionEntry(entry: DocEntry): entry is FunctionEntry {
    return entry.entryType === EntryType.Function;
}

/** Gets whether the given entry is deprecated. */
export function isDeprecatedEntry<T extends HasJsDocTags>(entry: T) {
    return entry.jsdocTags.some((tag: JsDocTagEntry) => tag.name === 'deprecated');
}
