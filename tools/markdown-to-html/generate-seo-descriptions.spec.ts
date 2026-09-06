import { DOCS_SEO_DESCRIPTIONS } from '../../apps/docs/src/app/seo-descriptions';
import { collectSeoDescriptions, DOCS_OVERVIEW_SOURCES } from './generate-seo-descriptions';

jest.setTimeout(10_000);

describe('generated SEO descriptions', () => {
    it('stays synchronized with overview Markdown; run build:docs-content to update', async () => {
        await expect(collectSeoDescriptions(DOCS_OVERVIEW_SOURCES)).resolves.toEqual(DOCS_SEO_DESCRIPTIONS);
    });
});
