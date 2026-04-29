import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

// Mirrors NESTED_PANEL_LEFT_PADDING / NESTED_PANEL_TOP_PADDING from dropdown-trigger.directive.ts.
// Inlined because the playwright runner is Node-only and cannot load the Angular bundle.
const NESTED_PANEL_LEFT_PADDING = 8;
const NESTED_PANEL_TOP_PADDING = 4;

// Serial: pixel-exact CDK overlay positioning flakes when these tests run in parallel browser contexts.
test.describe.configure({ mode: 'serial' });

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
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowDown');
            await page.keyboard.press('ArrowRight');
            await getSubmenu2ItemWithIcon(page).hover();
            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(component).toHaveScreenshot('01-dark.png');
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
});
