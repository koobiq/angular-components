import { readFile, writeFile } from 'fs/promises';
import { globSync } from 'glob';
import { basename, join } from 'path';
import { extractSeoDescription } from './seo-description';
import { DOCS_PAGE_OVERVIEW_SOURCES } from './sources';

const GENERATED_FILE = 'apps/docs/src/app/seo-descriptions.ts';
const LOCALIZED_PAGE_FILE = /^(?<id>.+)\.(?<locale>en|ru)\.mdx$/;

export type DocsSeoDescriptions = Record<string, Partial<Record<'en' | 'ru', string>>>;

const getSourceFiles = (sourcePatterns: string | string[]): string[] => {
    const patterns = Array.isArray(sourcePatterns) ? sourcePatterns : [sourcePatterns];

    return patterns.flatMap((pattern) => globSync(pattern, { windowsPathsNoEscape: true, posix: true })).sort();
};

export const collectSeoDescriptions = async (sourcePatterns: string | string[]): Promise<DocsSeoDescriptions> => {
    const descriptions: DocsSeoDescriptions = {};

    for (const inputPath of getSourceFiles(sourcePatterns)) {
        const match = basename(inputPath).match(LOCALIZED_PAGE_FILE);

        if (!match?.groups) continue;

        const { id, locale } = match.groups as { id: string; locale: 'en' | 'ru' };
        const description = extractSeoDescription(await readFile(inputPath, 'utf8'), inputPath);

        if (!description) {
            throw new Error(`Missing introductory paragraph before the first section heading: ${inputPath}`);
        }

        descriptions[id] ??= {};

        if (descriptions[id][locale]) {
            throw new Error(`Duplicate SEO description for ${id}.${locale}: ${inputPath}`);
        }

        descriptions[id][locale] = description;
    }

    return Object.fromEntries(
        Object.entries(descriptions)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([id, localized]) => [id, Object.fromEntries(Object.entries(localized).sort())])
    );
};

/** Generates the static description registry consumed synchronously during routing and SSG. */
export const generateSeoDescriptions = async (sourcePatterns: string | string[]): Promise<void> => {
    const descriptions = await collectSeoDescriptions(sourcePatterns);
    const output = [
        '/**',
        ' * NOTE! Do not edit manually. Generated from the first paragraph of localized overview Markdown.',
        ' * Run `yarn run build:docs-content` to update.',
        ' */',
        `export const DOCS_SEO_DESCRIPTIONS = ${JSON.stringify(descriptions, null, 4)} as const;`,
        ''
    ].join('\n');

    await writeFile(join(process.cwd(), GENERATED_FILE), output);
};

if (require.main === module) {
    generateSeoDescriptions(DOCS_PAGE_OVERVIEW_SOURCES).catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });
}
