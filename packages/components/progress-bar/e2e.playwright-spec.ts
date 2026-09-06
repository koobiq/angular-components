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

        // Stated explicitly even though the whole suite already runs reduced: this is the preference the
        // assertion is about, and it must survive a change to the shared config.
        test.describe('reduced motion', () => {
            test.use({ reducedMotion: 'reduce' });

            test('leaves the indeterminate fill narrower than a complete bar', async ({ page }) => {
                await page.goto('/E2eProgressBarStateAndStyle');

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
