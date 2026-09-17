import { docsExamplePageUrl, docsIsExamplePageUrl } from './example-page';

describe(docsIsExamplePageUrl.name, () => {
    it.each([
        [docsExamplePageUrl('select-overview'), true],
        ['/examples/breadcrumbs-overview/main/sections?tab=1#details', true],
        // The router strips matrix parameters and decodes segments before it matches them.
        ['/examples;v=1/select-overview', true],
        ['/%65xamples/select-overview', true],
        ['/examples', false],
        ['/examples/', false],
        ['/examples?id=select-overview', false],
        ['/examples-archive/select-overview', false],
        ['/en/components/select/examples', false],
        ['/404', false],
        ['/examples/(', false]
    ])('%s: %s', (url, isExamplePage) => {
        expect(docsIsExamplePageUrl(url)).toBe(isExamplePage);
    });
});
