import { expect, Page, test } from '@playwright/test';

const tooltip = (page: Page) => page.locator('.kbq-tooltip');

const startHalf = (page: Page, testId: string) =>
    page.getByTestId(testId).locator('.kbq-ellipsis-center_data-text-start');

const endHalf = (page: Page, testId: string) => page.getByTestId(testId).locator('.kbq-ellipsis-center_data-text-end');

test.describe('KbqEllipsisCenterDirective', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eEllipsisCenterOverflow');
    });

    test('should load its own layout contract on a host that supplies no styles', async ({ page }) => {
        const host = page.getByTestId('ellipsisTruncated');

        // Asserted on the host that carries no styles of its own, so this fails on a build where
        // `_CdkPrivateStyleLoader` never ran — the case no other e2e fixture can reach.
        await expect(host).toHaveCSS('display', 'flex');
        await expect(host).toHaveCSS('overflow', 'hidden');
        await expect(host).toHaveCSS('min-width', '0px');

        await expect(startHalf(page, 'ellipsisTruncated')).toHaveCSS('text-overflow', 'ellipsis');
        await expect(endHalf(page, 'ellipsisTruncated')).toHaveCSS('white-space', 'pre');
    });

    test('should split the text and keep the extension visible', async ({ page }) => {
        // The tail is what the split exists for: end-truncation would take the extension with it.
        await expect(endHalf(page, 'ellipsisTruncated')).toContainText('.pdf');
        await expect(startHalf(page, 'ellipsisTruncated')).toContainText('annual-report');
    });

    test('should stay on one line instead of wrapping inside the cell', async ({ page }) => {
        const host = page.getByTestId('ellipsisTruncated');

        // Wrapping is precisely how a missing contract hides itself: the text fits once it wraps, the
        // directive measures no overflow, and every other assertion about a "short" name would still pass.
        const { height } = (await host.boundingBox())!;

        expect(height).toBeLessThan(24);
    });

    test('should show the tooltip with the full text on hover', async ({ page }) => {
        await page.getByTestId('ellipsisTruncated').hover();

        await expect(tooltip(page)).toBeVisible();
        await expect(tooltip(page)).toContainText('annual-report-for-the-fiscal-year-2024-final-approved.pdf');
    });

    test('should not show the tooltip when the text fits', async ({ page }) => {
        await page.getByTestId('ellipsisFits').hover();

        // Longer than the tooltip enterDelay (400ms), so a tooltip that should not open has had time to
        // appear. Without the wait the assertion resolves on its first poll, while it is still absent anyway.
        await page.waitForTimeout(800);
        await expect(tooltip(page)).toBeHidden();
    });

    test('should leave text below minVisibleLength unsplit but still hinted', async ({ page }) => {
        // Asserted before the shape, and deliberately: an empty tail also describes a name that simply fits,
        // so without proof of overflow this test would pass on a fixture that never reached the split at all.
        await page.getByTestId('ellipsisBelowMinVisibleLength').hover();

        await expect(tooltip(page)).toBeVisible();
        await expect(tooltip(page)).toContainText('quarterly-summary-report-2024-final.pdf');

        // Nothing moves to the tail, so the host's own `text-overflow` cuts the name off at the end instead.
        await expect(endHalf(page, 'ellipsisBelowMinVisibleLength')).toBeEmpty();
        await expect(startHalf(page, 'ellipsisBelowMinVisibleLength')).toHaveText(
            'quarterly-summary-report-2024-final.pdf'
        );
    });
});
