import { test } from '@playwright/test';
import { e2eDescribeWebkitPanelScrolling } from '../../e2e/utils';

test.use({ browserName: 'webkit' });

e2eDescribeWebkitPanelScrolling({
    name: 'KbqDropdown',
    route: '/E2eDropdownScrollbar',
    open: async (page) => {
        await page.getByTestId('e2eDropdownScrollbarTrigger').click();
    },
    port: '.kbq-dropdown__panel',
    item: '.kbq-dropdown-item',
    activeItem: '.kbq-dropdown-item:focus'
});
