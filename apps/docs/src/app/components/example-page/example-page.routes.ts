import { Routes, UrlMatcher } from '@angular/router';
import { EXAMPLE_COMPONENTS } from '@koobiq/docs-examples';
import { DocsExamplePage } from './example-page';

/**
 * Matches the id of a known example together with any segments after it, so the relative links inside an example,
 * such as its breadcrumbs, keep it on its page.
 */
const matchExample: UrlMatcher = (segments) => {
    const [id] = segments;

    return id && Object.hasOwn(EXAMPLE_COMPONENTS, id.path) ? { consumed: segments, posParams: { id } } : null;
};

export const DOCS_EXAMPLE_PAGE_ROUTES: Routes = [
    { matcher: matchExample, component: DocsExamplePage },
    // An unknown id, or none at all: without a match here the router would activate an empty page for the latter.
    { path: '**', redirectTo: '/404' }
];
