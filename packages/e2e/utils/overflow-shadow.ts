import { Locator } from '@playwright/test';

/** Returns whether the located element currently renders a `box-shadow` (i.e. an overflow shadow is active). */
export const e2eHasOverflowShadow = (locator: Locator): Promise<boolean> =>
    locator.evaluate((el) => getComputedStyle(el).boxShadow !== 'none');
