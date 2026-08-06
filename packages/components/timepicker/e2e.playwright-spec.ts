import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTimepickerModule', () => {
    test.describe('E2eTimepickerStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTimepickerStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTimepickerStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        test('should not let digits grow beyond the mask on incomplete value', async ({ page }) => {
            await page.goto('/E2eTimepickerStates');

            const input = page.getByTestId('e2eTimepickerShort');

            // an incomplete value: the minutes part has a single digit, so it never parses as time
            await input.fill('11:1');
            // place the caret at the very beginning, as a mouse click would
            await input.evaluate((element: HTMLInputElement) => element.setSelectionRange(0, 0));

            for (let index = 0; index < 10; index++) {
                await input.press('9');
            }

            await expect(input).toHaveValue(/^\d{1,2}:\d{1,2}$/);
        });
    });
});
