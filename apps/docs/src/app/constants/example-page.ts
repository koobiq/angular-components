/** First URL segment of the page that shows a single live example. */
export const DOCS_EXAMPLE_PAGE_PATH = 'examples';

/** URL of the page that shows the live example with the given id on its own. */
export const docsExamplePageUrl = (id: string): string => `/${DOCS_EXAMPLE_PAGE_PATH}/${id}`;

/** Whether the URL opens the page of a single live example, which has no site navigation. */
export const docsIsExamplePageUrl = (url: string): boolean => {
    const [section, id] = url.split(/[?#]/)[0].split('/').filter(Boolean);

    return section === DOCS_EXAMPLE_PAGE_PATH && !!id;
};
