import { ResolveFn, Routes, UrlMatcher } from '@angular/router';
import { EXAMPLE_COMPONENTS } from '@koobiq/docs-examples';
import { DocsExamplePage } from './example-page';

/**
 * Matches the id of a known example together with any segments after it, so the relative links inside an example,
 * such as its breadcrumbs, keep it on its page.
 */
const matchExample: UrlMatcher = (segments) =>
    segments.length > 0 && Object.hasOwn(EXAMPLE_COMPONENTS, segments[0].path) ? { consumed: segments } : null;

const resolveExampleTitle: ResolveFn<string> = ({ url: [{ path }] }) => EXAMPLE_COMPONENTS[path].title;

export const DOCS_EXAMPLE_PAGE_ROUTES: Routes = [
    { matcher: matchExample, component: DocsExamplePage, title: resolveExampleTitle }
];
