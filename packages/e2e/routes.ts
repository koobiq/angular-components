import { Routes } from '@angular/router';
import { E2eAccordionStates } from '../components/accordion/e2e';
import { E2eActionsPanelWithOverlayContainer } from '../components/actions-panel/e2e';
import { E2eAlertStateAndStyle } from '../components/alert/e2e';
import { E2eAppSwitcherStates, E2eAppSwitcherWithSitesStates } from '../components/app-switcher/e2e';
import { E2eAutocompleteStates } from '../components/autocomplete/e2e';
import { E2eBadgeStyles } from '../components/badge/e2e';
import { E2eBreadcrumbsStateAndStyle } from '../components/breadcrumbs/e2e';
import { E2eButtonToggleStates } from '../components/button-toggle/e2e';
import { E2eButtonStateAndStyle } from '../components/button/e2e';
import { E2eCheckboxStateAndStyle, E2eCheckboxWithTextAndCaption } from '../components/checkbox/e2e';
import { E2eClampedTextStateAndStyle } from '../components/clamped-text/e2e';
import { E2eCodeBlockStates } from '../components/code-block/e2e';
import { E2eContentPanelState } from '../components/content-panel/e2e';
import { E2eDatepickerStates } from '../components/datepicker/e2e';
import { E2eDividerStateAndStyle } from '../components/divider/e2e';
import { E2eDlStates } from '../components/dl/e2e';
import { E2eDropdownStates } from '../components/dropdown/e2e';
import { E2eEmptyStateStateAndStyle } from '../components/empty-state/e2e';
import { E2eFileUploadDropzone, E2eFileUploadStateAndStyle } from '../components/file-upload/e2e';
import { E2eFilterBarStates } from '../components/filter-bar/e2e';
import { E2eIconStateAndStyle } from '../components/icon/e2e';
import { E2eInlineEditStates } from '../components/inline-edit/e2e';
import { E2eInputStateAndStyle } from '../components/input/e2e';
import { E2eLinkStates } from '../components/link/e2e';
import { E2eListStates } from '../components/list/e2e';
import { E2eLoaderOverlayStates } from '../components/loader-overlay/e2e';
import { E2eMarkdownStates } from '../components/markdown/e2e';
import { E2eModalStates } from '../components/modal/e2e';
import { E2eHorizontalNavbarStates, E2eVerticalNavbarStates } from '../components/navbar/e2e';
import { E2eNotificationCenterStates } from '../components/notification-center/e2e';
import { E2ePopoverStates } from '../components/popover/e2e';
import { E2eProgressBarStateAndStyle } from '../components/progress-bar/e2e';
import { E2eProgressSpinnerStates } from '../components/progress-spinner/e2e';
import { E2eRadioStateAndStyle } from '../components/radio/e2e';
import { E2eScrollbarStateAndStyle } from '../components/scrollbar/e2e';
import { E2eSearchExpandableStates } from '../components/search-expandable/e2e';
import {
    E2eMultilineSelectStates,
    E2eMultiSelectStates,
    E2eSelectStates,
    E2eSelectWithSearchAndFooter
} from '../components/select/e2e';
import { E2eSidepanelStateAndStyle } from '../components/sidepanel/e2e';
import { E2eSplitButtonStateAndStyle } from '../components/split-button/e2e';
import { E2eTableStates } from '../components/table/e2e';
import { E2eTabsStates } from '../components/tabs/e2e';
import {
    E2eTagAutocompleteStates,
    E2eTagEditable,
    E2eTagInputStates,
    E2eTagListStates,
    E2eTagStateAndStyle
} from '../components/tags/e2e';
import { E2eTextareaStates } from '../components/textarea/e2e';
import { E2eTimepickerStates } from '../components/timepicker/e2e';
import { E2eTimezoneStates } from '../components/timezone/e2e';
import { E2eToastStates } from '../components/toast/e2e';
import { E2eToggleStateAndStyle, E2eToggleWithTextAndCaption } from '../components/toggle/e2e';
import { E2eTooltipStates } from '../components/tooltip/e2e';
import { E2eTopBarStates } from '../components/top-bar/e2e';
import {
    E2eMultilineTreeSelectStates,
    E2eMultiTreeSelectStates,
    E2eTreeSelectStates
} from '../components/tree-select/e2e';
import { E2eTreeStates } from '../components/tree/e2e';
import { E2eUsernameStateAndStyle } from '../components/username/e2e';

const components = [
    E2eButtonStateAndStyle,
    E2eSplitButtonStateAndStyle,
    E2eFileUploadStateAndStyle,
    E2eFileUploadDropzone,
    E2eActionsPanelWithOverlayContainer,
    E2eTagStateAndStyle,
    E2eTagEditable,
    E2eToggleStateAndStyle,
    E2eToggleWithTextAndCaption,
    E2eBreadcrumbsStateAndStyle,
    E2eEmptyStateStateAndStyle,
    E2eCodeBlockStates,
    E2eDlStates,
    E2eAlertStateAndStyle,
    E2eDividerStateAndStyle,
    E2eButtonToggleStates,
    E2eTabsStates,
    E2eClampedTextStateAndStyle,
    E2eAccordionStates,
    E2eTextareaStates,
    E2eDatepickerStates,
    E2eTableStates,
    E2eAppSwitcherStates,
    E2eContentPanelState,
    E2eAppSwitcherWithSitesStates,
    E2eTagAutocompleteStates,
    E2eFilterBarStates,
    E2eTimepickerStates,
    E2eIconStateAndStyle,
    E2eBadgeStyles,
    E2eLinkStates,
    E2eTagInputStates,
    E2eModalStates,
    E2eListStates,
    E2eLoaderOverlayStates,
    E2eAutocompleteStates,
    E2eCheckboxStateAndStyle,
    E2eDropdownStates,
    E2eCheckboxWithTextAndCaption,
    E2eMarkdownStates,
    E2eSearchExpandableStates,
    E2eInputStateAndStyle,
    E2eScrollbarStateAndStyle,
    E2eRadioStateAndStyle,
    E2eProgressBarStateAndStyle,
    E2eProgressSpinnerStates,
    E2eSidepanelStateAndStyle,
    E2eHorizontalNavbarStates,
    E2eVerticalNavbarStates,
    E2eUsernameStateAndStyle,
    E2eToastStates,
    E2eNotificationCenterStates,
    E2ePopoverStates,
    E2eTooltipStates,
    E2eTagListStates,
    E2eTopBarStates,
    E2eTimezoneStates,
    E2eSelectStates,
    E2eMultiSelectStates,
    E2eMultilineSelectStates,
    E2eTreeStates,
    E2eTreeSelectStates,
    E2eMultiTreeSelectStates,
    E2eMultilineTreeSelectStates,
    E2eSelectWithSearchAndFooter,
    E2eInlineEditStates
];

export const e2eRoutes: Routes = components.map((component) => {
    return {
        path: component.name
            // We should remove lead "_" symbol from the component name
            .slice(1),
        component
    };
});
