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

    test.describe('E2eInlineEditInteractiveContent', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eInlineEditInteractiveContent');

        // Interactive view content is the field's first tab stop and draws its own ring, so the row must
        // not draw a second one around it — the same rule the menu button follows, for the content the
        // `interactiveSelectors` list keeps reachable. The anchor after it is the edit affordance, and
        // being visually hidden it has nothing to show but the row ring.
        test('draws the ring on the focused link, then on the row for the edit anchor', async ({ page }) => {
            await page.goto('/E2eInlineEditInteractiveContent');

            const field = getComponent(page).locator('kbq-inline-edit');
            const link = page.getByTestId('e2eInlineEditInteractiveContentLink');
            const anchor = field.locator('.kbq-inline-edit__focus-anchor');

            // Entered by keyboard: a programmatic focus() is reported as `program` and draws no ring at
            // all, which would make the check vacuous.
            await link.focus();
            await page.keyboard.press('Shift+Tab');
            await page.keyboard.press('Tab');

            await expect(link).toBeFocused();
            await expect(field).toHaveClass(/cdk-keyboard-focused/);
            await expect(field).toHaveCSS('box-shadow', 'none');

            await page.keyboard.press('Tab');

            await expect(anchor).toBeFocused();
            await expect(field).not.toHaveCSS('box-shadow', 'none');
        });
    });
});
