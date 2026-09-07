import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

// Spelled out rather than imported from the component package: a Playwright spec runs in Node, and pulling in an
// Angular module from there fails on the missing JIT compiler.
const actionsPanelOverlay = '.cdk-overlay-pane.kbq-actions-panel-overlay';
const scopedOverlayContainer = '.kbq-actions-panel-scoped-overlay-container';
const globalOverlayContainer = 'body > .cdk-overlay-container';

test.describe('KbqActionsPanel', () => {
    test.describe('E2eActionsPanelWithOverlayContainer', () => {
        test.use({ viewport: { width: 650, height: 200 } });

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
            await getOverflowItemsResultButton(page).click();
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

            await getOpenButton(locator).click();

            const containerBox = (await getOverlayContainer(locator).boundingBox())!;
            const panelBox = (await getOverlayContainer(locator).locator(actionsPanelOverlay).boundingBox())!;

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

            await getOpenButton(getComponent(page)).click();

            const panelBox = (await page.locator(actionsPanelOverlay).boundingBox())!;
            const viewport = page.viewportSize()!;

            expect(viewport.height - (panelBox.y + panelBox.height)).toBeLessThan(32);
            expect(Math.abs(panelBox.x + panelBox.width / 2 - viewport.width / 2)).toBeLessThan(2);
        });
    });
});
