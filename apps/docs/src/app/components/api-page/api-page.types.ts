/**
 * The API tab of an entry point as data: `tools/api-gen` writes one `DocsApiEntryPoint` per entry point of
 * the library, and `DocsApiPage` renders any of them. Types only, so that the generator imports them too.
 */

/** A block of JSDoc text: prose compiled from Markdown into HTML, or code, which the page highlights. */
export type DocsApiBlock = { type: 'html'; html: string } | { type: 'code'; code: string; language: string };

/** A parameter with a description; the signature above already lists every parameter. */
export interface DocsApiParam {
    /** The name, with `?` when the parameter is optional. */
    name: string;
    type: string;
    description: DocsApiBlock[];
}

/** The value a function or method returns, when its JSDoc describes it. */
export interface DocsApiReturns {
    type: string;
    description: DocsApiBlock[];
}

/** What an entry and a member are documented with alike. */
interface DocsApiDocs {
    /** Present when it is deprecated, with the reason when the tag gives one. */
    deprecated?: { reason?: DocsApiBlock[] };
    description?: DocsApiBlock[];
    examples?: DocsApiBlock[][];
    params?: DocsApiParam[];
    returns?: DocsApiReturns;
}

/** A member worth explaining, listed under the signature of its entry. */
export interface DocsApiMember extends DocsApiDocs {
    /** The id of its anchor, such as `KbqSelect-multiple`. */
    id: string;
    /** The member as a template writes it: `[value]`, `(changed)`, `[(opened)]`, `open()`. */
    name: string;
    /** The value an input takes, the payload an output emits, what a method returns. */
    type?: string;
    required?: boolean;
    /** The directive or the class it comes from, when the entry does not declare it itself. */
    origin?: string;
}

/** A declaration the entry point exports. */
export interface DocsApiEntry extends DocsApiDocs {
    name: string;
    /** As the badge beside the name labels it: `component`, `directive`, `class`, `interface`... */
    kind: string;
    /** TypeScript, the way the source declares it. */
    signature: string;
    members?: DocsApiMember[];
}

/** The API of one entry point. */
export interface DocsApiEntryPoint {
    /** The import path, such as `@koobiq/components/select`. */
    path: string;
    /** What the import line above the entries names: the NgModule of the entry point, if it has one. */
    primaryExport?: string;
    entries: DocsApiEntry[];
}

/** Loads the API of the entry point a structure item documents, keyed by the id of the item. */
export type DocsApiEntryPoints = Partial<Record<string, () => Promise<{ default: DocsApiEntryPoint }>>>;
