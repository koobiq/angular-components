import { readFile, writeFile } from 'fs/promises';
import { globSync } from 'glob';
import { basename, join } from 'path';
import { extractSeoDescription } from './seo-description';

const GENERATED_FILE = 'apps/docs/src/app/seo-descriptions.ts';
const LOCALIZED_MARKDOWN_FILE = /^(?<id>.+)\.(?<locale>en|ru)\.md$/;

export const DOCS_OVERVIEW_SOURCES = [
    'packages/components/**/!(README|examples*).md',
    'packages/components-experimental/**/!(README|examples*).md',
    'docs/guides/**/*.md',
    'docs/data-grid/**/*.md'
];

export type DocsSeoDescriptions = Record<string, Partial<Record<'en' | 'ru', string>>>;

const getSourceFiles = (sourcePatterns: string | string[]): string[] => {
    const patterns = Array.isArray(sourcePatterns) ? sourcePatterns : [sourcePatterns];

    return patterns.flatMap((pattern) => globSync(pattern, { windowsPathsNoEscape: true, posix: true })).sort();
};

export const collectSeoDescriptions = async (sourcePatterns: string | string[]): Promise<DocsSeoDescriptions> => {
    const descriptions: DocsSeoDescriptions = {};

    for (const inputPath of getSourceFiles(sourcePatterns)) {
        const match = basename(inputPath).match(LOCALIZED_MARKDOWN_FILE);

        if (!match?.groups) continue;

        const { id, locale } = match.groups as { id: string; locale: 'en' | 'ru' };
        const description = extractSeoDescription(await readFile(inputPath, 'utf8'));

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
