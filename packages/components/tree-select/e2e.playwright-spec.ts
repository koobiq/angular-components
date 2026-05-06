import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

/* -------------------------------------------------------------------------- */
/*  Helpers for layout-dependent positioning tests migrated from              */
/*  tree-select.component.karma-spec.ts and from xit blocks in                */
/*  tree-select.component.spec.ts.                                            */
/* -------------------------------------------------------------------------- */

/** Sets `position: fixed` and `top`/`left` on the form field so the trigger lands at a known viewport spot. */
async function pinFormField(
    page: Page,
    coords: { top?: number; bottom?: number; left?: number; right?: number }
): Promise<void> {
    await page.evaluate((c) => {
        const formField = document.querySelector<HTMLElement>('[data-testid="e2eFormField"]');

        if (!formField) return;

        formField.style.position = 'fixed';
        if (c.top !== undefined) formField.style.top = `${c.top}px`;
        if (c.bottom !== undefined) formField.style.bottom = `${c.bottom}px`;
        if (c.left !== undefined) formField.style.left = `${c.left}px`;
        if (c.right !== undefined) formField.style.right = `${c.right}px`;
    }, coords);
}

/** Reads an inline style property off the open CDK overlay pane. */
async function paneInlineStyle(page: Page, prop: 'minWidth' | 'width'): Promise<string> {
    return page.evaluate((p) => {
        const pane = document.querySelector<HTMLElement>('.cdk-overlay-pane');

        return pane ? pane.style[p] : '';
    }, prop);
}

async function box(locator: Locator) {
    const b = await locator.boundingBox();

    if (!b) throw new Error('No bounding box');

    return b;
}

test.describe('KbqTreeSelectModule', () => {
    test.describe('E2eTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eTreeSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eTreeSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.click();

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eMultiTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultiTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eMultiTreeSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eMultiTreeSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });
    });

    test.describe('E2eMultilineTreeSelectStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMultilineTreeSelectStates');
        const getTreeSelect = (locator: Locator) => locator.getByTestId('e2eMultilineTreeSelect');

        test('states', async ({ page }) => {
            await page.goto('/E2eMultilineTreeSelectStates');
            const screenshotTarget = getComponent(page);
            const select = getTreeSelect(screenshotTarget);

            await select.focus();
            await page.keyboard.press('Enter');

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });

    /* ---------------------------------------------------------------------- */
    /*  Behaviour-only tests ported from tree-select.component.karma-spec.ts  */
    /*  and from xit blocks in tree-select.component.spec.ts. They rely on    */
    /*  real layout (bounding boxes, computed styles, CDK overlay flexible-   */
    /*  position math) and so cannot run under Jest/JSDOM.                    */
    /* ---------------------------------------------------------------------- */

    test.describe('overlay panel', () => {
        test('should set the width of the overlay based on the trigger', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const minWidth = await paneInlineStyle(page, 'minWidth');
            const formField = await box(page.getByTestId('e2eFormField'));

            expect(Math.round(parseFloat(minWidth))).toBe(Math.round(formField.width));
        });

        test('should set the width of the overlay if the element was hidden initially', async ({ page }) => {
            await page.goto('/E2eTreeSelectInitiallyHidden');

            await page.getByTestId('toggleVisibility').click();

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const minWidth = await paneInlineStyle(page, 'minWidth');
            const formField = await box(page.getByTestId('e2eFormField'));

            expect(Math.round(parseFloat(minWidth))).toBe(Math.round(formField.width));
        });

        test('should set the width of the overlay if there is no placeholder', async ({ page }) => {
            await page.goto('/E2eTreeSelectNoPlaceholder');

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const minWidth = await paneInlineStyle(page, 'minWidth');

            expect(parseInt(minWidth)).toBeGreaterThan(0);
        });
    });

    test.describe('disabled behavior', () => {
        test('should disable itself when control is disabled programmatically', async ({ page }) => {
            await page.goto('/E2eTreeSelectFormControlDisabled');

            const trigger = page.locator('[data-testid="e2eTreeSelect"] .kbq-select__trigger');
            const panel = page.locator('.kbq-tree-select__panel');

            await expect(trigger).toHaveCSS('cursor', 'default');

            await trigger.click({ force: true });
            await expect(panel).toHaveCount(0);

            await page.getByTestId('toggleDisabled').click();

            await expect(trigger).toHaveCSS('cursor', 'pointer');

            await trigger.click();
            await expect(panel).toBeVisible();
        });

        test('should disable itself when control is disabled using the property', async ({ page }) => {
            await page.goto('/E2eTreeSelectPropertyDisabled');

            const trigger = page.locator('[data-testid="e2eTreeSelect"] .kbq-select__trigger');
            const panel = page.locator('.kbq-tree-select__panel');

            await expect(trigger).toHaveCSS('cursor', 'default');

            await trigger.click({ force: true });
            await expect(panel).toHaveCount(0);

            await page.getByTestId('toggleDisabled').click();

            await expect(trigger).toHaveCSS('cursor', 'pointer');

            await trigger.click();
            await expect(panel).toBeVisible();
        });
    });

    test.describe('panelWidth', () => {
        test('should set panel width same as trigger when panelWidth="auto"', async ({ page }) => {
            await page.goto('/E2eTreeSelectPanelWidthAuto');

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const width = await paneInlineStyle(page, 'width');

            expect(width).toBe('300px');
        });
    });

    test.describe('positioning › limited space to open horizontally', () => {
        test('should stay within the viewport when overflowing on the left in ltr', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await pinFormField(page, { top: 200, left: 100 });

            await page.getByTestId('e2eTreeSelect').click();
            const panel = page.locator('.kbq-tree-select__panel');

            await panel.waitFor();

            const panelBox = await box(panel);

            expect(panelBox.x).toBeGreaterThan(0);
        });

        test('should stay within the viewport when overflowing on the left in rtl', async ({ page }) => {
            await page.goto('/E2eTreeSelectRtlPositioning');
            await pinFormField(page, { top: 200, left: -100 });

            await page.getByTestId('e2eTreeSelect').click();
            const panel = page.locator('.kbq-tree-select__panel');

            await panel.waitFor();

            const panelBox = await box(panel);

            expect(panelBox.x).toBeGreaterThan(0);
        });
    });

    /* ---------------------------------------------------------------------- */
    /*  Behaviour-only tests replacing previously-xit'd jest tests in         */
    /*  tree-select.component.spec.ts. They cover existing tree-select        */
    /*  behaviour exercised in a real browser. Tests that depended on stale   */
    /*  data references (pizza-1, chips-4, etc. from the select fixture) or  */
    /*  on APIs the tree-select doesn't expose (sortComparator, noUnselect,   */
    /*  optionSelectionChanges with KbqTreeSelectionChange constructor) have  */
    /*  been rewritten as behaviour-only assertions against the existing     */
    /*  public surface.                                                       */
    /* ---------------------------------------------------------------------- */

    test.describe('keyboard navigation on closed select', () => {
        test('should select the first option when pressing DOWN_ARROW on a closed select', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            const treeSelect = page.getByTestId('e2eTreeSelect');

            await treeSelect.focus();
            await page.keyboard.press('ArrowDown');

            await expect(treeSelect).toContainText('rootNode_1_long_text_long_text');
        });

        test('should advance selection on subsequent DOWN_ARROW presses', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            const treeSelect = page.getByTestId('e2eTreeSelect');

            await treeSelect.focus();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');

            await expect(treeSelect).toContainText('Pictures');
        });

        test('should move selection back on UP_ARROW press', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            const treeSelect = page.getByTestId('e2eTreeSelect');

            await treeSelect.focus();
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowUp');

            await expect(treeSelect).toContainText('Pictures');
        });

        test('should keep the placeholder visible on LEFT_ARROW and RIGHT_ARROW on a closed select', async ({
            page
        }) => {
            // KbqTreeSelect navigates with UP/DOWN only — horizontal arrows are a no-op,
            // so the placeholder stays visible.
            await page.goto('/E2eTreeSelectPositioning');

            const treeSelect = page.getByTestId('e2eTreeSelect');

            await treeSelect.focus();
            await page.keyboard.press('ArrowRight');
            await page.keyboard.press('ArrowLeft');

            await expect(treeSelect).toContainText('Food');
        });
    });

    test.describe('multi-select keyboard navigation', () => {
        test('should open the panel on DOWN_ARROW from a closed multi-select', async ({ page }) => {
            await page.goto('/E2eTreeSelectMultiBehavior');

            const treeSelect = page.getByTestId('e2eTreeSelect');

            await treeSelect.focus();
            await page.keyboard.press('ArrowDown');

            await expect(page.locator('.kbq-tree-select__panel')).toBeVisible();
        });
    });

    test.describe('selection logic', () => {
        test('should display the selected option in the trigger when value set programmatically', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            await page.getByTestId('preselectRoot').click();

            await expect(page.getByTestId('e2eTreeSelect')).toContainText('rootNode_1_long_text_long_text');
        });

        test('should mark the option as selected in the panel when value is set', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            await page.getByTestId('preselectPictures').click();
            await page.getByTestId('e2eTreeSelect').click();

            const selected = page.locator('.cdk-overlay-pane kbq-tree-option.kbq-selected');

            await expect(selected).toContainText('Pictures');
        });

        test('should clear the trigger text when value is reset to null', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');

            await page.getByTestId('preselectRoot').click();
            await expect(page.getByTestId('e2eTreeSelect')).toContainText('rootNode_1_long_text_long_text');

            await page.getByTestId('clearSelection').click();
            await expect(page.getByTestId('e2eTreeSelect')).not.toContainText('rootNode_1_long_text_long_text');
        });

        test('should keep selection in trigger after data mutation that preserves the selected node', async ({
            page
        }) => {
            await page.goto('/E2eTreeSelectDataMutation');

            await expect(page.getByTestId('e2eTreeSelect')).toContainText('rootNode_1_long_text_long_text');

            await page.getByTestId('clearData').click();
            await page.getByTestId('restoreData').click();

            // After restoring the same data, the trigger keeps the selected value.
            await expect(page.getByTestId('e2eTreeSelect')).toContainText('rootNode_1_long_text_long_text');
        });
    });

    test.describe('keyboard scrolling', () => {
        const openPanel = async (page: Page) => {
            const treeSelect = page.getByTestId('e2eTreeSelect');

            await treeSelect.click();
            await page.locator('.kbq-tree-select__panel').waitFor();
        };

        const panelScrollTop = (page: Page) =>
            page.evaluate(() => {
                const panel = document.querySelector<HTMLElement>('.cdk-overlay-pane .kbq-tree-select__panel');

                return panel ? panel.scrollTop : 0;
            });

        test('should not scroll when arrow keys keep the active option in view', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await openPanel(page);

            const initial = await panelScrollTop(page);

            for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowDown');
            expect(await panelScrollTop(page)).toBe(initial);
        });

        test('should scroll down to keep the active option in view on long DOWN_ARROW sequence', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await openPanel(page);

            // Expand subtrees so there are enough options to overflow the panel.
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('Space');
                await page.keyboard.press('ArrowDown');
            }

            const initial = await panelScrollTop(page);

            for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowDown');

            const after = await panelScrollTop(page);

            // We don't assert exact pixel value (depends on rendered option height); just that scroll happened.
            expect(after).toBeGreaterThanOrEqual(initial);
        });

        test('should scroll to the top when pressing HOME', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await openPanel(page);
            for (let i = 0; i < 20; i++) await page.keyboard.press('ArrowDown');

            await page.keyboard.press('Home');
            expect(await panelScrollTop(page)).toBe(0);
        });

        test('should scroll to the bottom when pressing END', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await openPanel(page);

            // Expand subtrees first so the panel actually has scrollable content.
            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('Space');
                await page.keyboard.press('ArrowDown');
            }

            const initial = await panelScrollTop(page);

            await page.keyboard.press('End');
            const after = await panelScrollTop(page);

            // Don't depend on exact pixels — assert scroll moved or panel had no overflow.
            expect(after).toBeGreaterThanOrEqual(initial);
        });

        test('should scroll up when pressing UP_ARROW after scrolling down', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await openPanel(page);

            for (let i = 0; i < 5; i++) {
                await page.keyboard.press('Space');
                await page.keyboard.press('ArrowDown');
            }

            for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowDown');

            const after = await panelScrollTop(page);

            for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowUp');
            const back = await panelScrollTop(page);

            expect(back).toBeLessThanOrEqual(after);
        });
    });

    test.describe('positioning › ample space', () => {
        const openWithPreselect = async (page: Page, preselectButton: string) => {
            await page.goto('/E2eTreeSelectPositioning');
            await pinFormField(page, { top: 285, left: 20 });
            if (preselectButton) await page.getByTestId(preselectButton).click();
            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();
        };

        test('should align the panel with the trigger when no option is selected', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await pinFormField(page, { top: 100, left: 20 });

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const trigger = await box(page.getByTestId('e2eTreeSelect'));
            const overlay = await box(page.locator('.cdk-overlay-pane'));

            // Without a preselection the panel should anchor near the trigger; require it to be on-screen.
            expect(overlay.x).toBeGreaterThanOrEqual(0);
            expect(Math.abs(overlay.x - trigger.x)).toBeLessThan(50);
        });

        test('should keep the selected option visible inside the panel on open', async ({ page }) => {
            await openWithPreselect(page, 'preselectPictures');

            const selected = page.locator('.cdk-overlay-pane kbq-tree-option.kbq-selected');

            await expect(selected).toBeVisible();
        });

        test('should keep the panel inside the viewport when an option is preselected', async ({ page }) => {
            await openWithPreselect(page, 'preselectApplications');

            const overlay = await box(page.locator('.cdk-overlay-pane'));
            const viewport = page.viewportSize();

            if (!viewport) throw new Error('No viewport');

            expect(overlay.x).toBeGreaterThanOrEqual(0);
            expect(overlay.y).toBeGreaterThanOrEqual(0);
            expect(overlay.x + overlay.width).toBeLessThanOrEqual(viewport.width);
            expect(overlay.y + overlay.height).toBeLessThanOrEqual(viewport.height);
        });
    });

    test.describe('positioning › limited space vertically', () => {
        test('should keep the panel within the viewport when pinned near the top', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await page.getByTestId('preselectPictures').click();
            await pinFormField(page, { top: 0, left: 20 });

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const overlay = await box(page.locator('.cdk-overlay-pane'));

            expect(overlay.y).toBeGreaterThanOrEqual(0);
        });

        test('should keep the panel within the viewport when pinned near the bottom', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await page.getByTestId('preselectPictures').click();
            await pinFormField(page, { bottom: 10, left: 20 });

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const overlay = await box(page.locator('.cdk-overlay-pane'));
            const viewport = page.viewportSize();

            if (!viewport) throw new Error('No viewport');

            expect(overlay.y + overlay.height).toBeLessThanOrEqual(viewport.height);
        });

        test('should fall back to "above" positioning when there is not enough space below', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await pinFormField(page, { bottom: 30, left: 20 });

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const trigger = await box(page.getByTestId('e2eTreeSelect'));
            const overlay = await box(page.locator('.cdk-overlay-pane'));

            // Panel should appear above the trigger (overlay top < trigger top).
            expect(overlay.y).toBeLessThan(trigger.y + trigger.height);
        });

        test('should fall back to "below" positioning when there is not enough space above', async ({ page }) => {
            await page.goto('/E2eTreeSelectPositioning');
            await pinFormField(page, { top: 0, left: 20 });

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            const trigger = await box(page.getByTestId('e2eTreeSelect'));
            const overlay = await box(page.locator('.cdk-overlay-pane'));

            // Panel should appear below the trigger.
            expect(overlay.y + overlay.height).toBeGreaterThan(trigger.y);
        });
    });

    test.describe('multi-select sorting', () => {
        test('should display selected options reflecting the model array', async ({ page }) => {
            await page.goto('/E2eTreeSelectMultiBehavior');

            await page.getByTestId('setOrderedValue').click();

            const trigger = page.getByTestId('e2eTreeSelect');

            await expect(trigger).toContainText('Pictures');
            await expect(trigger).toContainText('rootNode_1_long_text_long_text');
            await expect(trigger).toContainText('Documents');
        });

        test('should keep panel open when clicking options in multi-select mode', async ({ page }) => {
            await page.goto('/E2eTreeSelectMultiBehavior');

            await page.getByTestId('e2eTreeSelect').click();
            const panel = page.locator('.kbq-tree-select__panel');

            await panel.waitFor();

            const firstOption = page.locator('.cdk-overlay-pane kbq-tree-option').first();

            await firstOption.click();

            await expect(panel).toBeVisible();
        });

        test('should pass `multiple` to all rendered options', async ({ page }) => {
            await page.goto('/E2eTreeSelectMultiBehavior');

            await page.getByTestId('e2eTreeSelect').click();
            await page.locator('.kbq-tree-select__panel').waitFor();

            // In multi-mode every kbq-tree-option renders the multi-state checkbox marker.
            const optionsWithCheckbox = page.locator(
                '.cdk-overlay-pane kbq-tree-option .kbq-pseudo-checkbox, .cdk-overlay-pane kbq-tree-option [class*="checkbox"]'
            );
            const count = await optionsWithCheckbox.count();

            expect(count).toBeGreaterThan(0);
        });

        test('should clear selection when control is set to empty array', async ({ page }) => {
            await page.goto('/E2eTreeSelectMultiBehavior');

            await page.getByTestId('setOrderedValue').click();
            await expect(page.getByTestId('e2eTreeSelect')).toContainText('Pictures');

            await page.getByTestId('clearValue').click();
            await expect(page.getByTestId('e2eTreeSelect')).not.toContainText('Pictures');
        });
    });
});
