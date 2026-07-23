import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

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

test.describe('KbqAutocompleteModule', () => {
    test.describe('E2eAutocompleteStates', () => {
        const getComponent = (page: Page): Locator => page.getByTestId('e2eAutocompleteStates');
        const getAutocompleteInput = (page: Page): Locator => page.getByTestId('e2eAutocompleteInput');

        test('states', async ({ page }) => {
            await page.goto('/E2eAutocompleteStates');
            await getAutocompleteInput(page).focus();
            await page.keyboard.press('ArrowDown');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('Fallback positions', () => {
        const getInput = (page: Page) => page.getByTestId('e2eAutocompleteInput');
        const getPanel = (page: Page) => page.locator('.kbq-autocomplete-panel');

        test('falls back to above position when there is no room below', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 400 });
            await page.goto('/E2eAutocompleteFallbackPosition');

            const input = getInput(page);

            await input.click();

            const panel = getPanel(page);

            await expect(panel).toBeVisible();

            const inputBox = await input.boundingBox();
            const panelBox = await panel.boundingBox();

            expect(inputBox).not.toBeNull();
            expect(panelBox).not.toBeNull();
            expect(Math.floor(panelBox!.y + panelBox!.height)).toBeLessThanOrEqual(Math.ceil(inputBox!.y));
        });

        test('panel grows when the number of results increases', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            await page.goto('/E2eAutocompleteExpandOnResults');

            const input = getInput(page);
            const panel = getPanel(page);

            await input.click();
            await expect(panel).toBeVisible();

            const initialBox = await panel.boundingBox();

            expect(initialBox).not.toBeNull();
            expect(initialBox!.height).toBeGreaterThan(0);

            await input.fill('Option');
            await expect.poll(async () => (await panel.boundingBox())?.height ?? 0).toBeGreaterThan(initialBox!.height);
        });
    });

    test.describe('trigger↔panel gap is not click-through', () => {
        // The overlay's origin is the form-field's connection container (KbqFormField.getConnectedOverlayOrigin(),
        // via KbqAutocompleteTrigger.getConnectedElement()), not the raw <input>, so that's the "trigger" here.
        const triggerSelector = '[data-testid="e2eFormField"] .kbq-form-field__container';
        const panelSelector = '.kbq-autocomplete-panel';
        const getInput = (page: Page) => page.getByTestId('e2eAutocompleteInput');

        test('below: the gap is covered by the pane, not real panel content', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            await page.goto('/E2eAutocompleteExpandOnResults');
            // Pin near the top so the field opens straight below the trigger regardless of where it would
            // otherwise land in normal document flow.
            await page.evaluate(() => {
                const formField = document.querySelector<HTMLElement>('[data-testid="e2eFormField"]');

                formField!.style.position = 'fixed';
                formField!.style.top = '16px';
                formField!.style.left = '16px';
            });

            await getInput(page).click();
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
            // Same route/viewport as the "falls back to above position" test above — bottom-anchored input
            // with no room below, so the panel flips above.
            await page.setViewportSize({ width: 800, height: 400 });
            await page.goto('/E2eAutocompleteFallbackPosition');

            await getInput(page).click();

            const panel = page.locator(panelSelector);

            await expect(panel).toBeVisible();

            // Sanity check the flip actually happened, otherwise this would silently re-test "below".
            const triggerBox = await page.locator(triggerSelector).boundingBox();
            const panelBox = await panel.boundingBox();

            expect(triggerBox).not.toBeNull();
            expect(panelBox).not.toBeNull();
            expect(Math.floor(panelBox!.y + panelBox!.height)).toBeLessThanOrEqual(Math.ceil(triggerBox!.y));

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

    test.describe('Scroll strategy: close', () => {
        const getInput = (page: Page) => page.getByTestId('e2eAutocompleteInput');
        const getPanel = (page: Page) => page.locator('.kbq-autocomplete-panel');

        test('closes the panel when the page scrolls', async ({ page }) => {
            await page.setViewportSize({ width: 800, height: 600 });
            await page.goto('/E2eAutocompleteScrollClose');

            const input = getInput(page);
            const panel = getPanel(page);

            await input.click();
            await expect(panel).toBeVisible();

            await page.evaluate(() => window.scrollBy(0, 200));

            await expect(panel).toBeHidden();
        });
    });
});
