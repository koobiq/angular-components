import { expect, Locator, Page } from '@playwright/test';

export const e2eDisableResizeObserver = (page: Page): Promise<void> =>
    page.addInitScript(() => {
        window.ResizeObserver = class {
            observe() {}
            unobserve() {}
            disconnect() {}
        } as unknown as typeof ResizeObserver;
    });

export const e2eExpectNoScrollbarAfterFlash = async (viewport: Locator): Promise<void> => {
    const track = viewport.locator('kbq-scrollbar-track').first();

    await expect(viewport).toBeVisible();
    await expect(track).toHaveClass(/kbq-scrollbar-track_revealed/);

    expect(
        await viewport.evaluate((element) => ({
            horizontal: element.scrollWidth > element.clientWidth,
            vertical: element.scrollHeight > element.clientHeight
        }))
    ).toEqual({ horizontal: false, vertical: false });

    await expect(track.locator('.kbq-scrollbar-track__bar')).toHaveCount(0);
    await expect(track.locator('.kbq-scrollbar-track__thumb')).toHaveCount(0);
};
