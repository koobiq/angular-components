import { expect, Page, test } from '@playwright/test';
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

// The smoke stays off Yandex.Metrika, which the app skips for a browser that sends Do Not Track: its requests
// never settle for `networkidle`, and every run would count as visits to the production counter.
test.beforeEach(async ({ context }) => {
    await context.addInitScript(() => Object.defineProperty(navigator, 'doNotTrack', { value: '1' }));
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

        const toggle = page.locator('.docs-live-example__footer [kbq-link]').first();

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

    // The page has neither the navbar nor the footer, which used to apply the saved theme and languages.
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
        await expect(page.locator('body')).toHaveClass(/\bkbq-dark\b/);
        await expect(page.locator('html')).toHaveAttribute('examples-lang', 'ru-RU');
        await expect(page.locator('html')).not.toHaveAttribute('data-e2e-navigation-rendered');
        expect(errors).toEqual([]);
    });

    test('redirects an unknown example id to the 404 page without a console error', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/examples/definitely-not-an-example');
        await waitForHydration(page);

        await expect(page).toHaveURL(/\/404$/);
        expect(errors).toEqual([]);
    });

    // Pop-ups are layered against the page they are on, so these examples frame the page of another example.
    for (const component of ['popover', 'select']) {
        test(`frames the layering demo into the ${component} overview`, async ({ page }) => {
            const errors = collectErrors(page);

            await page.goto(`/en/components/${component}/overview`);
            await waitForHydration(page);

            const frame = page.frameLocator(`iframe[title="${component}-scrolling-and-layering-example"]`);
            const examplePage = frame.locator('docs-example-page');
            const demo = examplePage.locator(`${component}-scrolling-and-layering-page-example`);

            await expect(demo.locator('kbq-top-bar')).toBeVisible();
            await expect(frame.locator('docs-navbar')).toHaveCount(0);

            // The demo is sized to the frame, which has no room for the padding of the other examples.
            const fitsFrame = await examplePage.evaluate(
                ({ scrollHeight, clientHeight }) => scrollHeight <= clientHeight
            );

            expect(fitsFrame).toBe(true);
            expect(errors).toEqual([]);
        });
    }

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

    test('redirects an unknown component id to the 404 page without a console error', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/definitely-not-a-component/overview');
        await waitForHydration(page);

        await expect(page).toHaveURL(/\/404$/);
        expect(errors).toEqual([]);
    });

    // The prerendered markup of a compiled page, examples included, has to be claimed by the app as is.
    test('hydrates a page compiled from MDX without errors', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/alert/overview');
        await waitForHydration(page);

        await expect(page.locator('docs-live-example-viewer alert-overview-example')).toBeVisible();
        expect(errors).toEqual([]);
    });

    // AG Grid does not support server-side rendering: the prerendered page leaves its examples to the browser.
    test('renders the examples that cannot render on the server once the page is hydrated', async ({ page }) => {
        const errors = collectErrors(page);

        await page.goto('/en/components/ag-grid/overview');
        await waitForHydration(page);

        await expect(page.locator('docs-live-example-viewer ag-grid-angular').first()).toBeVisible();
        await expect(page.locator('docs-live-example-viewer kbq-skeleton')).toHaveCount(0);
        expect(errors).toEqual([]);
    });

    test('renders the icons page as an operable grid', async ({ page }) => {
        await page.goto('/en/icons');
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
        expect(await response?.text()).not.toContain('docs-content/');
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

    test('keeps error, technical and unknown routes out of the index before hydration', async ({ page }) => {
        await page.goto('/404');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');

        await page.goto('/examples/select-overview');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

        await page.goto('/examples/popover-scrolling-and-layering-page');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

        await page.goto('/unknown-page');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    });
});
