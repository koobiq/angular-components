/**
 * Checks the documentation for agents without writing it: the committed `llms.txt` is what the generator writes now,
 * every item of the documentation has its Markdown, and every file the site serves is plain Markdown an agent can read
 * without the site (see `findMarkdownProblems`). Needs the manifest `yarn run docs:api-gen` writes.
 */
import { readFileSync } from 'fs';
import { docsGetItems } from '../../apps/docs/src/app/structure';
import { generateLlms, LLMS_TXT_PATH } from './generate';
import { LLMS_FULL_TXT, LLMS_TXT } from './llms-txt';
import { findMarkdownProblems } from './markdown-problems';
import { getMarkdownPath } from './sources';

/** The llms.txt of a site passes under 50,000 characters in the Agent-Friendly Docs Spec: agents read it whole. */
const MAX_INDEX_LENGTH = 50_000;

/** Claude Code's WebFetch cuts a page at 100,000 characters: a larger one is read in part. */
const LARGE_FILE_LENGTH = 100_000;

const checkLlms = async (): Promise<void> => {
    const { files, llmsTxt } = await generateLlms();
    const served = new Set(files.keys());
    const errors: string[] = [];
    // Worth knowing, not worth failing for.
    const largeFiles: string[] = [];

    // A checkout with Windows line endings holds the same index.
    if (readFileSync(LLMS_TXT_PATH, 'utf-8').replace(/\r\n/g, '\n') !== llmsTxt) {
        errors.push(`${LLMS_TXT_PATH} is out of date: run "yarn run docs:generate-llms" and commit it`);
    }

    if (llmsTxt.length > MAX_INDEX_LENGTH) {
        errors.push(
            `${LLMS_TXT_PATH}: ${llmsTxt.length} characters, over the ${MAX_INDEX_LENGTH} an agent reads whole`
        );
    }

    for (const item of docsGetItems()) {
        if (!files.has(getMarkdownPath(item))) errors.push(`${item.categoryId}/${item.id}: no Markdown`);
    }

    for (const [path, text] of [[LLMS_TXT, llmsTxt], ...files]) {
        errors.push(...findMarkdownProblems(text, served).map((problem) => `${path}: ${problem}`));

        if (path !== LLMS_TXT && path !== LLMS_FULL_TXT && text.length > LARGE_FILE_LENGTH) largeFiles.push(path);
    }

    const sizes = [...files].map(([path, text]) => ({ path, size: Buffer.byteLength(text) }));
    const total = sizes.reduce((sum, { size }) => sum + size, 0);
    const largest = sizes
        .filter(({ path }) => path !== LLMS_FULL_TXT)
        .sort((a, b) => b.size - a.size)
        .slice(0, 5)
        .map(({ path, size }) => `${path} ${Math.round(size / 1024)} KB`);

    console.info(`${files.size} files, ${Math.round(total / 1024)} KB; largest: ${largest.join(', ')}`);

    if (largeFiles.length) {
        console.warn(
            `⚠️ ${largeFiles.length} files are longer than the ${LARGE_FILE_LENGTH} characters WebFetch reads: ${largeFiles.join(', ')}`
        );
    }

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
