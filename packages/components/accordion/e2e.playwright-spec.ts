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

        const openPanel = async (page: Page, reducedMotion: 'reduce' | 'no-preference') => {
            await page.emulateMedia({ reducedMotion });
            await page.goto('/E2eAccordionContentPanel');
            await getComponent(page).getByTestId('e2eTogglePanel').click();
        };

        // Without a transition, no `transitionend` releases the pinned height.
        for (const reducedMotion of ['no-preference', 'reduce'] as const) {
            test(`expanded content keeps its natural height (reduced motion: ${reducedMotion})`, async ({ page }) => {
                await openPanel(page, reducedMotion);
                const locator = getComponent(page);

                // The first item was expanded before the panel opened, while its content had no box.
                await expect.poll(() => getExpandedFit(locator)).toEqual([true]);

                await getTriggers(locator).nth(1).click();
                await expect.poll(() => getExpandedFit(locator)).toEqual([true, true]);

                await locator.getByTestId('e2eNarrowPanel').click();
                await expect.poll(() => getExpandedFit(locator)).toEqual([true, true]);
            });
        }

        test('collapse from the natural height is animated', async ({ page }) => {
            // The suite runs with reduced motion, which leaves the height nothing to transition.
            await openPanel(page, 'no-preference');
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
