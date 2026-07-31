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

        await expect(page).toHaveTitle('Koobiq');
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

        await expect(page).toHaveTitle('Alert · Koobiq');
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Koobiq/);
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

        await page.getByRole('tab', { name: 'Examples', exact: true }).click();
        await expect(page).toHaveURL(/\/en\/components\/select\/examples$/);
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

        await viewer.getByRole('button', { name: 'Reset state' }).click();

        // Re-running the loader for the already-selected example must re-render it, not blank it out.
        await expect(viewer.locator('.docs-live-example__example')).toBeVisible();
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
