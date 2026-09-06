import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqTimeRangeModule', () => {
    test.describe('E2eTimeRangeStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eTimeRangeStates');
        const getTrigger = (page: Page): Locator => page.getByTestId('e2eTimeRangeTrigger');
        const getPopover = (page: Page): Locator => page.locator('.kbq-time-range__popover');

        test('states', async ({ page }) => {
            await page.goto('/E2eTimeRangeStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        test('editor', async ({ page }) => {
            await page.goto('/E2eTimeRangeStates');
            await getTrigger(page).click();
            await expect(getPopover(page)).toBeVisible();

            await expect(getPopover(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getPopover(page)).toHaveScreenshot('02-dark.png');
        });

        // A `radiogroup` that also owns two datepickers and two timepickers reaches assistive
        // technology as a group of six controls of which only two are radios.
        test('should keep the radiogroup free of anything but radios', async ({ page }) => {
            await page.goto('/E2eTimeRangeStates');
            await getTrigger(page).click();

            const radioGroup = getPopover(page).locator('kbq-radio-group');

            await expect(radioGroup).toBeVisible();
            await expect(radioGroup.locator('kbq-form-field')).toHaveCount(0);
            await expect(radioGroup.locator('.kbq-time-range-editor__date-time')).toHaveCount(0);
        });

        test('should apply the end date picked in the calendar', async ({ page }) => {
            await page.goto('/E2eTimeRangeStates');
            await getTrigger(page).click();
            await getPopover(page).locator('.kbq-time-range-editor__range-option').click();

            // The `to` pair is the second date/time row.
            const toRow = getPopover(page).locator('.kbq-time-range-editor__date-time').nth(1);

            await toRow.locator('kbq-datepicker-toggle-icon').click();

            // The last day of the shown month is always at or after the seeded `from` date, so the
            // range stays valid and Apply stays enabled.
            const day = page.locator('.kbq-calendar__body-cell-content').last();
            const dayText = ((await day.textContent()) || '').trim();

            await day.click();
            await getPopover(page).locator('.kbq-time-range__buttons button').first().click();

            await expect(getTrigger(page)).toContainText(dayText);
        });

        test('should not open the editor for a disabled control', async ({ page }) => {
            await page.goto('/E2eTimeRangeStates');

            const disabledTrigger = getComponent(page).locator('kbq-time-range.kbq-disabled');

            await expect(disabledTrigger).toHaveCount(1);
            await expect(disabledTrigger.locator('a')).toHaveAttribute('tabindex', '-1');

            await disabledTrigger.click({ force: true });

            await expect(getPopover(page)).toHaveCount(0);
        });
    });
});
