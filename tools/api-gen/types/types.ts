import { DeclaredFunctionType, DocEntry, MemberEntry } from '../rendering/entities';

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

/** One `hostDirectives` entry: the directive applied, and the inputs it surfaces on the host. */
export interface HostDirectiveMetadata {
    name: string;
    /** Forwarded inputs, as `{ own: exposedAs }` — the two differ only when the entry aliases them. */
    inputs: Record<string, string>;
    /** Forwarded outputs, the same way; left out when there are none. */
    outputs?: Record<string, string>;
}

/** How a member binds in a template, as its declaration says: the names it binds under. */
export interface MemberBinding {
    input?: string;
    output?: string;
    required?: boolean;
}

/** The parameter and return types of one call signature as the source writes them; a gap has no annotation. */
export interface DeclaredSignature {
    params: (string | undefined)[];
    returnType?: string;
}

/** A function's or method's signatures as the source writes them: its overloads, then its implementation. */
export interface DeclaredCallable {
    overloads: DeclaredSignature[];
    implementation?: DeclaredSignature;
}

/** What the source says about a member that the compiler's resolved entry does not. */
export interface MemberSourceMetadata extends Pick<MemberEntry, 'signalApi' | 'declaredType' | 'defaultValue'> {
    /**
     * Angular's extractor marks the inputs and outputs a class declares itself, not the ones it inherits
     * from a base directive, so an inherited binding is only known from here.
     */
    binding?: MemberBinding;
    callable?: DeclaredCallable;
}

/** What the source says about an exported constant or function that the compiler's resolved entry does not. */
export interface DeclarationSourceMetadata {
    declaredType?: string;
    declaredFunctionType?: DeclaredFunctionType;
    callable?: DeclaredCallable;
    /** The constant this one is another name for: `export const newName = oldName;`. */
    aliasOf?: string;
}

/** Read from the source of a class or an interface, next to what Angular's extractor reports for it. */
export interface ClassEntryMetadata {
    decorators: string[];
    /**
     * Every name in the `extends` clause — an interface can extend several. A utility type such as
     * `Omit<KbqPipe, 'value'>` stands for the type it narrows, where the members come from.
     */
    bases: string[];
    hostDirectives: HostDirectiveMetadata[];
    /** Every member the declaration itself declares, by name. */
    members: Record<string, MemberSourceMetadata>;
    /** Index signatures as written, one per line. */
    indexSignatures?: string[];
    /** The argument of `@Injectable(...)` as written. */
    injectableOptions?: string;
}

export interface ModuleInfo {
    moduleName: string;
    exclude?: string[];
    include?: string[];
}
