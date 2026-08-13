import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqIconModule', () => {
    test.describe('E2eIconStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eIconStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eIconTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eIconStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eIconSvg', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eIconSvg');

        /**
         * Every icon on this page arrives over HTTP: E2eIconSvg registers a resolver mapping each name
         * onto /assets/SVGIcons/<name>.svg, and KbqIcon injects the response into its host element once
         * it lands. Until then the host is empty and occupies no space, so the text around it sits where
         * it will not stay — a capture taken too early differs as a whole-page horizontal shift rather
         * than as one wrong-looking icon, which is misleading enough to be worth ruling out here.
         *
         * Safe to require of every icon because every icon on this page resolves to inline SVG; none
         * falls back to the font-class path, so this cannot hang on one that was never going to load.
         * That is a property of E2eIconSvg's resolver provider, not of KbqIcon — the sibling page above
         * has no such provider and renders its icons as font classes, so the same wait there would never
         * be satisfied.
         *
         * The first assertion is the guard: without it the second passes trivially against a page that
         * has not rendered yet.
         */
        const waitForIcons = async (page: Page) => {
            await expect(page.locator('.kbq-icon').first()).toBeAttached();
            await expect(page.locator('.kbq-icon:not(:has(svg))')).toHaveCount(0);
        };

        test('svg icons', async ({ page }) => {
            await page.goto('/E2eIconSvg');
            await waitForIcons(page);
            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
        });
    });
});
