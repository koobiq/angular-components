import { Locator, Page } from '@playwright/test';

const getThemeToggle = (page: Page): Locator => page.getByTestId('e2eThemeToggle');

export const devEnableDarkTheme = async (page: Page): Promise<void> => await getThemeToggle(page).click();
