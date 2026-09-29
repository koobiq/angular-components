/**
 * Generates the documentation for agents, in English: the Markdown of every structure item and `llms-full.txt` into
 * `dist/docs-llms`, which the documentation site serves from its root, and the committed index `llms.txt`.
 * Needs the manifest `yarn run docs:api-gen` writes.
 */
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { format, resolveConfig } from 'prettier';
import { docsGetCategories, DocsStructureItem } from '../../apps/docs/src/app/structure';
import { renderItemMarkdown } from './item-markdown';
import { LLMS_FULL_TXT, LlmsCategory, LlmsHeader, renderLlmsFullTxt, renderLlmsTxt } from './llms-txt';
import { collectPageSources, getIconsVersion, getMarkdownPath, readRepoFile } from './sources';

/** Committed, so that a change to the index shows in review; `check-llms` fails when it is out of date. */
export const LLMS_TXT_PATH = 'apps/docs/src/llms.txt';

export const LLMS_OUTPUT_DIR = join('dist', 'docs-llms');

const RULES_PATH = 'docs/llms/rules.md';

const TIME_LABEL = 'llms';

export interface LlmsOutput {
    /** Files the site serves, by their path under its root: the Markdown of every item and `llms-full.txt`. */
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

    for (const category of docsGetCategories()) {
        const items: DocsStructureItem[] = [];

        for (const item of category.items) {
            const markdown = renderItemMarkdown(item, sources, { depth: 1 });

            if (markdown) files.set(getMarkdownPath(item), `${markdown}\n`);

            const fullItem = renderItemMarkdown(item, sources, { depth: 2, apiListedBy });

            if (fullItem) {
                items.push(item);
                fullItems.push(fullItem);
            }
        }

        categories.push({ category, items });
    }

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
