import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

/** Sets `position: fixed` and `top`/`bottom`/`left` on the form field so the trigger lands at a known viewport spot. */
async function pinFormField(page: Page, coords: { top?: number; bottom?: number; left?: number }): Promise<void> {
    await page.evaluate((c) => {
        const formField = document.querySelector<HTMLElement>('[data-testid="e2eFormField"]');

        if (!formField) return;

        formField.style.position = 'fixed';
        if (c.top !== undefined) formField.style.top = `${c.top}px`;
        if (c.bottom !== undefined) formField.style.bottom = `${c.bottom}px`;
        if (c.left !== undefined) formField.style.left = `${c.left}px`;
    }, coords);
}

/**
 * Point-probes the trigger↔panel gap (2px past the trigger's edge, on the side the panel opens toward) and
 * reports whether it resolves to the overlay pane (gap covered by transparent padding, not click-through)
 * and, separately, whether it lands inside real panel content — a probe that only hits the pane and NOT
 * panel content proves the gap is genuinely padding, not just a coincidentally-zero physical gap.
 */
async function probeTriggerPanelGap(
    page: Page,
    triggerSelector: string,
    panelSelector: string,
    edge: 'bottom' | 'top'
): Promise<{ hitsPane: boolean; hitsPanelContent: boolean }> {
    return page.evaluate(
        ({ triggerSelector, panelSelector, edge }) => {
            const trigger = document.querySelector<HTMLElement>(triggerSelector)!.getBoundingClientRect();
            // Near the trigger's start edge, not its horizontal center: the panel is left-aligned to the
            // trigger (originX/overlayX: 'start') and can be much narrower than the trigger itself when the
            // field has no explicit width, so a center probe can miss it entirely.
            const x = Math.round(trigger.left + 8);
            const y = edge === 'bottom' ? Math.round(trigger.bottom + 2) : Math.round(trigger.top - 2);
            const el = document.elementFromPoint(x, y);

            return {
                hitsPane: !!el?.closest('.cdk-overlay-pane'),
                hitsPanelContent: !!el?.closest(panelSelector)
            };
        },
        { triggerSelector, panelSelector, edge }
    );
}

test.describe('KbqDatepickerModule', () => {
    test.describe('E2eDatepickerStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eDatepickerStates');
        const getScreenshotTarget = (locator: Locator) => locator.getByTestId('e2eScreenshotTarget');

        test('states', async ({ page }) => {
            await page.goto('/E2eDatepickerStates');
            await page.getByTestId('e2eDatepickerToggle').click();
            const locator = getComponent(page);

            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('trigger↔panel gap is not click-through', () => {
        // The overlay's origin is the form-field's connection container (KbqFormField.getConnectedOverlayOrigin()),
        // not the raw <input>, so that's what "trigger" means for the gap probe here.
        const triggerSelector = '[data-testid="e2eFormField"] .kbq-form-field__container';
        const panelSelector = '.kbq-datepicker__content';

        test('below: the gap is covered by the pane, not real panel content', async ({ page }) => {
            await page.goto('/E2eDatepickerPositioning');
            // Pin near the top so the datepicker opens straight below the trigger.
            await pinFormField(page, { top: 60, left: 20 });

            await page.getByTestId('e2eDatepickerToggle').click();
            await page.locator(panelSelector).waitFor();

            const { hitsPane, hitsPanelContent } = await probeTriggerPanelGap(
                page,
                triggerSelector,
                panelSelector,
                'bottom'
            );

            // A point 2px below the trigger's bottom edge — the former physical dead gap.
            // It must now resolve to the overlay pane (which covers it via transparent padding) but NOT to
            // real panel content, so it can no longer be clicked through onto the content beneath the panel
            // AND this can't pass merely because offsetY:0 collapsed the gap to nothing (no padding at all).
            expect(hitsPane).toBe(true);
            expect(hitsPanelContent).toBe(false);
        });

        test('above (flipped): the gap is covered by the pane, not real panel content', async ({ page }) => {
            await page.goto('/E2eDatepickerPositioning');
            // Not enough room below the trigger to fit the calendar, so it flips above.
            await pinFormField(page, { bottom: 40, left: 20 });

            await page.getByTestId('e2eDatepickerToggle').click();
            await page.locator(panelSelector).waitFor();

            // Sanity check the flip actually happened, otherwise this would silently re-test "below".
            const triggerBox = await page.locator(triggerSelector).boundingBox();
            const panelBox = await page.locator('.cdk-overlay-pane').boundingBox();

            expect(triggerBox).not.toBeNull();
            expect(panelBox).not.toBeNull();
            expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(triggerBox!.y + 2);

            const { hitsPane, hitsPanelContent } = await probeTriggerPanelGap(
                page,
                triggerSelector,
                panelSelector,
                'top'
            );

            expect(hitsPane).toBe(true);
            expect(hitsPanelContent).toBe(false);
        });
    });
});
