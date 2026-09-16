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
        const getPanel = (page: Page) => page.locator('.kbq-inline-edit__panel');
        const getSaveButton = (page: Page) =>
            getPanel(page).locator('.kbq-inline-edit__action-button').first().locator('button');

        test('progress on the save button', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await page.getByTestId('e2eInlineEditSaveStatesOpenWithActions').click();
            await getSaveButton(page).click();
            await expect(getSaveButton(page)).toHaveClass(/kbq-progress/);

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('08-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('08-dark.png');
        });

        test('progress on the field without action buttons', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await page.getByTestId('e2eInlineEditSaveStatesOpenWithoutActions').click();
            await getPanel(page).getByRole('textbox').press('Enter');
            await expect(getPanel(page).locator('.kbq-inline-edit__control-container')).toHaveClass(/kbq-progress/);

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('09-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('09-dark.png');
        });

        test('server error on save', async ({ page }) => {
            await page.goto('/E2eInlineEditSaveStates');

            await page.getByTestId('e2eInlineEditSaveStatesOpenError').click();
            await getSaveButton(page).click();
            await expect(page.locator('.kbq-tooltip')).toHaveText('Couldn’t save the changes. Try again');
            // The tooltip fades in; shooting before the animation ends captures it half-transparent.
            await expect(page.locator('.kbq-tooltip')).toHaveCSS('opacity', '1');

            const screenshotTarget = getContainer(page);

            await expect(screenshotTarget).toHaveScreenshot('10-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('10-dark.png');
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
