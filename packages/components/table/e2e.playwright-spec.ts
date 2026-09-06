import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqTableModule', () => {
    test.describe('E2eTableStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTableStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTableStates');
            await getComponent(page)
                .getByTestId('e2eTableStickyHeader')
                .evaluate((el) => (el.scrollTop = 60));
            await getComponent(page)
                .getByTestId('e2eTableStickyHeaderOnCard')
                .evaluate((el) => (el.scrollTop = 60));
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        // WCAG 2.2 SC 2.4.11. Scrolling backwards aligns the target with the top of the scrollport,
        // which is exactly where the pinned header sits — without `scroll-margin` the focused control
        // lands underneath it. Asserted on boxes rather than pixels.
        test('sticky header does not obscure a control focused from below', async ({ page }) => {
            await page.goto('/E2eTableStates');

            const container = getComponent(page).getByTestId('e2eTableStickyHeader');
            const headerCell = container.locator('thead th').first();
            const topButton = container.getByRole('button', { name: 'Top' });

            await container.evaluate((el) => (el.scrollTop = el.scrollHeight));
            await topButton.evaluate((el: HTMLElement) => el.focus());

            const headerBox = (await headerCell.boundingBox())!;
            const buttonBox = (await topButton.boundingBox())!;

            expect(buttonBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1);
        });
    });
});
