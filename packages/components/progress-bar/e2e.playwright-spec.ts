import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqProgressBar', () => {
    test.describe('E2eProgressBarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eProgressBarStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eProgressBarTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eProgressBarStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test.describe('reduced motion', () => {
            test('leaves the indeterminate fill narrower than a complete bar', async ({ page }) => {
                await page.goto('/E2eProgressBarStateAndStyle');

                // The preference comes from `contextOptions` in the shared config, and it is the whole
                // premise of what follows — so it is asserted rather than re-declared here. Re-declaring
                // it would mean overriding `contextOptions` wholesale and losing the viewport and
                // device scale factor along with it; asserting it fails loudly if the config changes.
                await expect
                    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
                    .toBe(true);

                const fillWidth = (testid: string) =>
                    page
                        .getByTestId(testid)
                        .locator('.kbq-progress-bar__line')
                        .evaluate((line) => {
                            const track = line.parentElement!;

                            return line.getBoundingClientRect().width / track.getBoundingClientRect().width;
                        });

                const indeterminate = await fillWidth('e2eProgressBarIndeterminate');

                expect(await fillWidth('e2eProgressBarComplete')).toBeCloseTo(1, 1);
                // Suppressing the animation used to leave the fill at `width: auto`, i.e. a full track
                // that is indistinguishable from a finished operation.
                expect(indeterminate).toBeLessThan(0.5);
                expect(indeterminate).toBeGreaterThan(0);
            });
        });
    });
});
