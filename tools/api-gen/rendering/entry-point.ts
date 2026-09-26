import type {
    DocsApiEntry,
    DocsApiEntryPoint,
    DocsApiMember,
    DocsApiParam,
    DocsApiReturns
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
    compareEntries,
    getEntryKind,
    getMemberDisplayName,
    getMemberDisplayType,
    hasMemberDetails,
    orderMembers,
    renderEntrySignature,
    withoutUndefined
} from './signature';
import { exampleAsMarkdown } from './transforms/example-markdown';
import { normalizeFunctionFields } from './transforms/normalize-function-fields';
import { renderJsDocMarkdown } from './transforms/render-jsdoc-markdown';

/** An empty list is left out: the data goes to the browser as it is. */
const nonEmpty = <T>(items: T[]): T[] | undefined => (items.length ? items : undefined);

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
const getParams = (params: ParameterEntry[], context: string): DocsApiParam[] =>
    params
        .filter(({ description }) => description?.trim())
        .map(({ name, type, isOptional, description }) => ({
            name: `${name}${isOptional ? '?' : ''}`,
            type: isOptional ? withoutUndefined(type) : type,
            description: renderJsDocMarkdown(description, `${context}(${name})`)
        }));

const getReturns = ({ returnType, returnDescription }: FunctionEntry, context: string): DocsApiReturns | undefined =>
    returnDescription?.trim()
        ? { type: returnType, description: renderJsDocMarkdown(returnDescription, `${context} @returns`) }
        : undefined;

/** The parameters and the return value of a function or a method whose fields are normalized. */
const getCallDocs = (fn: FunctionEntry, context: string): Pick<DocsApiEntry, 'params' | 'returns'> => ({
    params: nonEmpty(getParams(fn.params, context)),
    returns: getReturns(fn, context)
});

function getMember(entryName: string, member: MemberEntry): DocsApiMember {
    const context = `${entryName}.${member.name}`;
    const isMethod = member.memberType === MemberType.Method;
    // A method documented on its overloads keeps its text under `signatures[0]`.
    const documented = isMethod ? normalizeFunctionFields(member as MemberEntry & Partial<FunctionEntry>) : member;

    return {
        id: `${entryName}-${member.name}`,
        name: getMemberDisplayName(member),
        type: getMemberDisplayType(member) || undefined,
        required: (member as PropertyEntry).isRequiredInput || undefined,
        origin: member.forwardedFrom?.directive ?? member.inheritedFrom,
        ...getDocs(documented, context),
        ...(isMethod ? getCallDocs(documented as MemberEntry & FunctionEntry, context) : {})
    };
}

/** What an entry lists under its signature: its members, or the parameters and the return value of a function. */
function getDetails(entry: DocEntry): Pick<DocsApiEntry, 'members' | 'params' | 'returns'> {
    switch (entry.entryType) {
        case EntryType.TypeAlias:
        case EntryType.Constant:
            return {};
        case EntryType.Function:
            return getCallDocs(entry as FunctionEntry, entry.name);
        default: {
            // The members a reader may want explained, in the order the signature lists the ones the class declares.
            const members = orderMembers((entry as ClassEntry).members ?? []).filter(hasMemberDetails);

            return { members: nonEmpty(members.map((member) => getMember(entry.name, member))) };
        }
    }
}

function getEntry(entry: DocEntry): DocsApiEntry {
    // A function documented on its overloads keeps its text under `signatures[0]`.
    const documented = entry.entryType === EntryType.Function ? normalizeFunctionFields(entry as FunctionEntry) : entry;

    return {
        name: entry.name,
        kind: getEntryKind(entry),
        ...getDocs(documented, entry.name),
        signature: renderEntrySignature(documented),
        ...getDetails(documented)
    };
}

/**
 * The API tab of one entry point as the data `DocsApiPage` renders: the entries ordered by kind and then by
 * name, and the import of the NgModule. The module itself is not listed — it only re-exports what the page
 * already shows.
 */
export function getApiEntryPoint(entries: DocEntry[], moduleName: string, packageName: string): DocsApiEntryPoint {
    // `core` declares a dozen of modules, and none of them is the one to import.
    const ngModule =
        packageName === 'core'
            ? undefined
            : entries.find((entry) => entry.entryType === EntryType.NgModule && !isDeprecatedEntry(entry));

    return {
        path: `@koobiq/${moduleName}/${packageName}`,
        primaryExport: ngModule?.name,
        entries: entries
            .filter(({ entryType }) => entryType !== EntryType.NgModule)
            .sort(compareEntries)
            .map(getEntry)
    };
}
