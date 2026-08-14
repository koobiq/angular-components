import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTagModule', () => {
    test.describe('E2eTagStateAndStyle', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagStateAndStyle');
        const getScreenshotTarget = (locator: Locator): Locator => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eTagStateAndStyle');
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(getComponent(page))).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTagEditable', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagEditable');
        const getLastTag = (locator: Locator): Locator => locator.locator('kbq-tag').last();

        test('editable', async ({ page }) => {
            await page.goto('/E2eTagEditable');
            const component = getComponent(page);

            await getLastTag(component).dblclick();

            await expect(component).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eTagAutocompleteStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagAutocompleteStates');
        const getAutocompleteInput = (page: Page): Locator => page.getByTestId('e2eTagAutocompleteInput');

        test('states', async ({ page }) => {
            await page.goto('/E2eTagAutocompleteStates');
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });

    test.describe('E2eTagInputStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagInputStates');
        const getTagInput = (page: Page): Locator => page.getByTestId('e2eTagInput');

        test('states', async ({ page }) => {
            await page.goto('/E2eTagInputStates');
            await getTagInput(page).focus();
            await expect(getComponent(page)).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('04-dark.png');
        });
    });

    test.describe('E2eTagListStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagListStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTagListStates');
            await expect(getComponent(page)).toHaveScreenshot('05-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('05-dark.png');
        });
    });

    test.describe('E2eTagInputSeparators', () => {
        test.use({ permissions: ['clipboard-read', 'clipboard-write'] });

        const getComponent = (page: Page): Locator => page.getByTestId('e2eTagInputSeparators');
        const getInput = (page: Page): Locator => page.getByTestId('e2eTagInputSeparatorsInput');
        const getTags = (component: Locator): Locator => component.locator('kbq-tag');

        const pasteFromClipboard = async (page: Page, target: Locator, text: string) => {
            await page.evaluate((value) => navigator.clipboard.writeText(value), text);
            await target.click();
            await page.keyboard.press('ControlOrMeta+v');
        };

        test('creates a tag on Enter while typing', async ({ page }) => {
            await page.goto('/E2eTagInputSeparators');
            const input = getInput(page);

            await input.fill('typed-tag');
            await input.press('Enter');

            await expect(getTags(getComponent(page))).toHaveText(['typed-tag']);
        });

        test('does not end the tag on Space while typing, since it is a paste-only separator', async ({ page }) => {
            await page.goto('/E2eTagInputSeparators');
            const input = getInput(page);

            await input.pressSequentially('two words');

            await expect(getTags(getComponent(page))).toHaveCount(0);
            await expect(input).toHaveValue('two words');
        });

        test('splits pasted text on whitespace, via the keyless `appliesTo: paste` separator', async ({ page }) => {
            await page.goto('/E2eTagInputSeparators');
            const input = getInput(page);

            await pasteFromClipboard(page, input, 'alpha beta\tgamma\ndelta');

            await expect(getTags(getComponent(page))).toHaveText(['alpha', 'beta', 'gamma', 'delta']);
        });

        test('splits pasted text on Enter, a separator shared by both contexts', async ({ page }) => {
            await page.goto('/E2eTagInputSeparators');
            const input = getInput(page);

            await pasteFromClipboard(page, input, 'first\nsecond');

            await expect(getTags(getComponent(page))).toHaveText(['first', 'second']);
        });
    });
});
