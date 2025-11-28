import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevThemeToggle } from '../theme-toggle';
import { DevActionsPanelWithOverlayContainer } from './components/actions-panel';
import { DevButtonStateAndStyle } from './components/button';
import { DevFileUploadStateAndStyle } from './components/file-upload';
import { DevSplitButtonStateAndStyle } from './components/split-button';
import { DevTagEditable, DevTagStateAndStyle } from './components/tag';
import { DevToggleStateAndStyle, DevToggleWithTextAndCaption } from './components/toggle';

@Component({
    selector: 'dev-app',
    imports: [
        DevThemeToggle,
        DevButtonStateAndStyle,
        DevSplitButtonStateAndStyle,
        DevFileUploadStateAndStyle,
        DevActionsPanelWithOverlayContainer,
        DevTagStateAndStyle,
        DevTagEditable,
        DevToggleStateAndStyle,
        DevToggleWithTextAndCaption
    ],
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
