import { expect, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from 'packages/e2e/utils';

test.describe('KbqCodeBlockModule', () => {
    test.describe('E2eCodeBlockStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eCodeBlockStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eCodeBlockStates');

            // The fixture scrolls this block to its end, and the component defers that scroll until
            // highlight.js has arrived through its dynamic import. Highlighting also changes the
            // block's height — measured, its scroll range grows from 150px to 180px — so the resting
            // position is only correct once both have happened. A shot taken first came out 1616px
            // tall against the baseline's 1770px, which at deviceScaleFactor 2 is exactly the
            // 3232px-against-3540px image the CI failures reported.
            const scrolledCodeArea = page.getByTestId('e2eCodeBlockWithTabs').locator('.kbq-code-block__main');

            // Driven here rather than left to the fixture. `KbqCodeBlock.scrollTo` defers until
            // highlighting reports itself done, but the scroll range keeps growing after that as the
            // line-numbers plugin restructures the block — so the component's own scroll rests one
            // pixel short of the bottom in roughly one run in thirty, and nothing corrects it. One CSS
            // pixel shifts the whole code area, which at threshold: 0 is a failure.
            await expect
                .poll(async () => {
                    await scrolledCodeArea.evaluate((el) => el.scrollTo({ top: el.scrollHeight }));

                    return scrolledCodeArea.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop);
                })
                .toBe(0);
            await expect.poll(() => scrolledCodeArea.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);

            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });
    });
});
