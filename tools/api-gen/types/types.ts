import { DocEntry } from '../rendering/entities';

export type PackageMetadata = { resolvedPath: string; tsCompilerPath: string; packageName: string };

export interface PackageApiInfo<T = DocEntry> {
    packageName: string;
    entries: T[];
}

/** The JSON data file format for extracted API reference info. */
export interface EntryCollection<T = any> {
    moduleName: string;
    packagesApiInfo: PackageApiInfo<T>[];
}

export interface ManifestEntry extends DocEntry {
    publicUrl: string;
}

/** One `hostDirectives` entry: the directive applied, and the inputs it surfaces on the host. */
export interface HostDirectiveMetadata {
    name: string;
    /** Forwarded inputs, as `{ own: exposedAs }` — the two differ only when the entry aliases them. */
    inputs: Record<string, string>;
}

export interface ClassEntryMetadata {
    decorators: string[];
    baseClass: string | null;
    hostDirectives: HostDirectiveMetadata[];
}

export interface ModuleInfo {
    moduleName: string;
    exclude?: string[];
    include?: string[];
}

export type Manifest = Record<string, PackageApiInfo<ManifestEntry>[]>;
