/**
 * Checks the documentation for agents without writing it: the committed `llms.txt` is what the generator writes now,
 * every item of the documentation has its Markdown under every locale, every file the site serves is plain Markdown an
 * agent can read without the site (see `findMarkdownProblems`) and short enough to read whole, and the component guide
 * has a line for every component. Needs the manifest `yarn run docs:api-gen` writes.
 */
import { readFileSync } from 'fs';
import { DocsLocale } from '../../apps/docs/src/app/constants/locale';
import { docsHasMarkdown } from '../../apps/docs/src/app/page-paths';
import { docsGetItems, docsGetItemsByCategoryId, DocsStructureCategoryId } from '../../apps/docs/src/app/structure';
import {
    COMPONENT_GUIDE_PATH,
    COMPONENT_GUIDE_RU_PATH,
    findGuideProblems,
    parseComponentGuide
} from './component-guide';
import { generateLlms, LLMS_TXT_PATH } from './generate';
import { LLMS_FULL_TXT, LLMS_TXT } from './llms-txt';
import { findMarkdownProblems } from './markdown-problems';
import { MAX_FILE_LENGTH } from './site-files';
import { getMarkdownPath, KOOBIQ_SITE_ORIGIN, LLMS_SITE_ORIGIN, readRepoFile } from './sources';

/** The llms.txt of a site passes under 50,000 characters in the Agent-Friendly Docs Spec: agents read it whole. */
const MAX_INDEX_LENGTH = 50_000;

const checkLlms = async (): Promise<void> => {
    // The committed llms.txt links koobiq.io: built for another site, it would differ on every link.
    if (LLMS_SITE_ORIGIN !== KOOBIQ_SITE_ORIGIN) {
        throw new Error(`the committed ${LLMS_TXT} links ${KOOBIQ_SITE_ORIGIN}: run without KOOBIQ_DOCS_ORIGIN`);
    }

    const { files, llmsTxt } = await generateLlms();
    const served = new Set(files.keys());
    const errors: string[] = [];

    // The MCP server reads both languages of the guide and expects the same components in each.
    for (const path of [COMPONENT_GUIDE_PATH, COMPONENT_GUIDE_RU_PATH]) {
        errors.push(
            ...findGuideProblems(
                parseComponentGuide(readRepoFile(path), path),
                docsGetItemsByCategoryId(DocsStructureCategoryId.Components),
                new Set(docsGetItems().map(({ id }) => id))
            ).map((problem) => `${path}: ${problem}`)
        );
    }

    // A checkout with Windows line endings holds the same index.
    if (readFileSync(LLMS_TXT_PATH, 'utf-8').replace(/\r\n/g, '\n') !== llmsTxt) {
        errors.push(`${LLMS_TXT_PATH} is out of date: run "yarn run docs:generate-llms" and commit it`);
    }

    if (llmsTxt.length > MAX_INDEX_LENGTH) {
        errors.push(
            `${LLMS_TXT_PATH}: ${llmsTxt.length} characters, over the ${MAX_INDEX_LENGTH} an agent reads whole`
        );
    }

    // Every locale holds the English Markdown: its copies are checked for being the same, the English one for the rest.
    const copies = new Set<string>();

    for (const item of docsGetItems()) {
        if (!docsHasMarkdown(item)) continue;

        const english = files.get(getMarkdownPath(item, DocsLocale.En));

        for (const locale of Object.values(DocsLocale)) {
            const path = getMarkdownPath(item, locale);

            if (!files.has(path)) {
                errors.push(`${item.categoryId}/${item.id}: no Markdown in "${locale}"`);
            } else if (locale !== DocsLocale.En) {
                copies.add(path);

                if (files.get(path) !== english) errors.push(`${path}: differs from the English Markdown`);
            }
        }
    }

    for (const [path, text] of [[LLMS_TXT, llmsTxt], ...files].filter(([path]) => !copies.has(path))) {
        errors.push(...findMarkdownProblems(text, served).map((problem) => `${path}: ${problem}`));

        // llms-full.txt is for the tools that index it, not for reading; the newline a file ends with does not count.
        const length = text.trimEnd().length;

        if (path !== LLMS_TXT && path !== LLMS_FULL_TXT && length > MAX_FILE_LENGTH) {
            errors.push(`${path}: ${length} characters, over the ${MAX_FILE_LENGTH} an agent reads at once`);
        }
    }

    const sizes = [...files].map(([path, text]) => ({ path, size: Buffer.byteLength(text) }));
    const total = sizes.reduce((sum, { size }) => sum + size, 0);
    const largest = sizes
        .filter(({ path }) => path !== LLMS_FULL_TXT && !copies.has(path))
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .map(({ path, size }) => `${path} ${Math.round(size / 1024)} KB`);

    console.info(`${files.size} files, ${Math.round(total / 1024)} KB; largest: ${largest.join(', ')}`);

    if (errors.length) {
        for (const error of errors) console.error(`❌ ${error}`);

        process.exitCode = 1;
    } else {
        console.info('✅ The documentation for agents is complete and readable');
    }
};

checkLlms().catch((error) => {
    console.error(`❌ ${error instanceof Error ? error.message : error}`);
    process.exitCode = 1;
});
