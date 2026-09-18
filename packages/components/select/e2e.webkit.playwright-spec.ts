import { test } from '@playwright/test';
import { e2eDescribeWebkitPanelScrolling } from '../../e2e/utils';

test.use({ browserName: 'webkit' });

e2eDescribeWebkitPanelScrolling({
    name: 'KbqSelect',
    route: '/E2eSelectScrollbar',
    open: async (page) => {
        await page.getByTestId('e2eSelect').click();
    },
    port: '.kbq-select__content',
    item: '.kbq-option',
    activeItem: '.kbq-option.kbq-active'
});
