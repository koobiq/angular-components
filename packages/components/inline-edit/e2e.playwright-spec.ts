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

        // Asserted on DOM state rather than pixels: the keyboard contract needs no baseline of its own.
        test.describe('keyboard', () => {
            const getField = (page: Page, index: number) =>
                getTable(getComponent(page)).locator('kbq-inline-edit').nth(index);
            const getViewContent = (field: Locator) => field.locator('.kbq-inline-edit__view-content');
            const getPanelInput = (page: Page) => page.locator('.kbq-inline-edit__panel input');

            test('opens on Enter and returns focus to the view on Escape', async ({ page }) => {
                await page.goto('/E2eInlineEditStates');

                const field = getField(page, 1);

                await getViewContent(field).focus();
                await page.keyboard.press('Enter');

                await expect(field).toHaveClass(/kbq-inline-edit_edit/);
                await expect(getPanelInput(page)).toBeFocused();

                await page.keyboard.press('Escape');

                await expect(field).toHaveClass(/kbq-inline-edit_view/);
                await expect(getViewContent(field)).toBeFocused();
            });

            test('saves and closes on Enter', async ({ page }) => {
                await page.goto('/E2eInlineEditStates');

                const field = getField(page, 1);

                await getViewContent(field).focus();
                await page.keyboard.press('Enter');
                await expect(getPanelInput(page)).toBeFocused();

                await page.keyboard.type('updated');
                await page.keyboard.press('Enter');

                await expect(field).toHaveClass(/kbq-inline-edit_view/);
                await expect(getViewContent(field)).toBeFocused();
            });

            // Tab out of the panel's last control saves and opens the neighbour. The chain resolves the
            // neighbour from where the browser actually moved focus, so only a real Tab exercises it.
            test('chains to the next field on Tab out of the panel', async ({ page }) => {
                await page.goto('/E2eInlineEditStates');

                const field = getField(page, 1);
                const next = getField(page, 2);

                await getViewContent(field).focus();
                await page.keyboard.press('Enter');
                await expect(getPanelInput(page)).toBeFocused();

                await page.keyboard.press('Tab');

                await expect(field).toHaveClass(/kbq-inline-edit_view/);
                await expect(next).toHaveClass(/kbq-inline-edit_edit/);
                await expect(getPanelInput(page)).toBeFocused();
            });

            test('chains backwards on Shift+Tab', async ({ page }) => {
                await page.goto('/E2eInlineEditStates');

                await getViewContent(getField(page, 2)).focus();
                await page.keyboard.press('Enter');
                await expect(getPanelInput(page)).toBeFocused();

                await page.keyboard.press('Shift+Tab');

                await expect(getField(page, 2)).toHaveClass(/kbq-inline-edit_view/);
                await expect(getField(page, 1)).toHaveClass(/kbq-inline-edit_edit/);
            });

            test('chains twice in a row', async ({ page }) => {
                await page.goto('/E2eInlineEditStates');

                await getViewContent(getField(page, 1)).focus();
                await page.keyboard.press('Enter');
                await expect(getPanelInput(page)).toBeFocused();

                await page.keyboard.press('Tab');
                await expect(getField(page, 2)).toHaveClass(/kbq-inline-edit_edit/);
                await expect(getPanelInput(page)).toBeFocused();

                await page.keyboard.press('Tab');
                await expect(getField(page, 3)).toHaveClass(/kbq-inline-edit_edit/);
            });
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

    test.describe('E2eInlineEditSelectChain', () => {
        const getField = (page: Page, index: number) =>
            page.getByTestId('e2eInlineEditSelectChainList').locator('kbq-inline-edit').nth(index);
        const getViewContent = (field: Locator) => field.locator('.kbq-inline-edit__view-content');

        // The select puts its options in an overlay of its own and swallows Tab, so neither the panel's
        // own handler nor the focus the chain normally follows survives. Covered end to end because
        // nothing below the browser reproduces either half.
        test('chains to the next field on Tab out of a select editor', async ({ page }) => {
            await page.goto('/E2eInlineEditSelectChain');

            const field = getField(page, 0);
            const next = getField(page, 1);

            await getViewContent(field).focus();
            await page.keyboard.press('Enter');
            await expect(field).toHaveClass(/kbq-inline-edit_edit/);

            await page.keyboard.press('Tab');

            await expect(field).toHaveClass(/kbq-inline-edit_view/);
            await expect(next).toHaveClass(/kbq-inline-edit_edit/);
        });

        test('chains backwards on Shift+Tab out of a select editor', async ({ page }) => {
            await page.goto('/E2eInlineEditSelectChain');

            await getViewContent(getField(page, 1)).focus();
            await page.keyboard.press('Enter');
            await expect(getField(page, 1)).toHaveClass(/kbq-inline-edit_edit/);

            await page.keyboard.press('Shift+Tab');

            await expect(getField(page, 1)).toHaveClass(/kbq-inline-edit_view/);
            await expect(getField(page, 0)).toHaveClass(/kbq-inline-edit_edit/);
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

        // The host monitors its whole subtree, so it is marked focused for the menu button as well, and
        // that button draws a ring of its own. Asserted on the computed shadow rather than on a class:
        // `cdk-keyboard-focused` on the host stays correct, it is the second ring that must not appear.
        test('draws no second focus ring when the menu takes focus', async ({ page }) => {
            await page.goto('/E2eInlineEditMenuButton');

            const field = getComponent(page).locator('kbq-inline-edit');
            const viewContent = field.locator('.kbq-inline-edit__view-content');
            const menu = field.locator('.kbq-inline-edit__menu');

            // Step away and back, so the view content is entered by keyboard: a programmatic focus() is
            // reported as `program` and draws no ring at all, which would make the check vacuous.
            await viewContent.focus();
            await page.keyboard.press('Shift+Tab');
            await page.keyboard.press('Tab');

            await expect(viewContent).toBeFocused();
            await expect(field).not.toHaveCSS('box-shadow', 'none');

            await page.keyboard.press('Tab');

            await expect(menu).toBeFocused();
            await expect(menu).toHaveClass(/cdk-keyboard-focused/);
            await expect(field).toHaveCSS('box-shadow', 'none');
        });
    });
});
