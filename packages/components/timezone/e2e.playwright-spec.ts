import { expect, Locator, Page, test } from '@playwright/test';
import {
    e2eDisableResizeObserver,
    e2eEnableDarkTheme,
    e2eExpectNoScrollbarAfterFlash,
    e2eWaitForSettledScrollbars
} from '../../e2e/utils';

test.describe('KbqTimezoneModule', () => {
    test.describe('E2eTimezoneScrollbar', () => {
        const getContent = (page: Page) => page.locator('.kbq-select__content');
        const getTrack = (page: Page) => getContent(page).locator('kbq-scrollbar-track');
        const getVerticalThumb = (page: Page) =>
            getContent(page).locator('.kbq-scrollbar-track__bar_vertical .kbq-scrollbar-track__thumb');

        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eTimezoneScrollbar');
            await page.getByTestId('e2eTimezoneSelect').click();
            await expect(getContent(page)).toBeVisible();
        });

        test('flashes the track on open, then fades it', async ({ page }) => {
            const track = getTrack(page);

            await expect(track).toHaveCSS('opacity', '1');
            await expect(track).toHaveCSS('opacity', '0');
        });

        test('hides the native scrollbar and reveals the custom track on hover', async ({ page }) => {
            await expect(getContent(page)).toHaveClass(/kbq-scrollbar-viewport_native-scrollbar-hidden/);

            const track = getTrack(page);

            await expect(track).toBeAttached();
            await expect(track).toHaveCSS('opacity', '0');

            await getContent(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
        });

        test('clicking the scrollbar thumb keeps the panel open', async ({ page }) => {
            await getContent(page).hover();
            await getVerticalThumb(page).click();

            await expect(getContent(page)).toBeVisible();
        });

        test('renders the custom scrollbar', async ({ page }) => {
            const track = getTrack(page);

            await getContent(page).hover();
            await expect(track).toHaveCSS('opacity', '1');
            await expect(getContent(page)).toHaveScreenshot('04-light.png');
        });
    });

    test.describe('E2eTimezoneScrollbarNoOverflow', () => {
        test('shows no scrollbar after the panel opens', async ({ page }) => {
            await e2eDisableResizeObserver(page);
            await page.goto('/E2eTimezoneScrollbarNoOverflow');
            await page.getByTestId('e2eTimezoneSelect').click();

            await e2eExpectNoScrollbarAfterFlash(page.locator('.kbq-select__content'));
        });
    });

    test.describe('E2eTimezoneStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eTimezoneStates');

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTimezoneWithSearch', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezoneWithSearch');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelectWithSearch');

        const open = async (page: Page) => {
            await page.goto('/E2eTimezoneWithSearch');
            await getTimezoneSelect(getComponent(page)).focus();
            await page.keyboard.press('Enter');
            // The panel flashes its track on open, and the shot lands inside that window unless it is
            // waited out. The panel is in an overlay at body level, so the count is page-scoped.
            await e2eWaitForSettledScrollbars(page, 1);
        };

        test('with search', async ({ page }) => {
            await open(page);

            await expect(getComponent(page)).toHaveScreenshot('02-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('02-dark.png');
        });

        test('narrows the options and the city lists inside them', async ({ page }) => {
            await open(page);
            await page.locator('[kbqSelectSearch] input').fill('Kazan');
            await e2eWaitForSettledScrollbars(page, 1);

            await expect(getComponent(page)).toHaveScreenshot('05-light.png');
        });
    });

    test.describe('E2eTimezoneWithFooter', () => {
        test('renders the projected footer below the option list, not inside it', async ({ page }) => {
            await page.goto('/E2eTimezoneWithFooter');
            await page.getByTestId('e2eTimezoneSelect').click();

            const footer = page.locator('kbq-select-footer');

            await expect(footer).toBeVisible();
            await expect(page.locator('.kbq-select__content kbq-select-footer')).toHaveCount(0);

            await footer.click();

            await expect(page.locator('.kbq-select__content')).toBeHidden();
        });
    });

    test.describe('E2eTimezoneAtViewportEdge', () => {
        test('keeps the panel inside the viewport when the trigger sits on its bottom edge', async ({ page }) => {
            await page.goto('/E2eTimezoneAtViewportEdge');
            await page.getByTestId('e2eTimezoneSelect').click();

            const panel = page.locator('.kbq-timezone-select__panel');

            await expect(panel).toBeVisible();

            const box = (await panel.boundingBox())!;
            const viewport = page.viewportSize()!;

            expect(box.y).toBeGreaterThanOrEqual(0);
            expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
        });
    });

    test.describe('E2eTimezonePanelStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTimezonePanelStates');
        const getTimezoneSelect = (locator: Locator) => locator.getByTestId('e2eTimezoneSelect');

        test('option states', async ({ page }) => {
            await page.goto('/E2eTimezonePanelStates');
            const timezone = getTimezoneSelect(getComponent(page));

            await timezone.click();

            await expect(getComponent(page)).toHaveScreenshot('03-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('03-dark.png');
        });
    });
});
