import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

/**
 * Waits until every tab header inside `component` has finished scroll-correcting to its selected tab.
 *
 * A header whose selected tab starts out of view scrolls to it with `behavior: 'smooth'`
 * (`scrollCorrection` in paginated-tab-header.ts), and `animations: 'disabled'` does not reach that:
 * it fast-forwards CSS animations and transitions, not a scroll the browser animates itself. A shot
 * taken without this lands on whichever frame of that scroll the machine happened to be on.
 *
 * Both halves are load-bearing. "The offset stopped changing" is equally true of a header the
 * correction has not started on yet, and "the selected label is in view" becomes true a few frames
 * before the scroll lands, because the target it eases to carries an overscroll margin.
 */
const e2eWaitForSettledTabHeaders = (component: Locator): Promise<void> =>
    component.evaluate(
        (root) =>
            new Promise<void>((resolve) => {
                const stableFramesNeeded = 3;
                const containers = Array.from(root.querySelectorAll<HTMLElement>('.kbq-tab-header__scroll-container'));
                const offsets = () =>
                    containers.map(({ scrollLeft, scrollTop }) => `${scrollLeft}:${scrollTop}`).join();

                const selectedLabelsInView = () =>
                    containers.every((container) => {
                        const label = container.querySelector('.kbq-tab-label.kbq-selected');

                        // A group whose active tab is not among the rendered ones has no selected
                        // label, and nothing scrolls it — there is no in-view state to wait for.
                        if (!label) {
                            return true;
                        }

                        const labelBox = label.getBoundingClientRect();
                        const containerBox = container.getBoundingClientRect();

                        // A pixel of tolerance: both boxes come back fractional, and a label flush
                        // against the edge of its scrollport is in view for the purpose of a shot.
                        return (
                            labelBox.left >= containerBox.left - 1 &&
                            labelBox.right <= containerBox.right + 1 &&
                            labelBox.top >= containerBox.top - 1 &&
                            labelBox.bottom <= containerBox.bottom + 1
                        );
                    });

                let previous = offsets();
                let stableFrames = 0;

                const check = () => {
                    const current = offsets();

                    stableFrames = current === previous && selectedLabelsInView() ? stableFrames + 1 : 0;
                    previous = current;

                    if (stableFrames >= stableFramesNeeded) {
                        resolve();

                        return;
                    }

                    // No frame cap: Playwright's own timeout reports a header that never settles far
                    // more clearly than a mid-flight offset that silently satisfies the wait.
                    requestAnimationFrame(check);
                };

                requestAnimationFrame(check);
            })
    );

test.describe('KbqTabsModule', () => {
    test.describe('E2eTabsStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eTabsStates');
        const getTabsUnderlined = (page: Page) => page.getByTestId('e2eTabsUnderlined');

        test('states', async ({ page }) => {
            await page.goto('/E2eTabsStates');

            const component = getComponent(page);

            // Flaky test workaround: click to underlined tab to ensure proper bottom outline rendering
            await getTabsUnderlined(page).locator('.kbq-tab-label_underlined').nth(0).click();

            // TODO: 01-light.png was committed with the two `[activeTab]="tabs[5]"` groups caught
            // mid-scroll, so it holds a frame this wait deliberately no longer returns. Regenerate it
            // with /approve-snapshots on this pull request and delete this note.
            await e2eWaitForSettledTabHeaders(component);
            await expect(component).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await e2eWaitForSettledTabHeaders(component);
            await expect(component).toHaveScreenshot('01-dark.png');
        });
    });

    test.describe('E2eTabNavBar', () => {
        test('should make disabled links unclickable', async ({ page }) => {
            await page.goto('/E2eTabNavBar');

            const enabledLink = page.getByTestId('tabNavBar_default').locator('a');
            const disabledLink = page.getByTestId('tabNavBar_disabled').locator('a');

            await expect(enabledLink).not.toHaveCSS('pointer-events', 'none');
            await expect(disabledLink).toHaveCSS('pointer-events', 'none');
        });
    });
});
