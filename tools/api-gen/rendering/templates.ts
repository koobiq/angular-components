import { renderCodeBlock } from './code-block';
import { EntryType, FunctionEntry, ParameterEntry, PropertyEntry } from './entities';
import {
    DocEntryRenderable,
    EnumEntryRenderable,
    FunctionEntryRenderable,
    JsDocTagRenderable,
    MemberEntryRenderable,
    ParameterEntryRenderable
} from './entities/renderables';
import {
    getEntryKind,
    getMemberDisplayName,
    getMemberDisplayType,
    hasMemberDetails,
    orderMembers,
    renderEntrySignature
} from './signature';
import { renderJsDocMarkdown } from './transforms/render-jsdoc-markdown';

/** One entry point's page: the entries in the order they are shown, and the import line above them. */
export interface EntryPointContext {
    primaryExportName: string;
    moduleImportPath: string;
    entries: DocEntryRenderable[];
}

/** Kinds a template uses directly; their badge is set apart from the plain TypeScript ones. */
const TEMPLATE_KINDS = new Set(['component', 'directive', 'pipe']);

/** Escapes text for the Angular template — same rule and reason as `compile-page.ts`'s `escapeTemplateText`. */
const escapeText = (text: string): string =>
    text.replace(/[&<>"{}@]/g, (char) => `&#${char.charCodeAt(0)};`).replace(/(&#123;|&#125;)(?=\1)/g, '$1<!---->');

const renderBadge = (label: string, color: string, compact = true): string =>
    `<kbq-badge${compact ? ' compact' : ''} badgeColor="${color}">${escapeText(label)}</kbq-badge>`;

const findDeprecatedTag = (jsdocTags: JsDocTagRenderable[]): JsDocTagRenderable | undefined =>
    jsdocTags.find((tag) => tag.name === 'deprecated');

/** Only the mark: the reason is written out under the description, not repeated in a tooltip. */
const renderDeprecatedBadge = (compact = true): string => renderBadge('Deprecated', 'fade-warning', compact);

/** The `@deprecated` reason under the description; the badge beside the name already says it is deprecated. */
const renderDeprecationNote = (jsdocTags: JsDocTagRenderable[]): string => {
    const tag = findDeprecatedTag(jsdocTags);

    return tag?.htmlComment ? `<div class="docs-api__deprecated-note">${tag.htmlComment}</div>` : '';
};

/** `@usageNotes` and `@example`, already compiled by `addHtmlUsageNotes`/`addHtmlJsDocTagComments`. */
const renderExtraNotes = (htmlUsageNotes: string, jsdocTags: JsDocTagRenderable[]): string => {
    const usageNotes = htmlUsageNotes ? `<div class="docs-api__note-title">Usage notes</div>\n${htmlUsageNotes}` : '';
    const examples = jsdocTags
        .filter((tag) => tag.name === 'example' && tag.htmlComment)
        .map((tag) => `<div class="docs-api__note-title">Example</div>\n${tag.htmlComment}`)
        .join('\n');

    return [usageNotes, examples].filter(Boolean).join('\n');
};

const renderTerm = (name: string, type: string, badges: string[]): string =>
    [
        `<code class="docs-api__term-name">${escapeText(name)}</code>`,
        type ? `<code class="docs-api__term-type">${escapeText(type)}</code>` : '',
        ...badges
    ]
        .filter(Boolean)
        .join(' ');

/** Parameters with a description; the signature above already lists each one with its type. */
function renderParams(params: ParameterEntryRenderable[] | undefined): string {
    const documented = (params ?? []).filter((param) => param.description?.trim());

    if (!documented.length) return '';

    const items = documented.map(
        (param) => `<div class="docs-api__param">
    <dt>${renderTerm(`${param.name}${param.isOptional ? '?' : ''}`, withoutUndefined(param), [])}</dt>
    <dd>${param.htmlDescription}</dd>
</div>`
    );

    return `<div class="docs-api__note-title">Parameters</div>
<dl class="docs-api__params">
${items.join('\n')}
</dl>`;
}

const withoutUndefined = ({ type, isOptional }: ParameterEntry): string =>
    isOptional ? type.replace(/\s*\|\s*undefined$/, '') : type;

/** The return value laid out like a parameter: its type where a parameter has its name and type. */
function renderReturns(entry: FunctionEntry, context: string): string {
    if (!entry.returnDescription?.trim()) return '';

    return `<div class="docs-api__note-title">Returns</div>
<dl class="docs-api__params">
<div class="docs-api__param">
    <dt><code class="docs-api__term-type">${escapeText(entry.returnType)}</code></dt>
    <dd>${renderJsDocMarkdown(entry.returnDescription, `${context} @returns`)}</dd>
</div>
</dl>`;
}

function renderMember(entryName: string, member: MemberEntryRenderable): string {
    const { isRequiredInput } = member as MemberEntryRenderable & PropertyEntry;
    const origin = member.forwardedFrom?.directive ?? member.inheritedFrom;
    const badges = [
        // Not an error colour: a required input is something to notice, not something that went wrong.
        isRequiredInput ? renderBadge('required', 'fade-theme') : '',
        member.isDeprecated ? renderDeprecatedBadge() : '',
        origin ? renderBadge(`from ${origin}`, 'fade-contrast') : ''
    ].filter(Boolean);
    const method = member as unknown as FunctionEntryRenderable;

    return `<div id="${escapeText(`${entryName}-${member.name}`)}" class="docs-api__member">
    <dt>${renderTerm(getMemberDisplayName(member), getMemberDisplayType(member), badges)}</dt>
    <dd>
        ${member.htmlDescription}
        ${member.isDeprecated ? renderDeprecationNote(member.jsdocTags) : ''}
        ${renderExtraNotes('', member.jsdocTags)}
        ${method.params ? renderParams(method.params) : ''}
        ${method.params ? renderReturns(method, `${entryName}.${member.name}`) : ''}
    </dd>
</div>`;
}

/** The members a reader may want explained, in the order the signature lists them. */
function renderMembers(entryName: string, members: MemberEntryRenderable[]): string {
    const documented = (orderMembers(members) as MemberEntryRenderable[]).filter(hasMemberDetails);

    if (!documented.length) return '';

    return `<dl class="docs-api__members">
${documented.map((member) => renderMember(entryName, member)).join('\n')}
</dl>`;
}

function renderDetails(entry: DocEntryRenderable): string {
    switch (entry.entryType) {
        case EntryType.TypeAlias:
        case EntryType.Constant:
            return '';
        case EntryType.Function: {
            const fn = entry as FunctionEntryRenderable;

            return `${renderParams(fn.params)}\n${renderReturns(fn, fn.name)}`;
        }
        case EntryType.Enum:
            return renderMembers(entry.name, (entry as EnumEntryRenderable).members);
        default:
            return renderMembers(
                entry.name,
                (entry as DocEntryRenderable & { members: MemberEntryRenderable[] }).members
            );
    }
}

function renderEntry(entry: DocEntryRenderable): string {
    const kind = getEntryKind(entry);
    const badges = [
        renderBadge(kind, TEMPLATE_KINDS.has(kind) ? 'fade-theme' : 'fade-contrast', false),
        entry.isDeprecated ? renderDeprecatedBadge(false) : ''
    ].filter(Boolean);

    return `<section class="docs-api__entry">
<div class="docs-api__entry-header">
    <h3 id="${escapeText(entry.name)}" class="docs-header-link kbq-markdown__h3 docs-api__entry-name">${escapeText(entry.name)}</h3>
    ${badges.join(' ')}
</div>
${entry.isDeprecated ? renderDeprecationNote(entry.jsdocTags) : ''}
${entry.htmlDescription ? `<div class="docs-api__entry-description">${entry.htmlDescription}</div>` : ''}
${renderExtraNotes(entry.htmlUsageNotes, entry.jsdocTags)}
${renderCodeBlock(renderEntrySignature(entry), { language: 'typescript', lineNumbers: true })}
${renderDetails(entry)}
</section>`;
}

/**
 * Angular addresses a node's injector with 15 bits of its view's slot index, so a single template cannot
 * grow past about 32 thousand slots: beyond that the runtime reads the wrong slot and a server render
 * crashes. A page with more nodes than this goes into parts, each a component with a view of its own.
 */
const MAX_NODES_PER_VIEW = 3000;

/** Elements and non-blank text nodes — close enough to the slots a template takes to keep under the limit. */
const countNodes = (template: string): number =>
    (template.match(/<[a-z]/gi)?.length ?? 0) + (template.match(/>[^<]*\S[^<]*</g)?.length ?? 0);

/** Groups rendered entries so that each group stays within one view's node budget. */
function splitIntoParts(entries: string[]): string[][] {
    return entries.reduce<{ parts: string[][]; nodes: number }>(
        ({ parts, nodes }, entry) => {
            const entryNodes = countNodes(entry);

            if (parts.length && nodes + entryNodes <= MAX_NODES_PER_VIEW) {
                parts[parts.length - 1].push(entry);

                return { parts, nodes: nodes + entryNodes };
            }

            return { parts: [...parts, [entry]], nodes: entryNodes };
        },
        { parts: [], nodes: 0 }
    ).parts;
}

/** The template of an entry point's page and, when it is too large for one view, those of its parts. */
interface EntryPointTemplates {
    page: string;
    parts: string[];
}

/**
 * Builds the Angular templates for one entry point. `partSelector` names the element a part is rendered
 * with; the page lists the parts in order, so the document reads the same either way.
 */
export function renderEntryPointTemplates(
    context: EntryPointContext,
    partSelector: (index: number) => string
): EntryPointTemplates {
    // A code block like the signatures below it: highlighted, copyable, and escaped for the template.
    const importLine = context.primaryExportName
        ? renderCodeBlock(`import { ${context.primaryExportName} } from '${context.moduleImportPath}';`, {
              language: 'typescript',
              extraClass: 'docs-api__import'
          })
        : '';
    const parts = splitIntoParts(context.entries.map(renderEntry));
    const content =
        parts.length > 1
            ? parts.map((_, index) => `<${partSelector(index)} />`).join('\n')
            : (parts[0] ?? []).join('\n');

    return {
        page: `<div class="kbq-markdown docs-api">\n${importLine}\n${content}\n</div>`,
        parts: parts.length > 1 ? parts.map((part) => part.join('\n')) : []
    };
}
