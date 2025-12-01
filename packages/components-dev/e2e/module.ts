import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevThemeToggle } from '../theme-toggle';
import { E2eActionsPanelWithOverlayContainer } from './components/actions-panel';
import { E2eButtonStateAndStyle } from './components/button';
import { E2eFileUploadStateAndStyle } from './components/file-upload';
import { E2eSplitButtonStateAndStyle } from './components/split-button';
import { E2eTagEditable, E2eTagStateAndStyle } from './components/tag';
import { E2eToggleStateAndStyle, E2eToggleWithTextAndCaption } from './components/toggle';

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        E2eButtonStateAndStyle,
        E2eSplitButtonStateAndStyle,
        E2eFileUploadStateAndStyle,
        E2eActionsPanelWithOverlayContainer,
        E2eTagStateAndStyle,
        E2eTagEditable,
        E2eToggleStateAndStyle,
        E2eToggleWithTextAndCaption
    ],
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class E2eApp {}
