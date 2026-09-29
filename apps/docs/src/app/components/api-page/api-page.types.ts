/**
 * The API tab of an entry point as data: `tools/api-gen` writes one `DocsApiEntryPoint` per entry point of
 * the library, and `DocsApiPage` renders any of them. Types only, so that the generator imports them too.
 */

/** A block of JSDoc text: prose compiled from Markdown into HTML, or code, which the page highlights. */
export type DocsApiBlock = { type: 'html'; html: string } | { type: 'code'; code: string; language: string };

/** A piece of a type: text, or the name of an entry documented on an API tab, which links to its section. */
export interface DocsApiTypePart {
    text: string;
    link?: DocsApiTypeLink;
}

/** Where the section of an entry named in a type is, the id of the section being the name. */
export interface DocsApiTypeLink {
    /** The API tab showing it, without the locale — `components/core/api` — unless it is the tab the type is on. */
    page?: string;
}

/** A parameter with a description; the signature above already lists every parameter. */
export interface DocsApiParam {
    /** The name, with `?` when the parameter is optional. */
    name: string;
    type: DocsApiTypePart[];
    description: DocsApiBlock[];
}

/** The value a function or method returns, when its JSDoc describes it. */
export interface DocsApiReturns {
    type: DocsApiTypePart[];
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
    /**
     * The name a template binds the member by, `ariaLabel` bound as `aria-label`; a method as `open()`; a field of
     * an object literal type by its path, `indent.vertical`.
     */
    name: string;
    /** How a template binds the member: `[value]`, `(changed)` or both ways, `[(opened)]`, a model. */
    binding?: 'input' | 'output' | 'model';
    /** The value an input takes, the payload an output emits, what a method returns. */
    type?: DocsApiTypePart[];
    required?: boolean;
    /** Set on a field or a method an object may leave out; a binding is marked `required` instead. */
    optional?: boolean;
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

/** Entries of the kinds a reader looks for together: the components, the services, the types... */
export interface DocsApiGroup {
    /** The id of its heading, such as `api-services`. */
    id: string;
    title: string;
    entries: DocsApiEntry[];
}

/** The API of one entry point. */
export interface DocsApiEntryPoint {
    /** The import path, such as `@koobiq/components/select`. */
    path: string;
    /** What the import line above the entries names: the NgModule of the entry point, if it has one. */
    primaryExport?: string;
    /** The entries in their groups; a tab with one group shows no heading for it. */
    groups: DocsApiGroup[];
}

/** Loads the API of the entry point a structure item documents, keyed by the id of the item. */
export type DocsApiEntryPoints = Partial<Record<string, () => Promise<{ default: DocsApiEntryPoint }>>>;
