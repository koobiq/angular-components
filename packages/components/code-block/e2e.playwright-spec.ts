import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqCodeBlockModule', () => {
    test.describe('E2eCodeBlockStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eCodeBlockStates');
        const codeBlock = 'code.kbq-code-block__code';

        /**
         * Highlighting lands after the initial render: KbqCodeBlockHighlight reaches highlight.js through
         * a dynamic import, then rewrites each block's innerHTML and stamps `data-language` on the element
         * as it finishes. Nothing the component renders blocks on that, so a screenshot taken straight
         * after navigation can catch the page part-highlighted — some blocks already carrying their
         * line-number table, others still plain text.
         *
         * Left to toHaveScreenshot's own retries this does not fail informatively. The half-applied state
         * changes the element's height rather than a few pixels, so it surfaces as `Expected an image
         * 1556px by 3540px, received 1556px by 3232px` — which reads like a layout regression, not a race.
         * It also only appears under load: eight workers against one dev server reproduced it here, four
         * did not.
         *
         * The first assertion is the guard. Without it the second passes trivially against a page that has
         * not rendered any code blocks yet.
         */
        const waitForHighlighting = async (page: Page) => {
            await expect(page.locator(codeBlock).first()).toBeAttached();
            await expect(page.locator(`${codeBlock}:not([data-language])`)).toHaveCount(0);
        };

        test('states', async ({ page }) => {
            /**
             * This is the heaviest page in the suite: fifteen code blocks, each highlighted and rebuilt
             * into a line-numbered table, then captured twice at roughly 1556x3540. The 15s default in
             * playwright.config.ts is sized for pages a fraction of that, and once several workers share
             * one dev server this test lands between 9s and 17s — so it does not fail on a wrong render
             * but on the budget, with no screenshot taken at all to explain why. Tripling it via slow()
             * costs nothing when the test passes and leaves the assertions untouched.
             */
            test.slow();
            await page.goto('/E2eCodeBlockStates');
            await waitForHighlighting(page);
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
