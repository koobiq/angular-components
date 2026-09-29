import { ClassEntry, DocEntry, EntryType, FunctionEntry, MemberType } from './entities';
import {
    flattenMembers,
    getEntryKind,
    getMemberDisplayName,
    getMemberDisplayType,
    groupEntries,
    hasMemberDetails,
    orderMembers,
    renderEntrySignature
} from './signature';
import { exampleAsMarkdown } from './transforms/example-markdown';
import { normalizeFunctionFields } from './transforms/normalize-function-fields';
import { resolveLinkTags } from './transforms/render-jsdoc-markdown';

type JsDocTags = { jsdocTags?: { name: string; comment: string }[] };

const FENCE = /^\s*(`{3,}|~{3,})/;

const ATX_HEADING = /^(\s{0,3})#{1,6}(?=\s|$)/;

// A span of code is matched first, so that a `<kbd>` written inside one stays as it is.
const CODE_SPAN_OR_KBD = /(`+).*?\1|<kbd>(.*?)<\/kbd>/g;

/**
 * JSDoc as Markdown that sits under the heading of its entry: `{@link Foo}` and `<kbd>` become inline code, as they do
 * in the pages, and every heading of the comment lands at the given depth, as the API page renders them — a comment
 * starts its outline from scratch.
 */
const jsDocMarkdown = (text: string, headingDepth: number): string => {
    // The fence that opened the block of code the line is in: only as long a fence of the same character closes it.
    let openFence: string | null = null;

    return resolveLinkTags(text)
        .split('\n')
        .map((line) => {
            const fence = FENCE.exec(line)?.[1];

            if (fence && !openFence) {
                openFence = fence;
            } else if (fence && fence[0] === openFence![0] && fence.length >= openFence!.length) {
                openFence = null;
            } else if (!openFence) {
                return line
                    .replace(ATX_HEADING, `$1${'#'.repeat(Math.min(6, headingDepth))}`)
                    .replace(CODE_SPAN_OR_KBD, (match, _fence, key?: string) =>
                        key === undefined ? match : inlineCode(key)
                    );
            }

            return line;
        })
        .join('\n');
};

/**
 * A function or method's description often lives under `signatures[0]` rather than on the entry itself. It is
 * Markdown, kept as written: joined into one line, a code block or a list in it would stop being one.
 */
const describe = (node: { description?: string; signatures?: { description?: string }[] }): string =>
    (node.description || node.signatures?.[0]?.description || '').trim();

/** The reason an entry or a member is deprecated — the page says it with a badge, the text has to spell it out. */
const describeDeprecation = ({ jsdocTags }: JsDocTags): string => {
    const reason = jsdocTags?.find(({ name }) => name === 'deprecated')?.comment.trim();

    return reason ? `Deprecated: ${reason}` : '';
};

/** Inline code that holds a backtick too: `` (`.${string}`)[] `` needs a longer fence than one backtick. */
const inlineCode = (text: string): string => {
    const code = text.replace(/\s*\n\s*/g, ' ');
    const fence = '`'.repeat(Math.max(0, ...(code.match(/`+/g) ?? []).map(({ length }) => length)) + 1);
    const padding = /^`|`$/.test(code) ? ' ' : '';

    return `${fence}${padding}${code}${padding}${fence}`;
};

/** A list item: the text's first line after the head, the rest indented to stay inside the item. */
const listItem = (indent: string, head: string, text: string): string[] => {
    const [first, ...rest] = text.split('\n');

    return [
        `${indent}- ${head}${first ? ` — ${first}` : ''}`,
        ...rest.map((line) => (line.trim() ? `${indent}  ${line}` : ''))
    ];
};

/** Documented parameters and the return value of a function or method, as nested list items. */
const renderCallDetails = (entry: DocEntry, indent: string, markdown: (text: string) => string): string[] => {
    const { params, returnType, returnDescription } = normalizeFunctionFields(entry as FunctionEntry);

    return [
        ...(params ?? [])
            .filter((param) => describe(param))
            .flatMap((param) =>
                listItem(indent, `${inlineCode(param.name)}: ${inlineCode(param.type)}`, markdown(describe(param)))
            ),
        ...(returnDescription?.trim()
            ? listItem(indent, `returns ${inlineCode(returnType)}`, markdown(returnDescription.trim()))
            : [])
    ];
};

/** An entry's or a member's `@example` blocks as Markdown, each indented to sit under what it belongs to. */
const renderExamples = (node: JsDocTags, indent: string): string[] =>
    (node.jsdocTags ?? [])
        .filter(({ name, comment }) => name === 'example' && comment.trim())
        .flatMap(({ comment }) => [
            '',
            ...exampleAsMarkdown(comment.trim())
                .split('\n')
                .map((line) => indent + line)
        ]);

/** One entry under a heading of the given depth: its kind, description and signature, then the members worth explaining. */
const renderEntry = (entry: DocEntry, depth: number): string => {
    const markdown = (text: string): string => jsDocMarkdown(text, depth + 1);
    const lines = [`${'#'.repeat(depth)} ${entry.name} (${getEntryKind(entry)})`];

    for (const text of [describeDeprecation(entry), describe(entry)]) {
        if (text) lines.push('', markdown(text));
    }

    lines.push(...renderExamples(entry, ''), '', '```ts', renderEntrySignature(entry), '```');

    const members = flattenMembers(orderMembers((entry as ClassEntry).members ?? [])).filter(hasMemberDetails);
    const details = [
        ...members.flatMap((member) => {
            const type = getMemberDisplayType(member);
            const summary = [describe(member), describeDeprecation(member)].filter(Boolean).join('\n\n');

            return [
                ...listItem(
                    '',
                    `${inlineCode(getMemberDisplayName(member))}${type ? `: ${inlineCode(type)}` : ''}`,
                    markdown(summary)
                ),
                ...(member.memberType === MemberType.Method
                    ? renderCallDetails(member as unknown as DocEntry, '  ', markdown)
                    : []),
                ...renderExamples(member, '  ')
            ];
        }),
        ...(entry.entryType === EntryType.Function ? renderCallDetails(entry, '', markdown) : [])
    ];

    if (details.length) lines.push('', ...details);

    return lines.join('\n');
};

/**
 * Renders an entry point's manifest (the doc model this tool writes to `dist/docs-content/api-manifest`, already
 * stripped of `@docs-private`/`@internal`) the way its `/api` page shows it — the same groups and the same signature
 * builder — so the page and its Markdown for agents cannot drift. Groups are headings of the given depth, entries one
 * level below them.
 */
export const renderApiAsMarkdown = (entries: DocEntry[], headingDepth: number): string =>
    groupEntries(entries)
        .map(({ group, entries: grouped }) => [
                `${'#'.repeat(headingDepth)} ${group.title}`,
                ...grouped.map((entry) => renderEntry(entry, headingDepth + 1))
            ].join('\n\n'))
        .join('\n\n');

/** The names of the NgModules an entry point exports: the tab leaves them out, an import line needs them. */
export const getNgModuleNames = (entries: DocEntry[]): string[] =>
    entries.filter(({ entryType }) => entryType === EntryType.NgModule).map(({ name }) => name);
