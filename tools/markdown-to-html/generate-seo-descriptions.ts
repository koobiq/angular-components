import { readFile, writeFile } from 'fs/promises';
import { basename, join } from 'path';
import { extractSeoDescription } from './seo-description';
import { src } from './utils';

const GENERATED_FILE = 'apps/docs/src/app/seo-descriptions.ts';
const LOCALIZED_MARKDOWN_FILE = /^(?<id>.+)\.(?<locale>en|ru)\.md$/;

type DocsSeoDescriptions = Record<string, Partial<Record<'en' | 'ru', string>>>;

/** Generates the static description registry consumed synchronously during routing and SSG. */
export const generateSeoDescriptions = async (sourcePatterns: string | string[]): Promise<void> => {
    const descriptions: DocsSeoDescriptions = {};

    for (const inputPath of src(sourcePatterns)) {
        const match = basename(inputPath).match(LOCALIZED_MARKDOWN_FILE);

        if (!match?.groups) continue;

        const { id, locale } = match.groups as { id: string; locale: 'en' | 'ru' };
        const description = extractSeoDescription(await readFile(inputPath, 'utf8'));

        if (!description) continue;

        descriptions[id] ??= {};

        if (descriptions[id][locale]) {
            throw new Error(`Duplicate SEO description for ${id}.${locale}: ${inputPath}`);
        }

        descriptions[id][locale] = description;
    }

    const sortedDescriptions = Object.fromEntries(
        Object.entries(descriptions)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([id, localized]) => [id, Object.fromEntries(Object.entries(localized).sort())])
    );
    const output = [
        '/**',
        ' * NOTE! Do not edit manually. Generated from the first paragraph of localized overview Markdown.',
        ' * Run `yarn run build:docs-content` to update.',
        ' */',
        `export const DOCS_SEO_DESCRIPTIONS = ${JSON.stringify(sortedDescriptions, null, 4)} as const;`,
        ''
    ].join('\n');

    await writeFile(join(process.cwd(), GENERATED_FILE), output);
};
