import { docsExamplePageUrl, docsIsExamplePageUrl } from './example-page';

describe(docsIsExamplePageUrl.name, () => {
    it.each([
        [docsExamplePageUrl('select-overview'), true],
        ['/examples/breadcrumbs-overview/main/sections?tab=1#details', true],
        ['/examples', false],
        ['/examples?id=select-overview', false],
        ['/examples-archive/select-overview', false],
        ['/en/components/select/examples', false],
        ['/404', false]
    ])('%s: %s', (url, isExamplePage) => {
        expect(docsIsExamplePageUrl(url)).toBe(isExamplePage);
    });
});
