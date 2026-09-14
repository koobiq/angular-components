import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqNotificationCenterModule', () => {
    test.describe('E2eNotificationCenterStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eNotificationCenterStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eNotificationCenterStates');
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('bottom states', () => {
        test('the empty state replaces the list when there is nothing to show', async ({ page }) => {
            await page.goto('/E2eNotificationCenterEmpty');

            await expect(page.getByTestId('kbq-notification-center-empty')).toBeVisible();
            await expect(page.getByTestId('kbq-notification-item')).toHaveCount(0);
        });

        test('loading mode replaces the list with the loader', async ({ page }) => {
            await page.goto('/E2eNotificationCenterLoading');

            await expect(page.getByTestId('kbq-notification-center-loader')).toBeVisible();
            await expect(page.getByTestId('kbq-notification-center-empty')).toHaveCount(0);
        });

        test('error mode replaces the list with the error state', async ({ page }) => {
            await page.goto('/E2eNotificationCenterError');

            await expect(page.getByTestId('kbq-notification-center-error')).toBeVisible();
            await expect(page.getByTestId('kbq-notification-center-reload-button')).toBeVisible();
            await expect(page.getByTestId('kbq-notification-item')).toHaveCount(0);
        });

        test('the load-more spinner is appended below the list', async ({ page }) => {
            await page.goto('/E2eNotificationCenterLoadMore');

            await expect(page.getByTestId('kbq-notification-center-load-more')).toBeVisible();
            // The two bottom rows are mutually exclusive - a spinner and a failure cannot both be true.
            await expect(page.getByTestId('kbq-notification-center-load-more-error')).toHaveCount(0);
            await expect(page.getByTestId('kbq-notification-center-empty')).toHaveCount(0);
        });

        test('the load-more error row offers a retry instead of the spinner', async ({ page }) => {
            await page.goto('/E2eNotificationCenterLoadMoreError');

            await expect(page.getByTestId('kbq-notification-center-load-more-error')).toBeVisible();
            await expect(page.getByTestId('kbq-notification-center-load-more-retry-button')).toBeVisible();
            await expect(page.getByTestId('kbq-notification-center-load-more')).toHaveCount(0);
        });
    });

    test.describe('E2eNotificationCenterTrigger', () => {
        const isFocusInsidePanel = (page: Page) =>
            page.evaluate(() => !!document.activeElement?.closest('.kbq-notification-center'));
        const panel = (page: Page) => page.locator('.kbq-notification-center__panel .kbq-notification-center');
        const triggerButton = (page: Page) => page.getByTestId('e2eNotificationCenterTriggerButton');

        const open = async (page: Page) => {
            await page.goto('/E2eNotificationCenterTrigger');
            await triggerButton(page).click();
            await expect(panel(page)).toBeVisible();
        };

        test('the trigger reports the panel state', async ({ page }) => {
            await page.goto('/E2eNotificationCenterTrigger');

            await expect(triggerButton(page)).toHaveAttribute('aria-expanded', 'false');

            await triggerButton(page).click();
            await expect(panel(page)).toBeVisible();

            await expect(triggerButton(page)).toHaveAttribute('aria-expanded', 'true');

            const panelId = await panel(page).getAttribute('id');

            expect(panelId).toBeTruthy();
            await expect(triggerButton(page)).toHaveAttribute('aria-controls', panelId!);
        });

        test('the panel is a dialog named by its heading', async ({ page }) => {
            await open(page);

            await expect(panel(page)).toHaveAttribute('role', 'dialog');

            const labelledBy = await panel(page).getAttribute('aria-labelledby');

            expect(labelledBy).toBeTruthy();
            await expect(page.locator(`#${labelledBy}`)).toHaveClass(/kbq-notification-center-title__text/);
            await expect(page.locator(`#${labelledBy}`)).not.toBeEmpty();
        });

        test('every icon-only control in the header is named', async ({ page }) => {
            await open(page);

            const headerButtonTestIds = [
                'kbq-notification-center-silent-mode-toggle',
                'kbq-notification-center-remove-all-button',
                'kbq-notification-center-close-button'
            ];

            for (const testId of headerButtonTestIds) {
                await expect(page.getByTestId(testId)).toHaveAttribute('aria-label', /\S/);
            }
        });

        test('the delete buttons are reachable with the keyboard', async ({ page }) => {
            await open(page);

            // The buttons used to be `display: none` until hovered, which kept them out of the tab order
            // entirely - walk the tab order from the initially focused control until one of them lands.
            let reached = false;

            for (let index = 0; index < 10 && !reached; index++) {
                await page.keyboard.press('Tab');

                reached = await page.evaluate(
                    () =>
                        document.activeElement?.getAttribute('data-testid') ===
                        'kbq-notification-center-remove-group-button'
                );
            }

            expect(reached).toBe(true);
        });

        test('focus stays inside the open panel', async ({ page }) => {
            await open(page);

            for (let index = 0; index < 30; index++) {
                await page.keyboard.press('Tab');
            }

            expect(await isFocusInsidePanel(page)).toBe(true);
        });

        test('Escape closes the panel and returns focus to the trigger', async ({ page }) => {
            await open(page);

            await page.keyboard.press('Tab');
            await page.keyboard.press('Escape');

            await expect(panel(page)).toBeHidden();
            await expect(triggerButton(page)).toBeFocused();
        });

        test('deleting a group keeps focus inside the panel', async ({ page }) => {
            await open(page);

            const groups = page.getByTestId('kbq-notification-center-group');
            const initialCount = await groups.count();

            // The delete button only takes pointer events once its group is hovered.
            await groups.first().hover();
            await page.getByTestId('kbq-notification-center-remove-group-button').first().click();

            await expect(groups).toHaveCount(initialCount - 1);
            expect(await isFocusInsidePanel(page)).toBe(true);
        });
    });
});
