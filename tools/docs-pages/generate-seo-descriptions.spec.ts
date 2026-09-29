import { DOCS_SEO_DESCRIPTIONS } from '../../apps/docs/src/app/seo-descriptions';
import { collectSeoDescriptions, DocsSeoDescriptions } from './generate-seo-descriptions';
import { DOCS_PAGE_OVERVIEW_SOURCES } from './sources';

jest.setTimeout(10_000);

const locales = ['en', 'ru'] as const;

type SeoDescriptionDrift = {
    page: string;
    locale: (typeof locales)[number];
    fromSource: string | undefined;
    committed: string | undefined;
};

/**
 * One `toEqual` over the whole registry prints all ~100 pages on any drift, which buries the single
 * entry that moved. Comparing per page and locale leaves only the drifted ones in the failure.
 */
const collectDrift = (fromSources: DocsSeoDescriptions, committed: DocsSeoDescriptions): SeoDescriptionDrift[] =>
    [...new Set([...Object.keys(fromSources), ...Object.keys(committed)])].sort().flatMap((page) =>
        locales
            .filter((locale) => fromSources[page]?.[locale] !== committed[page]?.[locale])
            .map((locale) => ({
                page,
                locale,
                fromSource: fromSources[page]?.[locale],
                committed: committed[page]?.[locale]
            }))
    );

describe('generated SEO descriptions', () => {
    it('stays synchronized with the overview pages; run build:docs-content to update', async () => {
        const fromSources = await collectSeoDescriptions(DOCS_PAGE_OVERVIEW_SOURCES);

        expect(collectDrift(fromSources, DOCS_SEO_DESCRIPTIONS)).toEqual([]);
    });
});
