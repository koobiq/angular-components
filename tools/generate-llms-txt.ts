import { existsSync, readFileSync, writeFileSync } from 'fs';
import { globSync } from 'glob';
import { dirname, join } from 'path';
import { DocsLocale } from '../apps/docs/src/app/constants/locale';
import {
    docsGetCategories,
    DocsStructureCategoryId,
    DocsStructureItemId,
    DocsStructureItemTab
} from '../apps/docs/src/app/structure';
import { ClassEntry, DocEntry, EntryType, FunctionEntry, MemberType } from './api-gen/rendering/entities';
import {
    compareEntries,
    getEntryKind,
    getMemberDisplayName,
    getMemberDisplayType,
    hasMemberDetails,
    orderMembers,
    renderEntrySignature
} from './api-gen/rendering/signature';
import { exampleAsMarkdown } from './api-gen/rendering/transforms/example-markdown';
import { normalizeFunctionFields } from './api-gen/rendering/transforms/normalize-function-fields';
import { DOCS_PAGE_SOURCES, parsePageSource } from './docs-pages/sources';

const isFileExists = (relativePath: string): boolean => {
    const exists = existsSync(join(process.cwd(), relativePath));

    if (!exists) console.warn(`⚠️ Skipping missing file: ${relativePath}`);

    return exists;
};

const readFileContent = (relativePath: string): string => readFileSync(join(process.cwd(), relativePath), 'utf-8');

/**
 * A function or method's description often lives under `signatures[0]` rather than on the entry itself. It is
 * Markdown, kept as written: joined into one line, a code block or a list in it would stop being one.
 */
const describe = (node: { description?: string; signatures?: { description?: string }[] }): string =>
    (node.description || node.signatures?.[0]?.description || '').trim();

/** The reason an entry or a member is deprecated — the page says it with a badge, the text has to spell it out. */
const describeDeprecation = ({ jsdocTags }: { jsdocTags?: { name: string; comment: string }[] }): string => {
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
const renderCallDetails = (entry: DocEntry, indent: string): string[] => {
    const { params, returnType, returnDescription } = normalizeFunctionFields(entry as FunctionEntry);

    return [
        ...(params ?? [])
            .filter((param) => describe(param))
            .flatMap((param) =>
                listItem(indent, `${inlineCode(param.name)}: ${inlineCode(param.type)}`, describe(param))
            ),
        ...(returnDescription?.trim()
            ? listItem(indent, `returns ${inlineCode(returnType)}`, returnDescription.trim())
            : [])
    ];
};

/** An entry's or a member's `@example` blocks as Markdown, each indented to sit under what it belongs to. */
const renderExamples = (node: { jsdocTags?: { name: string; comment: string }[] }, indent: string): string[] =>
    (node.jsdocTags ?? [])
        .filter(({ name, comment }) => name === 'example' && comment.trim())
        .flatMap(({ comment }) => [
            '',
            ...exampleAsMarkdown(comment.trim())
                .split('\n')
                .map((line) => indent + line)
        ]);

/**
 * Renders an entry point's manifest (`tools/api-gen`'s doc model, already stripped of `@docs-private`/
 * `@internal`) the way its `/api` page shows it: per entry its kind, description and signature, then the
 * members worth explaining — the same signature builder, so the page and `llms-full.txt` cannot drift.
 */
const renderManifestAsMarkdown = (entries: DocEntry[]): string =>
    entries
        .filter((entry) => entry.entryType !== EntryType.NgModule)
        .sort(compareEntries)
        .map((entry) => {
            const lines = [`##### ${entry.name} (${getEntryKind(entry)})`];

            for (const text of [describeDeprecation(entry), describe(entry)]) {
                if (text) lines.push('', text);
            }

            lines.push(...renderExamples(entry, ''), '', '```ts', renderEntrySignature(entry), '```');

            const members = orderMembers((entry as ClassEntry).members ?? []).filter(hasMemberDetails);
            const details = [
                ...members.flatMap((member) => {
                    const type = getMemberDisplayType(member);
                    const summary = [describe(member), describeDeprecation(member)].filter(Boolean).join('\n\n');

                    return [
                        ...listItem(
                            '',
                            `${inlineCode(getMemberDisplayName(member))}${type ? `: ${inlineCode(type)}` : ''}`,
                            summary
                        ),
                        ...(member.memberType === MemberType.Method
                            ? renderCallDetails(member as unknown as DocEntry, '  ')
                            : []),
                        ...renderExamples(member, '  ')
                    ];
                }),
                ...(entry.entryType === EntryType.Function ? renderCallDetails(entry, '') : [])
            ];

            if (details.length) lines.push('', ...details);

            return lines.join('\n');
        })
        .join('\n\n');

const FILE_NAME = 'llms.txt';
const FILE_NAME_FULL = 'llms-full.txt';
const TIME_LABEL = 'Runtime';

/** English overview page of every structure item, found the way the documentation site compiles its pages. */
const OVERVIEW_PATHS = new Map(
    DOCS_PAGE_SOURCES.flatMap((pattern) => globSync(pattern, { windowsPathsNoEscape: true, posix: true }))
        .map(parsePageSource)
        .filter(({ tab, locale }) => tab === DocsStructureItemTab.Overview && locale === DocsLocale.En)
        .map(({ id, path }): [string, string] => [id, path])
);

console.time(TIME_LABEL);

try {
    const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

    console.info(`🚀 Generating ${FILE_NAME} / ${FILE_NAME_FULL} for ${version} version`);

    const GITHUB_RAW_CONTENT_URL = `https://raw.githubusercontent.com/koobiq/angular-components/refs/tags/${version}`;

    const ITEM_OVERRIDES: Partial<
        Record<
            DocsStructureItemId,
            Partial<{
                skip: boolean;
                examplePath: string;
            }>
        >
    > = {
        [DocsStructureItemId.DesignTokens]: {
            skip: true
        },
        [DocsStructureItemId.LayoutFlex]: { skip: true },
        [DocsStructureItemId.AgGrid]: {
            examplePath: `packages/docs-examples/components/ag-grid/ag-grid-overview/ag-grid-overview-example.ts`
        },
        [DocsStructureItemId.Icon]: { examplePath: '' },
        [DocsStructureItemId.Core]: { examplePath: '' }
    };

    let content = `<!-- This file is auto-generated. Do not edit it manually! -->

# Koobiq Angular

> Koobiq is an open-source design system for designers and developers, focused on designing products related to **information security**.

`;

    let contentFull = content;

    for (const category of docsGetCategories()) {
        if (category.id === DocsStructureCategoryId.Other) {
            continue;
        }

        if (category.id === DocsStructureCategoryId.Icons) {
            try {
                const iconsPackageDir = dirname(require.resolve('@koobiq/icons/package.json'));

                if (existsSync(iconsPackageDir)) {
                    content += `## ${category.id}\n\n`;
                    contentFull += `## ${category.id}\n\n`;

                    const { version: iconsVersion } = JSON.parse(
                        readFileSync(join(iconsPackageDir, 'package.json'), 'utf-8')
                    );

                    content += `- [icon reference](https://raw.githubusercontent.com/koobiq/icons/${iconsVersion}/llms.txt) — brief explanation of package (@koobiq/icons@${iconsVersion})\n\n`;
                    contentFull += `- [icon full reference](https://raw.githubusercontent.com/koobiq/icons/${iconsVersion}/llms-full.txt) — every icon name, sizes, tags, and import examples (@koobiq/icons@${iconsVersion})\n\n`;
                }
            } catch (error) {
                console.warn(`⚠️ Skipping icons reference: could not resolve @koobiq/icons package (${error})`);
            }
        }

        if (category.id === DocsStructureCategoryId.Main) {
            for (const item of category.items) {
                const override = ITEM_OVERRIDES[item.id];

                if (override?.skip) continue;

                const path = OVERVIEW_PATHS.get(item.id);

                if (!path) {
                    console.warn(`⚠️ Skipping ${item.id}: it has no English overview page`);

                    continue;
                }

                content += `- [${item.id}](${GITHUB_RAW_CONTENT_URL}/${path})\n`;

                contentFull += `### ${item.id}\n\n`;
                contentFull += `${readFileContent(path)}\n`;
            }

            content += '\n';
            contentFull += '\n';
        }

        if (category.id === DocsStructureCategoryId.Components) {
            for (const item of category.items) {
                const override = ITEM_OVERRIDES[item.id];

                if (override?.skip) continue;

                content += `### ${item.id}\n\n`;
                contentFull += `### ${item.id}\n\n`;

                const overviewPath = OVERVIEW_PATHS.get(item.id);

                if (!overviewPath) {
                    console.warn(`⚠️ ${item.id} has no English overview page`);
                } else {
                    content += `- [overview](${GITHUB_RAW_CONTENT_URL}/${overviewPath})\n`;

                    contentFull += `#### overview\n\n`;
                    contentFull += `${readFileContent(overviewPath)}\n`;
                }

                if (item.hasApi) {
                    const apiPath = `tools/public_api_guard/components/${item.apiId}.api.md`;

                    if (isFileExists(apiPath)) {
                        content += `- [api](${GITHUB_RAW_CONTENT_URL}/${apiPath})\n`;
                    }

                    // Not `tools/public_api_guard` — that guards breaking changes and never carries prose
                    // descriptions. `dist/docs-content/api-manifest` is `tools/api-gen`'s doc model, the
                    // input to the same `/api` page; a release runs `docs:api-gen` before this script.
                    const manifestPath = `dist/docs-content/api-manifest/components-${item.apiId}.json`;

                    if (isFileExists(manifestPath)) {
                        contentFull += `#### api\n\n`;
                        contentFull += `${renderManifestAsMarkdown(JSON.parse(readFileContent(manifestPath)))}\n`;
                    }
                }

                const examplePath =
                    override?.examplePath ??
                    `packages/docs-examples/components/${item.apiId}/${item.id}-overview/${item.id}-overview-example.ts`;

                if (examplePath !== '' && isFileExists(examplePath)) {
                    content += `- [example](${GITHUB_RAW_CONTENT_URL}/${examplePath})\n`;

                    contentFull += `#### example\n\n`;
                    contentFull += `\`\`\`typescript\n${readFileContent(examplePath)}\n\`\`\`\n`;
                }

                content += '\n';
                contentFull += '\n';
            }
        }
    }

    writeFileSync(join(process.cwd(), 'apps/docs/src', FILE_NAME), content.trimEnd() + '\n');
    console.info(`✅ ${FILE_NAME} has been successfully generated!`);

    writeFileSync(join(process.cwd(), 'apps/docs/src', FILE_NAME_FULL), contentFull.trimEnd() + '\n');
    console.info(`✅ ${FILE_NAME_FULL} has been successfully generated!`);
} catch (error) {
    console.info(`❌ Error occurred while generating ${FILE_NAME} / ${FILE_NAME_FULL}! Details:\n`, error);
} finally {
    console.timeEnd(TIME_LABEL);
}
