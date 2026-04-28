import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAutocompleteModule', () => {
    test.describe('E2eAutocompleteStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eAutocompleteStates');
        const getAutocompleteInput = (page: Page): Locator => page.getByTestId('e2eAutocompleteInput');

        test('states', async ({ page }) => {
            await page.goto('/E2eAutocompleteStates');
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('Fallback positions', () => {
        const getInput = (page: Page) => page.getByTestId('e2eAutocompleteInput');
        const getPanel = (page: Page) => page.locator('.kbq-autocomplete-panel');

        test('falls back to above position when there is no room below', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 400 });
            await page.goto('/E2eAutocompleteFallbackPosition');

            const input = getInput(page);

            await input.click();

            const panel = getPanel(page);

            await expect(panel).toBeVisible();
            await expect(panel).toHaveClass(/kbq-autocomplete-panel-above/);

            const inputBox = await input.boundingBox();
            const panelBox = await panel.boundingBox();

            expect(inputBox).not.toBeNull();
            expect(panelBox).not.toBeNull();
            expect(Math.floor(panelBox!.y + panelBox!.height)).toBeLessThanOrEqual(Math.ceil(inputBox!.y));
        });

        test('panel grows when the number of results increases', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            await page.goto('/E2eAutocompleteExpandOnResults');

            const input = getInput(page);
            const panel = getPanel(page);

            await input.click();
            await input.fill('Option 1');
            await expect(panel).toBeVisible();

            const initialBox = await panel.boundingBox();

            expect(initialBox).not.toBeNull();
            expect(initialBox!.height).toBeGreaterThan(0);

            await input.fill('Option');
            await expect.poll(async () => (await panel.boundingBox())?.height ?? 0).toBeGreaterThan(initialBox!.height);
        });
    });

    test.describe('Scroll strategy: close', () => {
        const getInput = (page: Page) => page.getByTestId('e2eAutocompleteInput');
        const getScrollContainer = (page: Page) => page.getByTestId('e2eAutocompleteScrollContainer');
        const getPanel = (page: Page) => page.locator('.kbq-autocomplete-panel');

        test('closes the panel when its container scrolls', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            await page.goto('/E2eAutocompleteScrollClose');

            const input = getInput(page);
            const panel = getPanel(page);

            await input.click();
            await expect(panel).toBeVisible();

            await getScrollContainer(page).evaluate((el) => el.scrollBy(0, 200));

            await expect(panel).toBeHidden();
        });
    });
});
