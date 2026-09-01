import { expect, Locator, Page, test } from '@playwright/test';
import { e2eDisableResizeObserver, e2eEnableDarkTheme, e2eExpectNoScrollbarAfterFlash } from '../../e2e/utils';

// Mirrors NESTED_PANEL_LEFT_PADDING / NESTED_PANEL_TOP_PADDING from dropdown-trigger.directive.ts.
// Inlined because the playwright runner is Node-only and cannot load the Angular bundle.
const NESTED_PANEL_LEFT_PADDING = 8;
const NESTED_PANEL_TOP_PADDING = 4;

test.describe('KbqDropdownModule', () => {
    test.describe('E2eDropdownStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDropdownStates');
        const getDropdownTrigger = (page: Page) => page.getByTestId('e2eDropdownTrigger');
        const getSubmenuTrigger = (page: Page) => page.getByTestId('e2eSubmenuTrigger');
        const getSubmenu2ItemWithIcon = (page: Page) => page.getByTestId('e2eSubmenu2ItemWithIcon');

        test('states', async ({ page }) => {
            await page.goto('/E2eDropdownStates');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getDropdownTrigger(page).click();
            await getSubmenuTrigger(page).hover();
            // Opening by mouse/hover no longer highlights the first item, so the submenu starts with
            // no active item. The first ArrowDown highlights its first item; two more reach the nested
            // trigger ("Item with icon"), which ArrowRight then opens.
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowRight');
            await getSubmenu2ItemWithIcon(page).hover();
            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eDropdownItemAction', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDropdownItemActionStates');
        const getTrigger = (page: Page) => page.getByTestId('e2eDropdownItemActionTrigger');

        test('states', async ({ page }) => {
            await page.goto('/E2eDropdownItemAction');
            const component = getComponent(page);

            await component.scrollIntoViewIfNeeded();
            await getTrigger(page).click();
            await expect(component).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('02-dark.png');
        });

        test('should display tooltip for a truncated item that also has an action', async ({ page }) => {
            await page.goto('/E2eDropdownItemAction');
            await getTrigger(page).click();
            await page.getByTestId('e2eDropdownItemActionTruncated').hover();

            await expect(page.locator('.kbq-tooltip')).toBeVisible();
        });
    });

    test.describe('nested dropdown', () => {
        const openNestedScenario = async (page: Page, scenarioId: string) => {
            await page.locator(`#${scenarioId}-trigger`).click();
            const levelOneTrigger = page.locator(`#${scenarioId}-level-one`);

            await expect(levelOneTrigger).toBeVisible();
            await levelOneTrigger.click();
            await expect(page.locator('.cdk-overlay-pane').nth(1).locator('.kbq-dropdown__panel')).toBeVisible();

            return levelOneTrigger;
        };
        const getLevelOnePanel = (page: Page): Locator => page.locator('.cdk-overlay-pane').nth(1);

        test('should position the nested dropdown to the right edge of the trigger in ltr', async ({ page }) => {
            await page.goto('/E2eDropdownNestedLtr');
            const trigger = await openNestedScenario(page, 'dropdown_nested_ltr_default');

            const triggerBox = (await trigger.boundingBox())!;
            const panelBox = (await getLevelOnePanel(page).boundingBox())!;

            expect(Math.round(triggerBox.x + triggerBox.width)).toBe(
                Math.round(panelBox.x) + NESTED_PANEL_LEFT_PADDING
            );
            expect(Math.round(triggerBox.y)).toBe(Math.round(panelBox.y) + NESTED_PANEL_TOP_PADDING);
        });

        test('should fall back to aligning to the left edge of the trigger in ltr', async ({ page }) => {
            await page.goto('/E2eDropdownNestedLtr');
            const trigger = await openNestedScenario(page, 'dropdown_nested_ltr_fallback');

            const triggerBox = (await trigger.boundingBox())!;
            const panelBox = (await getLevelOnePanel(page).boundingBox())!;

            expect(Math.round(triggerBox.x)).toBe(Math.round(panelBox.x + panelBox.width) - NESTED_PANEL_LEFT_PADDING);
            expect(Math.round(triggerBox.y)).toBe(Math.round(panelBox.y) + NESTED_PANEL_TOP_PADDING);
        });

        test('should position the nested dropdown to the left edge of the trigger in rtl', async ({ page }) => {
            await page.goto('/E2eDropdownNestedRtl');
            const trigger = await openNestedScenario(page, 'dropdown_nested_rtl_default');

            const triggerBox = (await trigger.boundingBox())!;
            const panelBox = (await getLevelOnePanel(page).boundingBox())!;

            // Math.floor (not round) preserved from the karma original — the half-pixel boundary lands here.
            expect(Math.floor(triggerBox.x)).toBe(Math.floor(panelBox.x + panelBox.width) + NESTED_PANEL_LEFT_PADDING);
            expect(Math.floor(triggerBox.y)).toBe(Math.floor(panelBox.y) + NESTED_PANEL_TOP_PADDING);
        });

        test('should fall back to aligning to the right edge of the trigger in rtl', async ({ page }) => {
            await page.goto('/E2eDropdownNestedRtl');
            const trigger = await openNestedScenario(page, 'dropdown_nested_rtl_fallback');

            const triggerBox = (await trigger.boundingBox())!;
            const panelBox = (await getLevelOnePanel(page).boundingBox())!;

            expect(Math.round(triggerBox.x + triggerBox.width)).toBe(
                Math.round(panelBox.x) - NESTED_PANEL_LEFT_PADDING
            );
            expect(Math.round(triggerBox.y)).toBe(Math.round(panelBox.y) + NESTED_PANEL_TOP_PADDING);
        });
    });

    test.describe('with KbqTitle directive', () => {
        test('should display tooltip if text is overflown', async ({ page }) => {
            await page.goto('/E2eDropdownTitleOverflow');
            await page.getByTestId('dropdown_title_overflow_trigger').click();
            await page.getByTestId('dropdown_title_overflow_plain').hover();

            await expect(page.locator('.kbq-tooltip')).toBeVisible();
        });

        test('should display tooltip if text is complex and overflown', async ({ page }) => {
            await page.goto('/E2eDropdownTitleOverflow');
            await page.getByTestId('dropdown_title_overflow_trigger').click();
            await page.getByTestId('dropdown_title_overflow_complex').hover();

            await expect(page.locator('.kbq-tooltip')).toBeVisible();
        });
    });

    test.describe('E2eDropdownScrollbar', () => {
        const getTrigger = (page: Page) => page.getByTestId('e2eDropdownScrollbarTrigger');
        const getPanel = (page: Page) => page.locator('.kbq-dropdown__panel');
        const getTrack = (page: Page) => getPanel(page).locator('kbq-scrollbar-track');
        const getVerticalThumb = (page: Page) =>
            getPanel(page).locator('.kbq-scrollbar-track__bar_vertical .kbq-scrollbar-track__thumb');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eDropdownScrollbar');
            await page.setViewportSize({ width: page.viewportSize()!.width, height: 500 });
            await getTrigger(page).click();
            await expect(getPanel(page)).toBeVisible();
        });

        test('flashes the track on open, then fades it', async ({ page }) => {
            const track = getTrack(page);

            await expect(track).toHaveCSS('opacity', '1');
            await expect(track).toHaveCSS('opacity', '0');
        });

        test('hides the native scrollbar and reveals the custom track on hover', async ({ page }) => {
            await expect(getPanel(page)).toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);

            const track = getTrack(page);

            await expect(track).toBeAttached();
            await expect(track).toHaveCSS('opacity', '0');

            await getPanel(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('clicking the scrollbar thumb does not close the dropdown', async ({ page }) => {
            await getPanel(page).hover();
            await getVerticalThumb(page).click();

            await expect(getPanel(page)).toBeVisible();
        });

        test('dragging the scrollbar thumb and releasing over an item does not close the dropdown', async ({
            page
        }) => {
            await getPanel(page).hover();

            const thumb = getVerticalThumb(page);

            await expect(thumb).toBeVisible();

            const box = (await thumb.boundingBox())!;

            await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
            await page.mouse.down();
            await page.mouse.move(box.x - 40, box.y + 120, { steps: 10 });
            await page.mouse.up();

            await expect(getPanel(page)).toBeVisible();
        });

        test('renders the custom scrollbar', async ({ page }) => {
            const track = getTrack(page);

            await getPanel(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
            await expect(getPanel(page)).toHaveScreenshot('03-light.png');
        });

        test('scrolling the panel content does not reposition the overlay', async ({ page }) => {
            const triggerMeasured = await page.evaluate(() => {
                const trigger = document.querySelector('[data-testid="e2eDropdownScrollbarTrigger"]')!;
                const panel = document.querySelector('.kbq-dropdown__panel') as HTMLElement;
                const original = Element.prototype.getBoundingClientRect;
                let count = 0;

                Element.prototype.getBoundingClientRect = function (this: Element) {
                    if (this === trigger) {
                        count++;
                    }

                    return original.apply(this);
                };

                try {
                    panel.scrollTop = 50;
                    panel.dispatchEvent(new Event('scroll'));
                } finally {
                    Element.prototype.getBoundingClientRect = original;
                }

                return count;
            });

            expect(triggerMeasured).toBe(0);
        });
    });

    test.describe('E2eDropdownScrollbarNoOverflow', () => {
        const getPanel = (page: Page) => page.locator('.kbq-dropdown__panel');

        test('a short dropdown with a footer stays uncollapsed and shows no scrollbar', async ({ page }) => {
            await e2eDisableResizeObserver(page);
            await page.goto('/E2eDropdownScrollbarNoOverflow');
            await page.getByTestId('e2eDropdownNoOverflowTrigger').click();

            const panel = getPanel(page);

            await e2eExpectNoScrollbarAfterFlash(panel);
        });
    });
});
