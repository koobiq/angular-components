import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqAccordionModule', () => {
    test.describe('E2eAccordionStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAccordionStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eAccordionStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eAccordionContentPanel', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eAccordionContentPanel');
        const getTriggers = (locator: Locator) => locator.locator('button[kbq-accordion-trigger]');

        /** For every expanded region, whether it is exactly as tall as its body: neither clipped nor padded out. */
        const getExpandedFit = (locator: Locator) =>
            locator.locator('.kbq-accordion-content[data-state="open"]').evaluateAll((regions) =>
                regions.map((region) => {
                    const { height } = region.getBoundingClientRect();

                    return height > 0 && height === region.firstElementChild?.getBoundingClientRect().height;
                })
            );

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eAccordionContentPanel');
            await getComponent(page).getByTestId('e2eTogglePanel').click();
        });

        test('expanded content keeps its natural height', async ({ page }) => {
            const locator = getComponent(page);

            // The first item was expanded before the panel opened, while its content had no box.
            await expect.poll(() => getExpandedFit(locator)).toEqual([true]);

            await getTriggers(locator).nth(1).click();
            await expect.poll(() => getExpandedFit(locator)).toEqual([true, true]);

            await locator.getByTestId('e2eNarrowPanel').click();
            await expect.poll(() => getExpandedFit(locator)).toEqual([true, true]);
        });

        test('collapse from the natural height is animated', async ({ page }) => {
            const locator = getComponent(page);
            const region = locator.locator('.kbq-accordion-content').first();

            await region.evaluate((element) =>
                element.addEventListener('transitionrun', (event) => {
                    if ((event as TransitionEvent).propertyName === 'height') {
                        element.setAttribute('data-e2e-height-transition', '');
                    }
                })
            );

            await getTriggers(locator).first().click();

            // `height: auto` does not transition, so this runs only if the height was pinned first.
            await expect(region).toHaveAttribute('data-e2e-height-transition');
            await expect.poll(() => region.evaluate((element) => element.getBoundingClientRect().height)).toBe(0);
        });
    });
});
