import { Page } from '@playwright/test';

export const e2eGoToRootPage = (page: Page) => page.goto('/');
