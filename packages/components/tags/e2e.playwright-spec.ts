import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTagModule', () => {
    test.describe('E2eTagStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagStateAndStyle');
        const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eTagStateAndStyle');
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });

        test('states (dark theme)', async ({ page }) => {
            await page.goto('/E2eTagStateAndStyle');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot();
        });
    });

    test.describe('E2eTagEditable', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagEditable');
        const getLastTag = (locator: Locator): Locator => locator.locator('kbq-tag').last();

        test('editable', async ({ page }) => {
            await page.goto('/E2eTagEditable');

            const component = getComponent(page);

            await getLastTag(component).dblclick();

            await expect(component).toHaveScreenshot();
        });

        test('editable (dark theme)', async ({ page }) => {
            await page.goto('/E2eTagEditable');
            await e2eEnableDarkTheme(page);

            const component = getComponent(page);

            await getLastTag(component).dblclick();

            await expect(component).toHaveScreenshot();
        });
    });

    test.describe('E2eTagAutocompleteStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagAutocompleteStates');
        const getAutocompleteInput = (page: Page): Locator => page.getByTestId('e2eTagAutocompleteInput');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTagAutocompleteStates');
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTagAutocompleteStates');
            await e2eEnableDarkTheme(page);
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eTagInputStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagInputStates');
        const getTagInput = (page: Page): Locator => page.getByTestId('e2eTagInput');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTagInputStates');
            await getTagInput(page).focus();
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTagInputStates');
            await e2eEnableDarkTheme(page);
            await getTagInput(page).focus();
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });

    test.describe('E2eTagListStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagListStates');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eTagListStates');
            await expect(getComponent(page)).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eTagListStates');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot();
        });
    });
});
