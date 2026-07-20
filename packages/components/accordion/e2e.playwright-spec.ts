import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAccordionModule', () => {
    test.describe('E2eAccordionStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAccordionStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');
        const getFirstAccordion = (locator: Locator) => getScreenshotTarget(locator).locator('kbq-accordion').first();
        const getFirstTrigger = (locator: Locator) =>
            getScreenshotTarget(locator).locator('button[kbq-accordion-trigger]').first();

        test('states', async ({ page }) => {
            await page.goto('/E2eAccordionStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });

        test('keyboard focus ring', async ({ page }) => {
            await page.goto('/E2eAccordionStates');
            const locator = getComponent(page);

            // Keyboard focus (Tab) so the accordion applies its `cdk-keyboard-focused` ring.
            await page.keyboard.press('Tab');

            // Assert the ring is actually there before snapshotting: a change in tab order would
            // otherwise silently capture an accordion with no focused trigger at all.
            await expect(getFirstTrigger(locator)).toBeFocused();
            await expect(getFirstAccordion(locator)).toHaveClass(/cdk-keyboard-focused/);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-focus-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('02-focus-dark.png');
        });

        test('trigger hover', async ({ page }) => {
            await page.goto('/E2eAccordionStates');
            const locator = getComponent(page);

            await getFirstTrigger(locator).hover();

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-hover-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('03-hover-dark.png');
        });
    });
});
