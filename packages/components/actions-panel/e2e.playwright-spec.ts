import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

// Spelled out rather than imported from the component package: a Playwright spec runs in Node, and pulling in an
// Angular module from there fails on the missing JIT compiler.
const actionsPanelOverlay = '.cdk-overlay-pane.kbq-actions-panel-overlay';
const scopedOverlayContainer = '.kbq-actions-panel-scoped-overlay-container';
const globalOverlayContainer = 'body > .cdk-overlay-container';

/**
 * Resolves once the element has a bounding box that stopped changing, so that geometry is read after the panel's
 * entrance animation rather than somewhere along it.
 */
const boundingBoxAtRest = async (locator: Locator) => {
    let previous = '';

    await expect
        .poll(async () => {
            const current = JSON.stringify(await locator.boundingBox());
            const settled = current !== 'null' && current === previous;

            previous = current;

            return settled;
        })
        .toBe(true);

    return (await locator.boundingBox())!;
};

test.describe('KbqActionsPanel', () => {
    test.describe('E2eActionsPanelWithOverlayContainer', () => {
        // Tall enough for the whole page: a target taller than the viewport is captured by growing the viewport,
        // which moves the page down under the resting pointer and hovers a dropdown item.
        test.use({ viewport: { width: 650, height: 240 } });

        const getComponent = (page: Page) => page.getByTestId('e2eActionsPanelWithOverlayContainer');
        const getOpenButton = (locator: Locator) => locator.getByTestId('e2eActionsPanelOpenButton');
        const getOverlayContainer = (locator: Locator) => locator.getByTestId('e2eActionsPanelOverlayContainer');
        const getScreenshotTarget = (locator: Locator) => getOverlayContainer(locator);
        const getOverflowItemsResultButton = (page: Page) =>
            page.getByTestId('e2eActionsPanelOverflowItemsResultButton');

        test('with custom container', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);

            await getOpenButton(locator).click();
            await expect(getScreenshotTarget(locator)).toHaveScreenshot('1-light.png');
        });

        test('items overflow and dropdown', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);
            const screenshotTarget = getScreenshotTarget(locator);

            await getOpenButton(locator).click();
            await getOverlayContainer(locator).evaluate(({ style }) => (style.width = '650px'));
            // The overflow follows the width through a ResizeObserver: open the dropdown once only the two actions
            // that no longer fit are hidden, rather than while it still lists the ones the wider panel shows again.
            await expect(getOverlayContainer(locator).locator('.kbq-overflow-item-hidden')).toHaveCount(2);
            await getOverflowItemsResultButton(page).click();
            // Opened by mouse, the panel takes the focus and no item is highlighted.
            await expect(page.locator('.kbq-dropdown-item')).toHaveText(['Action 5', 'Action 6']);
            await expect(page.locator('.kbq-dropdown-item.cdk-focused')).toHaveCount(0);
            await expect(screenshotTarget).toHaveScreenshot('2-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('2-dark.png');
        });

        test('renders inside the custom container and leaves the global one empty', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);

            await getOpenButton(locator).click();

            await expect(getOverlayContainer(locator).locator(actionsPanelOverlay)).toHaveCount(1);
            await expect(page.locator(`${globalOverlayContainer} ${actionsPanelOverlay}`)).toHaveCount(0);
        });

        test('pins the panel to the bottom of the custom container', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);
            const panel = getOverlayContainer(locator).locator(actionsPanelOverlay);

            await getOpenButton(locator).click();
            await expect(panel).toBeVisible();

            const panelBox = await boundingBoxAtRest(panel);
            const containerBox = (await getOverlayContainer(locator).boundingBox())!;

            expect(panelBox.x).toBeGreaterThanOrEqual(containerBox.x);
            expect(panelBox.x + panelBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width);
            expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(containerBox.y + containerBox.height);
            // Bottom-aligned rather than floating somewhere in the middle of the container.
            expect(containerBox.y + containerBox.height - (panelBox.y + panelBox.height)).toBeLessThan(32);
        });

        test('promotes a static custom container to a containing block and restores it on close', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);
            const overlayContainer = getOverlayContainer(locator);

            await expect(overlayContainer).toHaveCSS('position', 'static');

            await getOpenButton(locator).click();
            await expect(overlayContainer).toHaveCSS('position', 'relative');

            await overlayContainer.locator('.kbq-actions-panel-container__close-button').click();

            await expect(overlayContainer.locator(actionsPanelOverlay)).toHaveCount(0);
            await expect(overlayContainer).toHaveCSS('position', 'static');
        });

        test('items overflow on container resize', async ({ page }) => {
            await page.goto('/E2eActionsPanelWithOverlayContainer');
            const locator = getComponent(page);
            const overlayContainer = getOverlayContainer(locator);
            const getHiddenCount = () =>
                page.evaluate(() => document.querySelectorAll('.kbq-overflow-item-hidden').length);

            await getOpenButton(locator).click();

            // Capture baseline hidden count at default container width (400px)
            const hiddenCountDefault = await getHiddenCount();

            // Widen the container so all items fit
            await overlayContainer.evaluate(({ style }) => (style.width = '650px'));
            await expect.poll(getHiddenCount).toBeLessThan(hiddenCountDefault);

            const hiddenCountWide = await getHiddenCount();

            expect(hiddenCountWide).toBeLessThan(hiddenCountDefault);

            // Narrow the container so more items overflow
            await overlayContainer.evaluate(({ style }) => (style.width = '200px'));
            await expect.poll(getHiddenCount).toBeGreaterThan(hiddenCountWide);

            const hiddenCountNarrow = await getHiddenCount();

            expect(hiddenCountNarrow).toBeGreaterThan(hiddenCountWide);

            // Restore to wide: items should reappear
            await overlayContainer.evaluate(({ style }) => (style.width = '650px'));
            await expect.poll(getHiddenCount).toBe(hiddenCountWide);
        });
    });

    test.describe('E2eActionsPanelGlobalOverlayContainer', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eActionsPanelGlobalOverlayContainer');
        const getOpenButton = (locator: Locator) => locator.getByTestId('e2eActionsPanelGlobalOpenButton');

        test('renders in the application-wide overlay container', async ({ page }) => {
            await page.goto('/E2eActionsPanelGlobalOverlayContainer');
            const locator = getComponent(page);

            await getOpenButton(locator).click();

            await expect(page.locator(`${globalOverlayContainer} ${actionsPanelOverlay}`)).toHaveCount(1);
            await expect(locator.locator(actionsPanelOverlay)).toHaveCount(0);
            await expect(page.locator(scopedOverlayContainer)).toHaveCount(0);
        });

        test('pins the panel to the bottom center of the viewport', async ({ page }) => {
            await page.goto('/E2eActionsPanelGlobalOverlayContainer');
            const panel = page.locator(actionsPanelOverlay);

            await getOpenButton(getComponent(page)).click();
            await expect(panel).toBeVisible();

            const panelBox = await boundingBoxAtRest(panel);
            const viewport = page.viewportSize()!;

            expect(viewport.height - (panelBox.y + panelBox.height)).toBeLessThan(32);
            expect(Math.abs(panelBox.x + panelBox.width / 2 - viewport.width / 2)).toBeLessThan(2);
        });
    });

    test.describe('E2eActionsPanelDisabledButtons', () => {
        // Each disabled contrast button must keep the color of its enabled twin and only fade out.
        const contrastButtons = [
            ['e2eFilledContrastEnabled', 'e2eFilledContrastDisabled'],
            ['e2eOutlineEnabled', 'e2eOutlineDisabled'],
            ['e2eTransparentEnabled', 'e2eTransparentDisabled']
        ];

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eActionsPanelDisabledButtons');
            await page.getByTestId('e2eActionsPanelDisabledOpenButton').click();
            await expect(page.getByTestId('e2eFilledContrastEnabled')).toBeVisible();
        });

        test('fades disabled contrast buttons and keeps their enabled colors', async ({ page }) => {
            const disabledOpacity = await page.evaluate(() =>
                getComputedStyle(document.body).getPropertyValue('--kbq-opacity-disabled').trim()
            );

            await Promise.all(
                contrastButtons.map(async ([enabledId, disabledId]) => {
                    const enabledColor = await page
                        .getByTestId(enabledId)
                        .evaluate((element) => getComputedStyle(element).color);
                    const disabled = page.getByTestId(disabledId);

                    await expect(disabled).toHaveCSS('color', enabledColor);
                    await expect(disabled).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
                    await expect(disabled).toHaveCSS('opacity', disabledOpacity);
                })
            );
        });

        test('leaves the disabled state of other colors without an extra fade', async ({ page }) => {
            await expect(page.getByTestId('e2eThemeDisabled')).toHaveCSS('opacity', '1');
        });
    });

    test.describe('E2eActionsPanelDisabledOverflow', () => {
        // The same frame as the overflow example: a 400px container, widened to 650px to reveal the dropdown.
        test.use({ viewport: { width: 650, height: 240 } });

        test('items overflow and dropdown with a disabled action', async ({ page }) => {
            await page.goto('/E2eActionsPanelDisabledOverflow');
            const screenshotTarget = page.getByTestId('e2eScreenshotTarget');

            await page.getByTestId('e2eActionsPanelDisabledOverflowOpenButton').click();
            await screenshotTarget.evaluate(({ style }) => (style.width = '650px'));
            // The overflow follows the width through a ResizeObserver: wait until the two actions that no longer fit are hidden.
            await expect(screenshotTarget.locator('.kbq-overflow-item-hidden')).toHaveCount(2);
            await page.getByTestId('e2eActionsPanelDisabledOverflowResultButton').click();
            await expect(page.locator('.kbq-dropdown-item')).toHaveText(['Action 5', 'Action 6']);
            await expect(page.locator('.kbq-dropdown-item.cdk-focused')).toHaveCount(0);

            const viewport = page.viewportSize()!;

            await page.mouse.move(viewport.width - 1, viewport.height - 1);

            await expect(screenshotTarget).toHaveScreenshot('3-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('3-dark.png');
        });
    });
});
