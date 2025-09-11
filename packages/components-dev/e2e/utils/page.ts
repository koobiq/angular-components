import { Page } from '@playwright/test';

export const devGoToRootPage = (page: Page) => page.goto('/');
