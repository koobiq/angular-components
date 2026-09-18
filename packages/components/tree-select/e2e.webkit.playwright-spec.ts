import { test } from '@playwright/test';
import { e2eDescribeWebkitPanelScrolling } from '../../e2e/utils';

test.use({ browserName: 'webkit' });

e2eDescribeWebkitPanelScrolling({
    name: 'KbqTreeSelect',
    route: '/E2eTreeSelectScrollbar',
    open: async (page) => {
        await page.getByTestId('e2eTreeSelect').click();
    },
    port: '.kbq-tree-select__content',
    item: '.kbq-tree-option',
    activeItem: '.kbq-tree-option:focus'
});
