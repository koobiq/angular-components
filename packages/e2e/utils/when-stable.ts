import { Locator } from '@playwright/test';

export async function e2eWhenStable(locator: Locator): Promise<void> {
    try {
        const handle = await locator.elementHandle();

        if (!handle) return;

        // https://playwright.dev/docs/actionability#stable
        await handle.waitForElementState('stable');

        // https://playwright.dev/docs/actionability#visible
        await handle.waitForElementState('visible');
    } catch {
        return;
    }
}
