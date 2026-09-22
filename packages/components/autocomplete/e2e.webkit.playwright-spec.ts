import { e2eDescribeWebkitPanelScrolling } from '../../e2e/utils';

e2eDescribeWebkitPanelScrolling({
    name: 'KbqAutocomplete',
    route: '/E2eAutocompleteScrollbar',
    open: async (page) => {
        await page.getByTestId('e2eAutocompleteInput').focus();
    },
    port: '.kbq-autocomplete-panel__content',
    item: '.kbq-option',
    activeItem: '.kbq-option.kbq-active'
});
