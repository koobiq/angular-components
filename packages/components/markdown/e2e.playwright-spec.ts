import { expect, type Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqMarkdown', () => {
    test.describe('E2eMarkdownListContent', () => {
        const getTarget = (page: Page) => page.getByTestId('e2eMarkdownListContent').getByTestId('e2eScreenshotTarget');

        test('renders mixed Markdown content inside ordered and unordered list items', async ({ page }) => {
            await page.goto('/E2eMarkdownListContent');
            const target = getTarget(page);

            await expect(target.locator('.kbq-markdown__output > ol[start="98"] > li')).toHaveCount(3);

            for (const tag of ['ol', 'ul']) {
                const items = target.locator(`.kbq-markdown__output > ${tag} > li`);
                const checks = items.filter({ has: page.getByRole('heading', { name: 'Release checks' }) });

                await expect(checks.locator(':scope > h3 + p + p')).toHaveCSS('display', 'block');
                await expect(checks.getByRole('link', { name: 'guide' })).toHaveAttribute('href', '#checks');
                await expect(checks.locator('p > del, p > strong, p > em')).toHaveText(['beta', 'stable', 'defaults']);
                await expect(checks.locator(':scope > blockquote > p')).toHaveText([
                    'Run both checks.',
                    'Save the results.'
                ]);
                await expect(checks.locator(':scope > p + pre')).toHaveCSS('display', 'block');
                await expect(items.locator(':scope > p + table')).toHaveCSS('display', 'table');
                await expect(items.locator(':scope > table + hr')).toBeVisible();
                await expect(items.getByRole('checkbox')).toBeChecked();
                await expect(items.locator(':scope > p + ul')).toHaveCSS('display', 'block');
                await expect(items.locator(':scope > ul > li')).toHaveText(['Run yarn why marked.', 'Keep the log.']);
                await expect(items.locator(':scope > ol > li')).toHaveText(['Run yarn test.', 'Review output.']);
                await expect(items.locator(':scope > ul > li > code')).toHaveCSS('display', 'inline');
                await expect(items.locator(':scope > ol > li > code')).toHaveCSS('display', 'inline');
            }

            await expect(target).toHaveScreenshot('02-nested-list-blocks-light.png');
            await e2eEnableDarkTheme(page);
            await expect(target).toHaveScreenshot('02-nested-list-blocks-dark.png');
        });

        test('keeps the last column of a wide table reachable inside each list', async ({ page }) => {
            await page.setViewportSize({ width: 320, height: 720 });
            await page.goto('/E2eMarkdownListContent');

            for (const tag of ['ol', 'ul']) {
                const markdown = getTarget(page)
                    .locator('kbq-markdown')
                    .filter({ has: page.locator(`.kbq-markdown__output > ${tag}`) });
                const cell = markdown.getByRole('cell', { name: 'Ready' });

                await markdown.getByRole('columnheader', { name: 'Package' }).hover();
                await expect(cell).not.toBeInViewport({ ratio: 1 });
                await page.mouse.wheel(320, 0);
                await expect(cell).toBeInViewport({ ratio: 1 });
                await expect.poll(() => markdown.evaluate((host) => host.scrollLeft)).toBeGreaterThan(0);
            }
        });
    });

    test.describe('E2eMarkdownStates', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eMarkdownStates');

        test('states', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');
            await expect(getComponent(page)).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(getComponent(page)).toHaveScreenshot('01-dark.png');
        });

        test('shows the focus ring of a link focused from the keyboard only', async ({ page }) => {
            await page.goto('/E2eMarkdownStates');

            const link = getComponent(page).locator('.kbq-markdown__a').first();

            // A key press puts the browser into keyboard modality, as Tab does
            await page.keyboard.press('Shift');
            await link.focus();
            await expect(link).toHaveCSS('outline-style', 'solid');

            await link.blur();
            await link.click();
            await expect(link).toBeFocused();
            await expect(link).toHaveCSS('outline-style', 'none');
        });
    });
});
