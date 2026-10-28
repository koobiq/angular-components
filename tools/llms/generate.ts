/**
 * Generates the documentation for agents, in English, into `dist/docs-llms`, which the documentation site serves from
 * its root: the Markdown of every structure item under every locale, the files it links — every example, the API of
 * every entry point, the variables of every component, the sections of a page too long for one file — the component
 * guide, `llms-full.txt`, and the committed index `llms.txt`. Every link leads to the site of `KOOBIQ_DOCS_ORIGIN`.
 * Needs the manifest `yarn run docs:api-gen` writes.
 */
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { format, resolveConfig } from 'prettier';
import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import { docsGetCategories, docsGetItems, DocsStructureItem } from '../../apps/docs/src/app/structure';
import { COMPONENT_GUIDE_PATH, parseComponentGuide, renderComponentGuide } from './component-guide';
import { renderItemMarkdown } from './item-markdown';
import { renderItemPage, SiteFilesContext } from './item-page';
import { LLMS_FULL_TXT, LlmsCategory, LlmsHeader, renderLlmsFullTxt, renderLlmsTxt } from './llms-txt';
import {
    collectPageSources,
    getIconsVersion,
    getMarkdownPath,
    getMarkdownUrl,
    getSiteUrl,
    readRepoFile
} from './sources';

/** Committed, so that a change to the index shows in review; `check-llms` fails when it is out of date. */
export const LLMS_TXT_PATH = 'apps/docs/src/llms.txt';

export const LLMS_OUTPUT_DIR = join('dist', 'docs-llms');

const RULES_PATH = 'docs/llms/rules.md';

const TIME_LABEL = 'llms';

export interface LlmsOutput {
    /** Files the site serves, by their path under its root: every Markdown file besides `llms.txt`. */
    files: Map<string, string>;
    /** The index, formatted the way the repository formats it. */
    llmsTxt: string;
}

const formatLikeRepository = async (path: string, text: string): Promise<string> =>
    format(text, { ...(await resolveConfig(path)), filepath: path });

export const generateLlms = async (): Promise<LlmsOutput> => {
    const { version, requiredAngularVersion } = JSON.parse(readRepoFile('package.json'));
    const header: LlmsHeader = {
        version,
        angularVersion: requiredAngularVersion,
        iconsVersion: getIconsVersion(),
        rules: readRepoFile(RULES_PATH).trim()
    };
    const sources = collectPageSources();
    const files = new Map<string, string>();
    const categories: LlmsCategory[] = [];
    const fullItems: string[] = [];
    const apiListedBy = new Map<string, DocsStructureItem>();
    const context: SiteFilesContext = { sources, files: new Map(), exampleItems: new Map() };

    for (const category of docsGetCategories()) {
        const categoryItems: DocsStructureItem[] = [];

        for (const item of category.items) {
            const markdown = renderItemPage(item, context);

            // The same English text next to the pages of every locale: each links the Markdown at its own address.
            for (const locale of Object.values(DocsLocale)) {
                if (markdown) files.set(getMarkdownPath(item, locale), `${markdown}\n`);
            }

            // llms.txt lists the items whose Markdown the site serves.
            if (markdown) categoryItems.push(item);

            const fullItem = renderItemMarkdown(item, sources, apiListedBy);

            if (fullItem) fullItems.push(fullItem);
        }

        categories.push({ category, items: categoryItems });
    }

    const itemUrls = new Map<string, string>(docsGetItems().map((item) => [item.id, getMarkdownUrl(item)]));
    const guide = renderComponentGuide(
        parseComponentGuide(readRepoFile(COMPONENT_GUIDE_PATH)),
        (id) => itemUrls.get(id),
        getSiteUrl
    );

    for (const [path, text] of [...context.files, ...guide]) files.set(path, `${text}\n`);

    files.set(LLMS_FULL_TXT, renderLlmsFullTxt(fullItems, header));

    return { files, llmsTxt: await formatLikeRepository(LLMS_TXT_PATH, renderLlmsTxt(categories, sources, header)) };
};

const writeLlms = async (): Promise<void> => {
    const { files, llmsTxt } = await generateLlms();

    rmSync(LLMS_OUTPUT_DIR, { recursive: true, force: true });

    for (const [path, content] of files) {
        mkdirSync(dirname(join(LLMS_OUTPUT_DIR, path)), { recursive: true });
        writeFileSync(join(LLMS_OUTPUT_DIR, path), content);
    }

    writeFileSync(LLMS_TXT_PATH, llmsTxt);

    const size = [...files.values()].reduce((total, content) => total + Buffer.byteLength(content), 0);

    console.info(`✅ ${LLMS_TXT_PATH}, and ${files.size} files of ${Math.round(size / 1024)} KB in ${LLMS_OUTPUT_DIR}`);
};

if (require.main === module) {
    console.time(TIME_LABEL);

    writeLlms()
        .catch((error) => {
            console.error(`❌ ${error instanceof Error ? error.message : error}`);
            process.exitCode = 1;
        })
        .finally(() => console.timeEnd(TIME_LABEL));
}
