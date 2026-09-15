import { DOCS_SEO_DESCRIPTIONS } from '../../apps/docs/src/app/seo-descriptions';
import { collectSeoDescriptions } from './generate-seo-descriptions';
import { DOCS_PAGE_OVERVIEW_SOURCES } from './sources';

jest.setTimeout(10_000);

describe('generated SEO descriptions', () => {
    it('stays synchronized with the overview pages; run build:docs-content to update', async () => {
        await expect(collectSeoDescriptions(DOCS_PAGE_OVERVIEW_SOURCES)).resolves.toEqual(DOCS_SEO_DESCRIPTIONS);
    });
});
