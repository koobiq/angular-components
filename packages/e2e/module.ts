import { ChangeDetectionStrategy, Component } from '@angular/core';
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
import { E2eSplitButtonStateAndStyle } from '../components/split-button/e2e';
import { E2eTagEditable, E2eTagStateAndStyle } from '../components/tags/e2e';
import { E2eToggleStateAndStyle, E2eToggleWithTextAndCaption } from '../components/toggle/e2e';

@Component({
    selector: 'dev-app',
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
        E2eAlertStateAndStyle,
        E2eDividerStateAndStyle,
        E2eButtonToggleStates,
        E2eClampedTextStateAndStyle,
        E2eAccordionStates,
        E2eDatepickerStates,
        E2eAppSwitcherStates,
        E2eAppSwitcherWithSitesStates
    ],
    templateUrl: 'template.html',
    styleUrl: 'main.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
