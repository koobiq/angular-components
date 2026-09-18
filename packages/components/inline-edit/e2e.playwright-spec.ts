import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme, e2eWaitForSettledScrollbars } from '../../e2e/utils';

test.describe('KbqInlineEdit', () => {
    test.describe('E2eInlineEditStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInlineEditStates');
        const getTable = (locator: Locator) => locator.getByTestId('e2eInlineEditList');
        const clickOpenTrigger = (locator: Locator) => locator.getByTestId('e2eInlineEditOpenTrigger').click();
        const clickFocusTrigger = (locator: Locator) => locator.getByTestId('e2eInlineEditFocusTrigger').click();

        test('edit states', async ({ page }) => {
            await page.goto('/E2eInlineEditStates');

            const component = getComponent(page);

            const screenshotTarget = getTable(component);

            await clickOpenTrigger(component);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        test('view states', async ({ page }) => {
            await page.goto('/E2eInlineEditStates');

            const component = getComponent(page);

            const screenshotTarget = getTable(component);

            await clickFocusTrigger(component);

            await expect(screenshotTarget).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eInlineEditTruncation', () => {
        const getList = (page: Page) => page.getByTestId('e2eInlineEditTruncationList');

        test('text truncation', async ({ page }) => {
            await page.goto('/E2eInlineEditTruncation');

            const screenshotTarget = getList(page);

            await expect(screenshotTarget).toHaveScreenshot('04-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('04-dark.png');
        });

        test('text truncation hover with menu', async ({ page }) => {
            await page.goto('/E2eInlineEditTruncation');

            const screenshotTarget = getList(page);

            await page.getByTestId('e2eInlineEditTruncationWithMenu').hover();

            await expect(screenshotTarget).toHaveScreenshot('05-light.png');
            await e2eEnableDarkTheme(page);
            await page.getByTestId('e2eInlineEditTruncationWithMenu').hover();
            await expect(screenshotTarget).toHaveScreenshot('05-dark.png');
        });
    });

    test.describe('E2eInlineEditActionButtons', () => {
        const getContainer = (page: Page) => page.getByTestId('e2eInlineEditActionButtonsContainer');
        const openEdit = (page: Page) => page.getByTestId('e2eInlineEditActionButtonsOpen').click();
        const getSaveButton = (page: Page) =>
            page.locator('.kbq-inline-edit__action-buttons .kbq-inline-edit__action-button').first().locator('button');

        test('invalid state on save attempt', async ({ page }) => {
            await page.goto('/E2eInlineEditActionButtons');

            await openEdit(page);
            await page.getByRole('textbox').clear();
            await getSaveButton(page).click();

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('07-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('07-dark.png');
        });
    });

    test.describe('E2eInlineEditSaveStates', () => {
        const getContainer = (page: Page) => page.getByTestId('e2eInlineEditSaveStatesContainer');
        const getRows = (page: Page) => getContainer(page).locator('.kbq-inline-edit');
        const getPanel = (page: Page) => page.locator('.kbq-inline-edit__panel');

        /**
         * Opens each row, changes the value and saves it with Enter. The save states are only reachable through a
         * real commit — opening the editor is what captures the value — so driving them from the fixture instead
         * would screenshot a state no user can produce. The value has to differ: `compareWith` sends nothing for
         * one the editor opened with. View mode holds its own markup, so the rows look the same either way.
         */
        const commitRows = async (page: Page, testId: string) => {
            for (const row of await page.getByTestId(testId).all()) {
                await row.click();

                const input = getPanel(page).locator('input');

                await expect(input).toBeFocused();
                await input.fill('changed value');
                await page.keyboard.press('Enter');
                await expect(getPanel(page)).toBeHidden();
            }
        };

        const commitPendingRows = (page: Page) => commitRows(page, 'e2eInlineEditSaveStatesPendingRow');
        const commitFailingRows = (page: Page) => commitRows(page, 'e2eInlineEditSaveStatesFailingRow');

        test('progress in view mode', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await commitPendingRows(page);
            await expect(getRows(page).first()).toHaveClass(/kbq-progress/);

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('08-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('08-dark.png');
        });

        test('failed save in view mode', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await commitFailingRows(page);
            await expect(getRows(page).last()).toHaveClass(/kbq-inline-edit_save-error/);

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('09-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('09-dark.png');
        });

        test('failed save keeps its background while the action menu is open', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await commitFailingRows(page);

            const rowWithMenu = getRows(page).last();

            await expect(rowWithMenu).toHaveClass(/kbq-inline-edit_save-error/);

            await rowWithMenu.getByTestId('e2eInlineEditSaveStatesMenu').click();
            await expect(page.locator('.kbq-dropdown__panel')).toBeVisible();
            // `kbq-active` is what the open-menu background keys off, and it applies only while the row itself
            // isn't hovered — which is where it used to win over the failed one.
            await expect(rowWithMenu.locator('.kbq-inline-edit__menu')).toHaveClass(/kbq-active/);
            await page.mouse.move(0, 0);

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('10-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('10-dark.png');
        });

        test('failed save on hover', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await commitFailingRows(page);

            const rowWithMenu = getRows(page).last();

            await expect(rowWithMenu).toHaveClass(/kbq-inline-edit_save-error/);
            // Saving with the keyboard leaves the row focused, and the focus ring would cover the background
            // this shot is about.
            await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
            await expect(rowWithMenu).not.toHaveClass(/cdk-keyboard-focused/);
            // Hover carries both the error hover background and the menu mask painted on top of it.
            await rowWithMenu.hover();

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('11-light.png');
            await e2eEnableDarkTheme(page);
            await rowWithMenu.hover();
            await expect(screenshotTarget).toHaveScreenshot('11-dark.png');
        });
    });

    test.describe('E2eInlineEditSelectMultiline', () => {
        const getContainer = (page: Page) => page.getByTestId('e2eInlineEditSelectMultilineContainer');
        const getInlineEdit = (locator: Locator) => locator.getByTestId('e2eInlineEditSelectMultiline');

        test('multiline select-style editor', async ({ page }) => {
            await page.goto('/E2eInlineEditSelectMultiline');

            const screenshotTarget = getContainer(page);

            await getInlineEdit(screenshotTarget).click();
            // The embedded select flashes its track on open, and the shot lands inside that window unless
            // it is waited out. The panel is in an overlay at body level, so the count is page-scoped.
            await e2eWaitForSettledScrollbars(page, 1);

            await expect(screenshotTarget).toHaveScreenshot('06-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('06-dark.png');
        });
    });

    test.describe('E2eInlineEditMenuButton', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInlineEditMenuButton');
        const getContainer = (page: Page) => page.getByTestId('e2eInlineEditMenuButtonContainer');

        test('menu button hover', async ({ page }) => {
            await page.goto('/E2eInlineEditMenuButton');
            await page.setViewportSize({ width: 100, height: 32 });

            const screenshotTarget = getContainer(page);

            await getComponent(page).hover();

            await expect(screenshotTarget).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await getComponent(page).hover();
            await expect(screenshotTarget).toHaveScreenshot('03-dark.png');
        });
    });
});
