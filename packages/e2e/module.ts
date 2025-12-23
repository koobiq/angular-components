import { ChangeDetectionStrategy, Component } from '@angular/core';
import { E2eBadgeStyles } from 'packages/components/badge/e2e';
import { E2eCheckboxStateAndStyle, E2eCheckboxWithTextAndCaption } from 'packages/components/checkbox/e2e';
import { E2eCodeBlockStates } from 'packages/components/code-block/e2e';
import { E2eContentPanelState } from 'packages/components/content-panel/e2e';
import { E2eDlStates } from 'packages/components/dl/e2e';
import { E2eTableStates } from 'packages/components/table/e2e';
import { E2eTabsStates } from 'packages/components/tabs/e2e';
import { E2eTextareaStates } from 'packages/components/textarea/e2e';
import { E2eTimepickerStates } from 'packages/components/timepicker/e2e';
import { DevThemeToggle } from '../components-dev/theme-toggle';
import { E2eAccordionStates } from '../components/accordion/e2e';
import { E2eActionsPanelWithOverlayContainer } from '../components/actions-panel/e2e';
import { E2eAlertStateAndStyle } from '../components/alert/e2e';
import { E2eAppSwitcherStates, E2eAppSwitcherWithSitesStates } from '../components/app-switcher/e2e';
import { E2eBreadcrumbsStateAndStyle } from '../components/breadcrumbs/e2e';
import { E2eButtonToggleStates } from '../components/button-toggle/e2e';
import { E2eButtonStateAndStyle } from '../components/button/e2e';
import { E2eClampedTextStateAndStyle } from '../components/clamped-text/e2e';
import { E2eDatepickerStates } from '../components/datepicker/e2e';
import { E2eDividerStateAndStyle } from '../components/divider/e2e';
import { E2eEmptyStateStateAndStyle } from '../components/empty-state/e2e';
import { E2eFileUploadStateAndStyle } from '../components/file-upload/e2e';
import { E2eFilterBarStates } from '../components/filter-bar/e2e';
import { E2eIconStateAndStyle } from '../components/icon/e2e';
import { E2eInputStateAndStyle } from '../components/input/e2e';
import { E2eListStates } from '../components/list/e2e';
import { E2eMarkdownStates } from '../components/markdown/e2e';
import { E2eHorizontalNavbarStates, E2eVerticalNavbarStates } from '../components/navbar/e2e';
import { E2eProgressBarStateAndStyle } from '../components/progress-bar/e2e';
import { E2eSearchExpandableStates } from '../components/search-expandable/e2e';
import { E2eSplitButtonStateAndStyle } from '../components/split-button/e2e';
import { E2eTagEditable, E2eTagStateAndStyle } from '../components/tags/e2e';
import { E2eToggleStateAndStyle, E2eToggleWithTextAndCaption } from '../components/toggle/e2e';

@Component({
    selector: 'e2e-app',
    imports: [
        DevThemeToggle,
        E2eButtonStateAndStyle,
        E2eSplitButtonStateAndStyle,
        E2eFileUploadStateAndStyle,
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
        E2eFilterBarStates,
        E2eTimepickerStates,
        E2eIconStateAndStyle,
        E2eBadgeStyles,
        E2eListStates,
        E2eCheckboxStateAndStyle,
        E2eCheckboxWithTextAndCaption,
        E2eMarkdownStates,
        E2eSearchExpandableStates,
        E2eProgressBarStateAndStyle,
        E2eInputStateAndStyle,
        E2eHorizontalNavbarStates,
        E2eVerticalNavbarStates
    ],
    templateUrl: 'template.html',
    styleUrl: 'main.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eApp {}
