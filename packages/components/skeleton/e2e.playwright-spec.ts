import { expect, Locator, Page, test } from '@playwright/test';

const host = (page: Page, state: 'loading' | 'loaded', testId: string): Locator =>
    page.getByTestId(state).getByTestId(testId);

const radius = (locator: Locator): Promise<string> =>
    locator.evaluate((element) => getComputedStyle(element).borderTopLeftRadius);

// Read from the host rather than hardcoded, so a new value of the token does not fail the test.
const skeletonRadius = (locator: Locator): Promise<string> =>
    locator.evaluate((element) => getComputedStyle(element).getPropertyValue('--kbq-skeleton-border-radius').trim());

test.describe('KbqSkeleton', () => {
    test.describe('border radius', () => {
        test.beforeEach(async ({ page }) => {
            await page.goto('/E2eSkeletonBorderRadius');
        });

        test('should keep the radius of a host that has one', async ({ page }) => {
            for (const testId of ['own', 'button', 'alert', 'form-field']) {
                const own = await radius(host(page, 'loaded', testId));

                // Guards the fixture: a host without a radius of its own would prove nothing here.
                expect.soft(own, testId).not.toBe('0px');
                expect.soft(await radius(host(page, 'loading', testId)), testId).toBe(own);
            }
        });

        test('should give the skeleton radius to a host that has none', async ({ page }) => {
            for (const testId of ['text', 'block', 'element']) {
                const loading = host(page, 'loading', testId);
                const expected = await skeletonRadius(loading);

                expect.soft(expected, testId).not.toBe('0px');
                expect.soft(await radius(loading), testId).toBe(expected);
            }
        });

        test('should give a host its own radius back once loaded', async ({ page }) => {
            for (const testId of ['text', 'block']) {
                expect.soft(await radius(host(page, 'loaded', testId)), testId).toBe('0px');
            }
        });

        test('should keep an explicit zero radius', async ({ page }) => {
            expect(await radius(host(page, 'loading', 'square'))).toBe('0px');
        });

        test('should let a class override the radius of the kbq-skeleton element', async ({ page }) => {
            expect(await radius(host(page, 'loading', 'circle'))).toBe('50%');
        });
    });
});
