import { expect, Page, test } from '@playwright/test';

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
            'Shows important information on a page. Can contain a hint, signal a status change, or indicate a problem.'
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
        const errors: string[] = [];

        // Angular funnels uncaught template and subscription failures through its `ErrorHandler`,
        // which logs instead of rethrowing, so `pageerror` alone would miss that whole class.
        // Browser-emitted fetch failures are skipped: a blocked third-party asset says nothing
        // about the app's own error handling and would only make this flaky offline.
        page.on('console', (message) => {
            if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
                errors.push(message.text());
            }
        });
        page.on('pageerror', (error) => errors.push(error.message));

        await page.goto('/en/components/definitely-not-a-component/overview');
        await waitForHydration(page);

        await expect(page).toHaveURL(/\/404$/);
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

test.describe('prerendered SEO metadata', () => {
    test.use({ javaScriptEnabled: false });

    test('is present in the initial HTML without hydration', async ({ page }) => {
        await page.goto('/en/components/alert/overview');

        await expect(page).toHaveTitle('Alert — Overview · Koobiq');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            'content',
            'Shows important information on a page. Can contain a hint, signal a status change, or indicate a problem.'
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

        await page.goto('/examples/select');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

        await page.goto('/examples/popover');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
        await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

        await page.goto('/unknown-page');
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex,follow');
    });
});
