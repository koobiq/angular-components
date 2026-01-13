import { Page } from '@playwright/test';

export const e2eEnableDarkTheme = async (page: Page): Promise<void> =>
    await page.evaluate(() => {
        document.body.classList.remove('kbq-light');
        document.body.classList.add('kbq-dark');
    });
