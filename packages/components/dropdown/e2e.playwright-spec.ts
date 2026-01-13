import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqDropdownModule', () => {
    test.describe('E2eDropdownStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDropdownStates');
        const getDropdownTrigger = (page: Page) => page.getByTestId('e2eDropdownTrigger');
        const getSubmenuTrigger = (page: Page) => page.getByTestId('e2eSubmenuTrigger');
        const getSubmenu2ItemWithIcon = (page: Page) => page.getByTestId('e2eSubmenu2ItemWithIcon');

        test('light theme', async ({ page }) => {
            await page.goto('/E2eDropdownStates');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getDropdownTrigger(page).click();
            await getSubmenuTrigger(page).hover();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowRight');
            await getSubmenu2ItemWithIcon(page).hover();
            await expect(component).toHaveScreenshot();
        });

        test('dark theme', async ({ page }) => {
            await page.goto('/E2eDropdownStates');
            await e2eEnableDarkTheme(page);
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getDropdownTrigger(page).click();
            await getSubmenuTrigger(page).hover();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowRight');
            await getSubmenu2ItemWithIcon(page).hover();
            await expect(component).toHaveScreenshot();
        });
    });
});
