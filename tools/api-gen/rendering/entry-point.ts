import type {
    DocsApiEntry,
    DocsApiEntryPoint,
    DocsApiMember,
    DocsApiParam,
    DocsApiReturns,
    DocsApiTypePart
} from '../../../apps/docs/src/app/components/api-page/api-page.types';
import {
    ClassEntry,
    DocEntry,
    EntryType,
    FunctionEntry,
    JsDocTagEntry,
    MemberEntry,
    MemberType,
    ParameterEntry,
    PropertyEntry
} from './entities';
import { isDeprecatedEntry } from './entities/categorization';
import {
    flattenMembers,
    getEntryKind,
    getMemberBinding,
    getMemberDisplayType,
    getMemberName,
    groupEntries,
    hasMemberDetails,
    isOptionalMember,
    orderMembers,
    renderEntrySignature,
    withoutUndefined
} from './signature';
import { exampleAsMarkdown } from './transforms/example-markdown';
import { normalizeFunctionFields } from './transforms/normalize-function-fields';
import { renderJsDocMarkdown } from './transforms/render-jsdoc-markdown';

/** An empty list is left out: the data goes to the browser as it is. */
const nonEmpty = <T>(items: T[]): T[] | undefined => (items.length ? items : undefined);

/** Where an entry is documented: on the API tab of its entry point. */
export interface ApiEntryPage {
    /** The import path of the entry point, `@koobiq/components/core`. */
    entryPoint: string;
    /** The API tab showing the entry point, without the locale: `components/core/api`. */
    page: string;
    /** Set on a constant or a function, which declares no type: a type names it only after `typeof`. */
    isValue?: boolean;
}

/** What the types of an entry link to. */
export interface TypeLinks {
    /** Where each entry the API tabs document is, by its name. */
    pages: ReadonlyMap<string, ApiEntryPage>;
    /** The entry point whose tab the types are on: an entry of it is linked on the tab itself. */
    entryPoint: string;
    /** The entry the types are shown in, which a link would only lead back to. */
    self: string;
}

/** A quoted string, taken whole so that a name inside it stays text, or an identifier. */
const TYPE_TOKEN = /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1|[A-Za-z_$][\w$]*/g;

/**
 * The type in parts, the names of the entries documented on an API tab linked to their sections. A name counts where
 * it names a type: not inside a string, after the dot of a member access (a spread is no access), or as the name of a
 * field or a parameter, followed by a colon.
 * The name of a constant or a function counts only after `typeof`: anywhere else, `T` is a type parameter rather than
 * the key code.
 */
export function linkType(type: string, { pages, entryPoint, self }: TypeLinks): DocsApiTypePart[] {
    const parts: DocsApiTypePart[] = [];
    let textStart = 0;

    for (const { 0: token, index } of type.matchAll(TYPE_TOKEN)) {
        const target = pages.get(token);
        const before = type.slice(0, index).trimEnd();
        const isFieldName = /^\??:/.test(type.slice(index + token.length).trimStart()) && /(^|[{;,(])$/.test(before);
        const isTypeQuery = /\btypeof$/.test(before);
        const isMemberAccess = /(^|[^.])\.$/.test(before);

        if (!target || (target.isValue && !isTypeQuery) || token === self || isMemberAccess || isFieldName) continue;

        if (index > textStart) parts.push({ text: type.slice(textStart, index) });

        parts.push({ text: token, link: target.entryPoint === entryPoint ? {} : { page: target.page } });
        textStart = index + token.length;
    }

    return textStart < type.length ? [...parts, { text: type.slice(textStart) }] : parts;
}

interface Documented {
    description?: string;
    jsdocTags?: JsDocTagEntry[];
}

/** What an entry and a member are documented with alike: the deprecation, the description and the examples. */
function getDocs(
    { description, jsdocTags = [] }: Documented,
    context: string
): Pick<DocsApiEntry, 'deprecated' | 'description' | 'examples'> {
    const deprecated = jsdocTags.find(({ name }) => name === 'deprecated');
    // A comment may give its text in a `@description` tag rather than open with it.
    const text = description || jsdocTags.find(({ name }) => name === 'description')?.comment || '';
    const examples = jsdocTags
        .filter(({ name, comment }) => name === 'example' && comment.trim())
        .map(({ comment }) => renderJsDocMarkdown(exampleAsMarkdown(comment), `${context} @example`));

    return {
        deprecated: deprecated && {
            reason: nonEmpty(renderJsDocMarkdown(deprecated.comment, `${context} @deprecated`))
        },
        description: nonEmpty(renderJsDocMarkdown(text, context)),
        examples: nonEmpty(examples)
    };
}

/** Parameters with a description; the signature above lists every one of them. */
const getParams = (params: ParameterEntry[], context: string, links: TypeLinks): DocsApiParam[] =>
    params
        .filter(({ description }) => description?.trim())
        .map(({ name, type, isOptional, description }) => ({
            name: `${name}${isOptional ? '?' : ''}`,
            type: linkType(isOptional ? withoutUndefined(type) : type, links),
            description: renderJsDocMarkdown(description, `${context}(${name})`)
        }));

const getReturns = (
    { returnType, returnDescription }: FunctionEntry,
    context: string,
    links: TypeLinks
): DocsApiReturns | undefined =>
    returnDescription?.trim()
        ? {
              type: linkType(returnType, links),
              description: renderJsDocMarkdown(returnDescription, `${context} @returns`)
          }
        : undefined;

/** The parameters and the return value of a function or a method whose fields are normalized. */
const getCallDocs = (
    fn: FunctionEntry,
    context: string,
    links: TypeLinks
): Pick<DocsApiEntry, 'params' | 'returns'> => ({
    params: nonEmpty(getParams(fn.params, context, links)),
    returns: getReturns(fn, context, links)
});

function getMember(entryName: string, member: MemberEntry, links: TypeLinks): DocsApiMember {
    const context = `${entryName}.${member.name}`;
    const isMethod = member.memberType === MemberType.Method;
    // A method documented on its overloads keeps its text under `signatures[0]`.
    const documented = isMethod ? normalizeFunctionFields(member as MemberEntry & Partial<FunctionEntry>) : member;
    const type = getMemberDisplayType(member);

    return {
        id: `${entryName}-${member.name}`,
        name: getMemberName(member),
        binding: getMemberBinding(member),
        type: type ? linkType(type, links) : undefined,
        required: (member as PropertyEntry).isRequiredInput || undefined,
        optional: isOptionalMember(member) || undefined,
        ...getDocs(documented, context),
        ...(isMethod ? getCallDocs(documented as MemberEntry & FunctionEntry, context, links) : {})
    };
}

/** What an entry lists under its signature: its members, or the parameters and the return value of a function. */
function getDetails(entry: DocEntry, links: TypeLinks): Pick<DocsApiEntry, 'members' | 'params' | 'returns'> {
    switch (entry.entryType) {
        case EntryType.Constant:
            return {};
        case EntryType.Function:
            return getCallDocs(entry as FunctionEntry, entry.name, links);
        default: {
            // The members a reader may want explained, in the order the signature lists the ones the class declares,
            // and the fields of an object literal type after the member they belong to. A type alias has members
            // when it names an object literal.
            const members = flattenMembers(orderMembers((entry as ClassEntry).members ?? [])).filter(hasMemberDetails);

            return { members: nonEmpty(members.map((member) => getMember(entry.name, member, links))) };
        }
    }
}

function getEntry(entry: DocEntry, links: TypeLinks): DocsApiEntry {
    // A function documented on its overloads keeps its text under `signatures[0]`.
    const documented = entry.entryType === EntryType.Function ? normalizeFunctionFields(entry as FunctionEntry) : entry;

    return {
        name: entry.name,
        kind: getEntryKind(entry),
        ...getDocs(documented, entry.name),
        signature: renderEntrySignature(documented),
        ...getDetails(documented, links)
    };
}

/**
 * The API tab of one entry point as the data `DocsApiPage` renders: the entries in their groups, each ordered by
 * name, and the import of the NgModule. The module itself is not listed — it only re-exports what the page
 * already shows. The types in it link to the entries of `pages`.
 */
export function getApiEntryPoint(
    entries: DocEntry[],
    moduleName: string,
    packageName: string,
    pages: ReadonlyMap<string, ApiEntryPage> = new Map()
): DocsApiEntryPoint {
    const path = `@koobiq/${moduleName}/${packageName}`;
    // `core` declares a dozen of modules, and none of them is the one to import.
    const ngModule =
        packageName === 'core'
            ? undefined
            : entries.find((entry) => entry.entryType === EntryType.NgModule && !isDeprecatedEntry(entry));

    return {
        path,
        primaryExport: ngModule?.name,
        groups: groupEntries(entries).map(({ group: { id, title }, entries: grouped }) => ({
            id,
            title,
            entries: grouped.map((entry) => getEntry(entry, { pages, entryPoint: path, self: entry.name }))
        }))
    };
}
