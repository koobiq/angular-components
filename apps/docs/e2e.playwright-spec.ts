import { expect, Page, test } from '@playwright/test';
import { join } from 'node:path';
import { docsCompareVersions, docsParseVersion } from './src/app/components/migration-guide/migration-versions';
import { DocsLocale } from './src/app/constants/locale';
import { DOCS_SEO_DESCRIPTIONS } from './src/app/seo-descriptions';

/**
 * Functional smoke for the documentation site, run against the prerendered `docs:build` output
 * (see `playwright.docs.config.ts`). It walks the paths a reader actually takes — home → component
 * page → API/Examples tabs → locale switch → live-example source — so a regression in routing,
 * lazy chunk loading, hydration or the title strategy fails here rather than in production.
 *
 * Deliberately assertion-only: no visual snapshots, so it stays platform-independent.
 */

/** Waits for hydration to replace the prerendered markup with the live app. */
const waitForHydration = async (page: Page): Promise<void> => {
    await expect(page.locator('docs-app')).toBeVisible();
    // eslint-disable-next-line playwright/no-networkidle -- hydration announces nothing of its own; the beforeEach below keeps the network to the build's host, so idle does arrive
    await page.waitForLoadState('networkidle');
};

const openLanguageDropdown = async (page: Page): Promise<void> => {
    await page.locator('docs-sidenav .docs-footer__control').first().click();
};

/** Dropdown items deliberately carry no menu semantics, so they are matched as plain buttons. */
const dropdownItem = (page: Page, name: string) => page.locator('button[kbq-dropdown-item]', { hasText: name });

/**
 * Collects the errors the page reports from now on. Angular funnels uncaught template and subscription
 * failures, hydration mismatches included, through its `ErrorHandler`, which logs instead of rethrowing,
 * so `pageerror` alone would miss that whole class. Browser-emitted fetch failures are skipped: a blocked
 * third-party asset says nothing about the app's own error handling and would only make this flaky offline.
 */
const collectErrors = (page: Page): string[] => {
    const errors: string[] = [];

    page.on('console', (message) => {
        if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
            errors.push(message.text());
        }
    });
    page.on('pageerror', (error) => errors.push(error.message));

    return errors;
};

const VERSIONS_URL = 'https://next.koobiq.io/assets/versions.json';

// The smoke stays off Yandex.Metrika, which the app skips for a browser that sends Do Not Track: its requests
// never settle for `networkidle`, and every run would count as visits to the production counter.
//
// Nor does it reach any host but the one serving the build: a single stalled request keeps `networkidle` from
// arriving at all. The version picker gets the committed copy of the list it fetches from next.koobiq.io.
test.beforeEach(async ({ context, baseURL }) => {
    const origin = new URL(baseURL!).origin;

    await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { value: '1' }));
    await context.route(
        (url) => url.origin !== origin,
        (route) =>
            route.request().url() === VERSIONS_URL
                ? route.fulfill({ path: join(__dirname, 'src/assets/versions.json') })
                : route.abort()
    );
});

test.describe('docs app', () => {
    test('renders the welcome page with the site title', async ({ page }) => {
        await page.goto('/en');
        await waitForHydration(page);

        await expect(page).toHaveTitle('Koobiq — Angular design system');
        await expect(page.locator('.docs-welcome__header')).toContainText('Koobiq design system');
    });

    test('navigates from the sidenav to a component page', async ({ page }) => {
        await page.goto('/en');
        await waitForHydration(page);

        await page.locator('docs-sidenav a[href="/en/components/alert"]').click();

        await expect(page).toHaveURL(/\/en\/components\/alert\/overview$/);
        await expect(page.locator('.docs-component-name')).toContainText('Alert');
    });

    test('gives each page a unique title, description and canonical URL', async ({ page }) => {
        await page.goto('/en/components/alert/overview');
        await waitForHydration(page);

        await expect(page).toHaveTitle('Alert — Overview · Koobiq');
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            'content',
            DOCS_SEO_DESCRIPTIONS.alert.en
        );
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://koobiq.io/en/components/alert/overview'
        );
    });

    // `select` is used here rather than `alert` because only a component with `hasExamples` renders
    // the third tab.
    test('switches between the Overview, API and Examples tabs', async ({ page }) => {
        await page.goto('/en/components/select/overview');
        await waitForHydration(page);

        await page.getByRole('tab', { name: 'API', exact: true }).click();
        await expect(page).toHaveURL(/\/en\/components\/select\/api$/);
        await expect(page).toHaveTitle('Select — API · Koobiq');

        await page.getByRole('tab', { name: 'Examples', exact: true }).click();
        await expect(page).toHaveURL(/\/en\/components\/select\/examples$/);
        await expect(page).toHaveTitle('Select — Examples · Koobiq');
    });

    test('shows the source of a live example', async ({ page }) => {
        await page.goto('/en/components/select/examples');
        await waitForHydration(page);

        const toggle = page.locator('.docs-live-example__footer [kbqlink]').first();

        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await toggle.click();

        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(page.locator('kbq-code-block').first()).toBeVisible();
    });

    test('opens a live example in fullscreen with its overlays', async ({ page }) => {
        await page.goto('/en/components/select/examples');
        await waitForHydration(page);

        const viewer = page.locator('docs-live-example-viewer').first();
        const fullscreenButton = viewer.getByRole('button', { name: 'Enter full screen' });
        const fullscreenEnabled = await page.evaluate(() => document.fullscreenEnabled);

        // Skip rather than return: this is the feature's only integration coverage, and an early
        // return would report a green test that exercised nothing.
        test.skip(!fullscreenEnabled, 'Fullscreen API unavailable in this browser');

        await fullscreenButton.click();

        await expect
            .poll(() => page.evaluate(() => document.fullscreenElement?.matches('docs-live-example-viewer')))
            .toBe(true);

        const exampleContainerHeight = await viewer
            .locator('.docs-live-example__container')
            .evaluate((element) => element.getBoundingClientRect().height);
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        expect(exampleContainerHeight).toBeGreaterThan(viewportHeight / 2);

        const exitFullscreenButton = viewer.getByRole('button', { name: 'Exit full screen' });

        await expect(exitFullscreenButton).toBeVisible();

        await viewer.locator('kbq-select').click();
        await expect(page.locator('.cdk-overlay-pane .kbq-select__panel')).toBeVisible();
        await expect
            .poll(() =>
                page.evaluate(
                    () => document.querySelector('.cdk-overlay-container')?.parentElement === document.fullscreenElement
                )
            )
            .toBe(true);

        await page.keyboard.press('Escape');
        await viewer.getByRole('button', { name: 'Show code' }).click();

        const codeBlock = viewer.locator('kbq-code-block');

        await expect(codeBlock).toBeVisible();

        const [splitPreviewHeight, codeBlockHeight] = await Promise.all([
            viewer
                .locator('.docs-live-example__container')
                .evaluate((element) => element.getBoundingClientRect().height),
            codeBlock.evaluate((element) => element.getBoundingClientRect().height)
        ]);

        expect(splitPreviewHeight).toBeGreaterThan(viewportHeight / 3);
        expect(codeBlockHeight).toBeGreaterThan(viewportHeight / 3);

        await exitFullscreenButton.click();

        await expect.poll(() => page.evaluate(() => document.fullscreenElement)).toBeNull();
        // The action is named after what it does next, so leaving fullscreen restores "Enter full screen".
        await expect(fullscreenButton).toBeVisible();
        await expect(exitFullscreenButton).toHaveCount(0);
    });

    test('resets a live example in place', async ({ page }) => {
        await page.goto('/en/components/select/examples');
        await waitForHydration(page);

        const viewer = page.locator('docs-live-example-viewer').first();
        // Not the `.docs-live-example__example` wrapper: it is bound to `exampleData`, which a reset
        // never clears, so it stays visible (and padded, hence non-empty) even when the example
        // inside it is gone. Only the outlet content can tell a re-render from a blank-out.
        const renderedExample = viewer.locator('.docs-live-example__example > *');

        await expect(renderedExample).toBeVisible();
        // Mark the live instance. The reset destroys the outlet and builds a fresh element, so the
        // marker comes back only if the example was never re-rendered.
        await renderedExample.evaluate((element) => element.setAttribute('data-before-reset', ''));

        await viewer.getByRole('button', { name: 'Reset state' }).click();

        // Re-running the loader for the already-selected example must re-render it, not blank it out.
        await expect(renderedExample).toBeVisible();
        await expect(renderedExample).not.toHaveAttribute('data-before-reset');
    });

    test('opens a live example on its own page in a new tab', async ({ context, page }) => {
        await page.goto('/en/components/select/examples');
        await waitForHydration(page);

        const viewer = page.locator('docs-live-example-viewer').first();
        const id = await viewer.getAttribute('example');
        const [examplePage] = await Promise.all([
            context.waitForEvent('page'),
            viewer.getByRole('link', { name: 'Open in new tab' }).click()
        ]);

        await expect(examplePage).toHaveURL(new RegExp(`/examples/${id}$`));
        await expect(examplePage.locator(`docs-example-page ${id}-example`)).toBeVisible();
    });

    // The example page has neither the navbar nor the footer, so the app applies the saved theme and languages itself.
    test('shows a live example alone, in the saved theme and examples language', async ({ page }) => {
        const errors = collectErrors(page);

        await page.addInitScript(() => {
            localStorage.setItem('docs_theme', 'dark');
            // The index of ru-RU among the locales of the examples.
            localStorage.setItem('docs_examples-language', '3');

            // Catches the site navigation even if it renders for a moment only.
            new MutationObserver(() => {
                if (document.querySelector('docs-navbar, docs-sidenav')) {
                    document.documentElement.setAttribute('data-e2e-navigation-rendered', '');
                }
            }).observe(document, { childList: true, subtree: true });
        });

        await page.goto('/examples/select-overview');
        await waitForHydration(page);

        await expect(page.locator('docs-example-page select-overview-example')).toBeVisible();
        await expect(page).toHaveTitle('Select · Koobiq');
        await expect(page.locator('body')).toHaveClass(/\bkbq-dark\b/);
        await expect(page.locator('html')).toHaveAttribute('examples-lang', 'ru-RU');
        await expect(page.locator('html')).not.toHaveAttribute('data-e2e-navigation-rendered');
        expect(errors).toEqual([]);
    });

    // Pop-ups are layered against the page they are on, so these examples frame the page of another example.
    for (const component of ['dropdown', 'popover', 'select']) {
        test(`frames the layering demo into the ${component} overview`, async ({ page }) => {
            const errors = collectErrors(page);

            await page.goto(`/en/components/${component}/overview`);
            await waitForHydration(page);

            const iframe = page.locator(`iframe[title="${component}-scrolling-and-layering-example"]`);

            // The frame loads lazily, once it nears the viewport.
            await iframe.scrollIntoViewIfNeeded();

            const frame = iframe.contentFrame();
            const examplePage = frame.locator('docs-example-page');
            const demo = examplePage.locator(`${component}-scrolling-and-layering-page-example`);

            await expect(demo.locator('kbq-top-bar')).toBeVisible();
            await expect(demo.locator('[kbqOverlayLayer]')).toHaveCount(1);
            await expect(frame.locator('docs-navbar')).toHaveCount(0);

            // The demo is sized to the frame, which has no room for the padding of the other examples.
            const fitsFrame = await examplePage.evaluate(
                ({ scrollHeight, clientHeight }) => scrollHeight <= clientHeight
            );

            expect(fitsFrame).toBe(true);
            expect(errors).toEqual([]);
        });
    }

    test('slides the panels of live examples under the site header', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/dropdown/overview');
        await waitForHydration(page);

        const viewer = page.locator('docs-component-viewer');
        const pane = viewer.locator('.kbq-overlay-layer .cdk-overlay-pane');

        await viewer.locator('dropdown-overview-example button').first().click();
        await expect(pane).toHaveCount(1);

        const header = (await page.locator('docs-navbar').boundingBox())!;
        const headerBottom = header.y + header.height;
        const overlap = header.height / 2;

        // Scrolls the article until the top of the panel is half the header's height under it.
        await viewer.evaluate(
            (element, top) => element.scrollBy({ top, behavior: 'instant' }),
            Math.round((await pane.boundingBox())!.y - headerBottom + overlap)
        );
        await expect
            .poll(async () => Math.round((await pane.boundingBox())!.y))
            .toBe(Math.round(headerBottom - overlap));

        const paneBox = (await pane.boundingBox())!;
        const paintedAt = (y: number) =>
            page.evaluate(
                ({ x, y }) => {
                    const element = document.elementFromPoint(x, y);

                    return element?.closest('docs-navbar')
                        ? 'header'
                        : element?.closest('.cdk-overlay-pane')
                          ? 'pane'
                          : null;
                },
                { x: paneBox.x + paneBox.width / 2, y }
            );

        await expect.poll(() => paintedAt(headerBottom - overlap / 2)).toBe('header');
        await expect.poll(() => paintedAt(headerBottom + overlap / 2)).toBe('pane');
        expect(errors).toEqual([]);
    });

    test('switches the interface locale and rewrites the URL', async ({ page }) => {
        await page.goto('/en/components/alert/overview');
        await waitForHydration(page);

        await openLanguageDropdown(page);
        // The nested dropdown opens on hover; clicking its trigger would toggle it straight back shut.
        await dropdownItem(page, 'Interface').hover();
        await dropdownItem(page, 'Русский').click();

        // The locale segment is replaced in place — the rest of the route must survive.
        await expect(page).toHaveURL(/\/ru\/components\/alert\/overview$/);
        await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    });

    test('opens the same page in the version picked in the footer', async ({ page }) => {
        const pageUrl = 'https://koobiq.io/en/components/select/api';

        // The picker sends the latest version to koobiq.io, whichever version the committed list makes the latest.
        await page.route('https://koobiq.io/sitemap.xml', (route) =>
            route.fulfill({
                contentType: 'application/xml',
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: `<urlset><url><loc>${pageUrl}</loc></url></urlset>`
            })
        );
        await page.route(pageUrl, (route) => route.fulfill({ contentType: 'text/html', body: '<!doctype html>' }));

        await page.goto('/en/components/select/api');
        await waitForHydration(page);

        await page.locator('docs-sidenav .docs-footer__control').last().click();
        await dropdownItem(page, '(latest)').click();

        await expect(page).toHaveURL(pageUrl);
    });

    for (const [name, url] of [
        ['an unknown component id', '/en/components/definitely-not-a-component/overview'],
        ['an unknown example id', '/examples/definitely-not-an-example'],
        ['the example page without an id', '/examples']
    ]) {
        test(`redirects ${name} to the 404 page without a console error`, async ({ page }) => {
            const errors = collectErrors(page);

            await page.goto(url);
            await waitForHydration(page);

            await expect(page).toHaveURL(/\/404$/);
            expect(errors).toEqual([]);
        });
    }

    // The prerendered markup of a compiled page, examples included, has to be claimed by the app as is.
    test('hydrates a page compiled from MDX without errors', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/alert/overview');
        await waitForHydration(page);

        await expect(page.locator('docs-live-example-viewer alert-overview-example')).toBeVisible();
        expect(errors).toEqual([]);
    });

    // The API tab renders data rather than a compiled page, and its JSDoc goes into the page as `[innerHTML]`.
    test('hydrates the API tab without errors', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/select/api');
        await waitForHydration(page);

        await expect(page.locator('#KbqSelect-panelClass .kbq-markdown__p')).toBeVisible();
        expect(errors).toEqual([]);
    });

    // The code blocks of the API tab are `@defer` blocks hydrated on hover: they arrive highlighted, and the
    // browser loads highlight.js for the one a reader points at rather than for the tab as it opens.
    test('loads highlight.js for the API tab once a code block is hovered', async ({ page }) => {
        const errors = collectErrors(page);
        const scriptBodies: Promise<string>[] = [];

        page.on('response', (response) => {
            if (response.request().resourceType() === 'script') {
                scriptBodies.push(response.text().catch(() => ''));
            }
        });

        // Told apart by a message of highlight.js itself: the build names the chunk by its hash.
        const highlightJsChunks = async (): Promise<number> =>
            (await Promise.all(scriptBodies)).filter((body) =>
                body.includes('did you forget to load/include a language module')
            ).length;

        await page.goto('/en/components/select/api');
        await waitForHydration(page);
        // A block that rendered on its own after hydration would request highlight.js once the browser is idle:
        // leave it a second past that before asserting that nothing came.
        await page.evaluate(() => new Promise((resolve) => requestIdleCallback(() => setTimeout(resolve, 1000))));

        // Read once on purpose: a poll would pass on its first sample, before anything could arrive.
        const chunks = await highlightJsChunks();

        expect(chunks).toBe(0);

        const signature = page.locator('kbq-code-block').nth(1);

        await signature.hover();

        await expect(signature).toHaveClass(/kbq-code-block_show-actionbar/);
        await expect.poll(highlightJsChunks).toBeGreaterThan(0);
        expect(errors).toEqual([]);
    });

    // An API tab reached in the app reuses the page of the previous one, and a block that is still dehydrated follows
    // neither its bindings nor the view around it. `core` is the only entry point without an import that another tab
    // links to, and the largest by far: 484 entries with 847 blocks of JSDoc to sanitize at every visit, which
    // took 17–30 s on CI and 7 s on a 16-core desktop before the changes of that day (see docs/e2e-flakiness.md,
    // 2026-10-21).
    for (const [entryPoint, imports] of [
        ['tooltip', ["from '@koobiq/components/tooltip'"]],
        ['core', []]
    ] as const) {
        test(`shows the import of the ${entryPoint} API tab reached by a link on another one`, async ({ page }) => {
            test.slow(entryPoint === 'core', 'the core API tab takes seconds to create after the navigation');

            await page.goto('/en/components/select/api');
            await waitForHydration(page);

            await page.locator(`docs-api-page a[href^="/en/components/${entryPoint}/api"]`).first().click();
            await expect(page).toHaveURL(new RegExp(`/en/components/${entryPoint}/api`));

            await expect(page.locator('.docs-api__import')).toHaveText(imports.map((text) => new RegExp(text)));
        });
    }

    // After a navigation in the app the code blocks render as they come into view, each from a placeholder of its
    // height: the page is as tall before a block renders as after, so a link to a heading below lands on it. The tab
    // is reached from its overview, which lands at its top; the signature of the enum is a block of several lines,
    // laid out as a table, well below the fold there.
    test('renders the code blocks of an API tab reached in the app as they come into view', async ({ page }) => {
        await page.goto('/en/components/tooltip/overview');
        await waitForHydration(page);

        await page.locator('docs-component-viewer a[href="/en/components/tooltip/api"]').click();
        await expect(page).toHaveURL(/\/en\/components\/tooltip\/api$/);

        const entry = page.locator('.docs-api__entry', { has: page.locator('#TooltipModifier') });
        const placeholder = entry.locator(':scope > docs-api-code-placeholder');

        await expect(page.locator('kbq-code-block').first()).toBeVisible();
        await expect(placeholder.locator('table')).toBeAttached();

        const placeholderHeight = await placeholder.evaluate((element) => element.getBoundingClientRect().height);

        // Straight there: the article scrolls smoothly, and a smooth scroll would render every block it passes.
        await placeholder.evaluate((element) => element.scrollIntoView({ behavior: 'instant' }));

        const block = entry.locator(':scope > kbq-code-block');

        await expect(block.locator('code[data-highlighted-markup]')).toBeAttached();
        await expect(placeholder).toHaveCount(0);

        const blockHeight = await block.evaluate((element) => element.getBoundingClientRect().height);

        // Within a pixel: the two boxes are laid out separately, and a sub-pixel difference moves nothing on screen.
        expect(Math.abs(blockHeight - placeholderHeight)).toBeLessThanOrEqual(1);
    });

    test('scrolls to the member a link points at and highlights it', async ({ page }) => {
        await page.goto('/en/components/select/api?member=KbqSelect-panelClass');
        await waitForHydration(page);

        await expect(page.locator('#KbqSelect-panelClass')).toHaveClass(/docs-api__member_selected/);
        await expect(page.locator('#KbqSelect-panelClass')).toBeInViewport();

        await page.locator('#KbqSelect-backdropClass .docs-api__link').click();

        await expect(page).toHaveURL(/\/en\/components\/select\/api\?member=KbqSelect-backdropClass$/);
        await expect(page.locator('#KbqSelect-backdropClass')).toHaveClass(/docs-api__member_selected/);
        await expect(page.locator('#KbqSelect-panelClass')).not.toHaveClass(/docs-api__member_selected/);
    });

    // AG Grid does not support server-side rendering: the prerendered page leaves its examples to the browser.
    test('renders the examples that cannot render on the server once the page is hydrated', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/ag-grid/overview');
        await waitForHydration(page);

        // The examples load only after hydration, and AG Grid renders them on the main thread: on a busy runner
        // that alone has taken more than the default expect timeout.
        const examplesTimeout = { timeout: 15_000 };

        await expect(page.locator('docs-live-example-viewer ag-grid-angular').first()).toBeVisible(examplesTimeout);
        await expect(page.locator('docs-live-example-viewer kbq-skeleton')).toHaveCount(0, examplesTimeout);
        expect(errors).toEqual([]);
    });

    test('renders the icons page as an operable grid', async ({ page }) => {
        await page.goto('/en/main/icons');
        await waitForHydration(page);

        const cell = page.locator('.docs-icons-viewer__table-cell').first();

        await expect(cell).toHaveAttribute('role', 'button');
        await expect(cell).toHaveAttribute('tabindex', '0');
    });
});

test.describe('prerendered pages compiled from MDX', () => {
    test.use({ javaScriptEnabled: false });

    test('carry their live examples in the initial HTML without hydration', async ({ page }) => {
        const response = await page.goto('/en/components/alert/overview');

        await expect(page.locator('h3#size')).toHaveText('Size');
        await expect(page.locator('docs-live-example-viewer alert-overview-example')).toBeVisible();
        // Nothing is fetched to render the page, so no document is serialized into the transfer state.
        const html = await response?.text();

        expect(html).not.toContain('docs-content/');
    });

    test('hold the place of the examples that render only in the browser with a skeleton', async ({ page }) => {
        await page.goto('/en/components/ag-grid/overview');

        const example = page.locator(
            'docs-live-example-viewer[example="ag-grid-overview"] .docs-live-example__example'
        );

        await expect(example.locator('kbq-skeleton')).toBeVisible();
        await expect(example).toHaveAttribute('aria-busy', 'true');
        await expect(example.locator('ag-grid-angular')).toHaveCount(0);
    });
});

test.describe('prerendered API tab', () => {
    test.use({ javaScriptEnabled: false });

    test('carries the entries and their JSDoc in the initial HTML', async ({ page }) => {
        await page.goto('/en/components/select/api');

        await expect(page.locator('h3#api-components')).toHaveText('Components');
        await expect(page.locator('h4#KbqSelect')).toHaveText('KbqSelect');
        await expect(page.locator('#KbqSelect-panelClass .kbq-markdown__p')).toBeVisible();
    });
});

/**
 * The migration guide is the one page whose content is filtered after it loads, so several
 * properties have to hold together and only the prerendered build shows them at once: the document
 * ships complete, the page shows none of it until a start is picked, the filter narrows it once
 * hydrated, the range can never run backwards, and a filtered URL reproduces itself on reload.
 */
test.describe('migration guide filter', () => {
    const MIGRATION_URL = '/en/main/migration/overview';

    const visibleSteps = (page: Page) => page.locator('.docs-migration-step:not([hidden])');
    // Set in the same task that applies the picked range, after hydration and the network going idle: a count
    // taken before it sees the prerendered guide with every step.
    const waitForFilter = (page: Page) => expect(page.locator('.docs-migration-guide_ready')).toHaveCount(1);

    test('opens on the pickers and shows the steps once both versions are picked', async ({ page }) => {
        for (const query of ['', '?from=17']) {
            await page.goto(MIGRATION_URL + query);
            await waitForHydration(page);

            await expect.poll(() => page.locator('.docs-migration-step').count()).toBeGreaterThan(1);
            await expect(visibleSteps(page)).toHaveCount(0);
            await expect(page.locator('.docs-migration-guide__prompt')).toBeVisible();
        }

        // Up to the newest step rather than the latest release: a step can be filed at a release still to ship.
        const versions = await page
            .locator('.docs-migration-step')
            .evaluateAll((steps) => steps.map((step) => step.getAttribute('data-docs-migration-version') ?? ''));
        const [newest] = versions.sort((a, b) => docsCompareVersions(docsParseVersion(b), docsParseVersion(a)));

        await page.goto(`${MIGRATION_URL}?from=17&to=${newest}`);
        await waitForHydration(page);

        await expect(visibleSteps(page).first()).toBeVisible();
        await expect(visibleSteps(page)).toHaveCount(await page.locator('.docs-migration-step').count());
        // Still up, so picking a version does not shift the guide.
        await expect(page.locator('.docs-migration-guide__prompt')).toBeVisible();
    });

    test('hides the steps outside the picked range', async ({ page }) => {
        await page.goto(MIGRATION_URL + '?from=20.0.0&to=20.2.0');
        await waitForHydration(page);

        const total = await page.locator('.docs-migration-step').count();

        // Polled: the filter applies the range after the network goes idle, so a single count can still see every step.
        await expect.poll(() => visibleSteps(page).count()).toBeLessThan(total);
        await expect.poll(() => visibleSteps(page).count()).toBeGreaterThan(0);
    });

    test('narrows the component review to the picked components', async ({ page }) => {
        const subsections = page.locator('.docs-migration-component:not([hidden])');

        await page.goto(MIGRATION_URL + '?from=20.2.0&to=21.0.0');
        await waitForHydration(page);
        await waitForFilter(page);

        await expect.poll(() => subsections.count()).toBeGreaterThan(1);

        await page.goto(MIGRATION_URL + '?from=20.2.0&to=21.0.0&components=select');
        await waitForHydration(page);

        await expect(subsections).toHaveCount(1);
        await expect(subsections).toHaveAttribute('data-docs-migration-components', 'select');
    });

    // The page has no anchors, which is what jumps to a linked heading on every other page.
    test('scrolls to the step a link points at', async ({ page }) => {
        const id = 'filter-bar-state-saving-on-by-default-(21.0.0)';

        await page.goto(`${MIGRATION_URL}?from=17&to=21.0.0#${id}`);
        await waitForHydration(page);

        await expect(page.locator(`[id="${id}"]`)).toBeInViewport();
    });

    // An upgrade only moves forward, so neither picker may offer a value that would invert the
    // range — the rule the reader can actually break by clicking. Asserted at the boundary the rule
    // is about, and on both pickers: the topmost option is disabled for being unreleased anyway, so
    // a test that only looks at the last one passes whether the rule is implemented or not.
    test('never offers a range that runs backwards', async ({ page }) => {
        const option = (label: string) => page.locator('.cdk-overlay-container kbq-option').filter({ hasText: label });
        // The version pickers, apart from the component picker below them.
        const pickers = page.locator('.docs-migration-guide__range-row kbq-select');

        await page.goto(MIGRATION_URL + '?to=20.0.0');
        await waitForHydration(page);

        await pickers.first().click();

        await expect(option('20.0.0')).toHaveAttribute('aria-disabled', 'true');
        await expect(option('19.x')).not.toHaveAttribute('aria-disabled', 'true');

        await page.goto(MIGRATION_URL + '?from=20.0.0');
        await waitForHydration(page);

        await pickers.last().click();

        await expect(option('20.0.0')).toHaveAttribute('aria-disabled', 'true');
        await expect(option('20.2.0')).not.toHaveAttribute('aria-disabled', 'true');
    });

    // The canary for a hydration mismatch: the prerendered document carries no filter, and the
    // arriving client applies one.
    test('reproduces a filtered URL on reload without a console error', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto(MIGRATION_URL + '?from=20.0.0&to=20.2.0');
        await waitForHydration(page);
        await waitForFilter(page);

        const shown = await visibleSteps(page).count();

        expect(shown).toBeGreaterThan(0);
        expect(shown).toBeLessThan(await page.locator('.docs-migration-step').count());

        await page.reload();
        await waitForHydration(page);

        await expect(visibleSteps(page)).toHaveCount(shown);
        expect(errors).toEqual([]);
    });
});

test.describe('prerendered SEO metadata', () => {
    test.use({ javaScriptEnabled: false });

    test('is present in the initial HTML without hydration', async ({ page }) => {
        await page.goto('/en/components/alert/overview');

        await expect(page).toHaveTitle('Alert — Overview · Koobiq');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            'content',
            DOCS_SEO_DESCRIPTIONS.alert.en
        );
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
            'content',
            'https://koobiq.io/assets/images/welcome/alerts-light.png'
        );
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
            'href',
            'https://koobiq.io/en/components/alert/overview'
        );
        await expect(page.locator('link[rel="alternate"][hreflang="ru"]')).toHaveAttribute(
            'href',
            'https://koobiq.io/ru/components/alert/overview'
        );
        await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
            'href',
            'https://koobiq.io/ru/components/alert/overview'
        );
        await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    });

    // The migration guide filters itself in the browser, so without JavaScript a crawler — or a
    // reader whose scripts failed — has to still get every step, none of them hidden. Visible, too:
    // the stylesheet holds the document back only where scripts run.
    test('serves the whole migration guide without hydration', async ({ page }) => {
        await page.goto('/en/main/migration/overview');

        await expect.poll(() => page.locator('.docs-migration-step').count()).toBeGreaterThan(1);
        await expect(page.locator('.docs-migration-step[hidden]')).toHaveCount(0);
        await expect(page.locator('.docs-migration-step').first()).toBeVisible();
    });

    test('keeps error, technical and unknown routes out of the index before hydration', async ({ page }) => {
        await page.goto('/404');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');

        await page.goto('/examples/select-overview');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

        await page.goto('/unknown-page');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    });
});

// The Algolia crawler reads the records of the search off a page by the `data-docsearch-*` attributes its configuration
// in the Algolia dashboard selects (`src/app/components/docsearch/docsearch.ts` describes them). A page that lost them
// would not fail the crawl: it would only drop out of the search once the next release is crawled.
test.describe('search index', () => {
    const record = {
        lvl0: 'data-docsearch-lvl0',
        lvl1: 'data-docsearch-lvl1',
        lvl2: 'data-docsearch-lvl2',
        content: 'data-docsearch-content'
    };
    const byAttribute = (page: Page, name: string) => page.locator(`[${name}]`);

    // The crawler of koobiq.io renders JavaScript, while another one reads the prerendered HTML alone.
    for (const javaScriptEnabled of [true, false]) {
        test.describe(`with JavaScript ${javaScriptEnabled ? 'enabled' : 'disabled'}`, () => {
            test.use({ javaScriptEnabled });

            const open = async (page: Page, url: string): Promise<void> => {
                await page.goto(url);

                if (javaScriptEnabled) await waitForHydration(page);
            };

            for (const [locale, group] of [
                [DocsLocale.En, 'Components'],
                [DocsLocale.Ru, 'Компоненты']
            ]) {
                test(`reads an overview page in its language (${locale})`, async ({ page }) => {
                    await open(page, `/${locale}/components/alert/overview`);

                    // The `lang` facet the search filters by.
                    await expect(page.locator('html')).toHaveAttribute('lang', locale);
                    await expect(byAttribute(page, record.lvl0)).toHaveAttribute(record.lvl0, group);
                    await expect(byAttribute(page, record.lvl1)).toHaveText('Alert');
                    await expect(byAttribute(page, record.lvl2).first()).not.toBeEmpty();
                    await expect(byAttribute(page, record.content).first()).not.toBeEmpty();
                });
            }

            test('reads an API tab as a group of its own', async ({ page }) => {
                await open(page, '/en/components/select/api');

                await expect(byAttribute(page, record.lvl0)).toHaveAttribute(record.lvl0, 'API');
                await expect(byAttribute(page, record.lvl1)).toHaveText('Select');
                await expect(byAttribute(page, record.lvl2).first()).not.toBeEmpty();
                await expect(byAttribute(page, record.content).first()).not.toBeEmpty();
            });

            test('reads the icons page', async ({ page }) => {
                await open(page, '/en/main/icons');

                await expect(byAttribute(page, record.lvl0)).toHaveAttribute(record.lvl0, 'Icons');
                await expect(byAttribute(page, record.lvl1)).toHaveText('Icons');
            });
        });
    }
});

// `tools/llms` writes an index for agents and the Markdown of every item next to its pages; a copy of the site that
// served the app shell in their place, or lost a file, would leave an agent reading HTML or nothing at all.
test.describe('documentation for agents', () => {
    test('serves the index and the Markdown of every item it links', async ({ request }) => {
        const index = await request.get('/llms.txt');

        expect(index.status()).toBe(200);
        expect(index.headers()['content-type']).toContain('text/plain');

        const paths = Array.from(
            (await index.text()).matchAll(/\]\(https:\/\/koobiq\.io(\/[^)]+\.md)\)/g),
            ([, path]) => path
        );

        expect(paths.length).toBeGreaterThan(80);

        for (const path of paths) {
            const response = await request.get(path);

            expect(response.status(), path).toBe(200);
            expect(response.headers()['content-type'], path).toContain('text/markdown');
        }
    });

    test('serves every item in one file as well', async ({ request }) => {
        const full = await request.get('/llms-full.txt');

        expect(full.status()).toBe(200);
        const text = await full.text();

        expect(text).toContain('\n## Button\n');
    });

    test('answers a Markdown file it does not have with a 404 rather than the app', async ({ request }) => {
        const response = await request.get('/en/components/missing.md');

        expect(response.status()).toBe(404);
    });

    test('points every page of an item at the English Markdown at its own address, on the host that serves it', async ({
        page
    }) => {
        await page.goto('/ru/components/alert/api');
        await waitForHydration(page);

        await expect(page.locator('link[rel="alternate"][type="text/markdown"]')).toHaveAttribute(
            'href',
            '/ru/components/alert.md'
        );
        await expect(page.locator('link[rel="describedby"]')).toHaveAttribute('href', '/llms.txt');

        const markdown = await page.request.get('/ru/components/alert.md');

        expect(markdown.status()).toBe(200);
        const english = await page.request.get('/en/components/alert.md');
        const [text, englishText] = await Promise.all([markdown.text(), english.text()]);

        expect(text).toBe(englishText);
    });
});
