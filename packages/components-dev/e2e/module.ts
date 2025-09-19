import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevThemeToggle } from '../theme-toggle';
import { DevActionsPanelWithOverlayContainer } from './components/actions-panel';
import { DevButtonStateAndStyle } from './components/button';
import { DevFileUploadStateAndStyle } from './components/file-upload';
import { DevTagEditable, DevTagStateAndStyle } from './components/tag';

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        DevButtonStateAndStyle,
        DevFileUploadStateAndStyle,
        DevActionsPanelWithOverlayContainer,
        DevTagStateAndStyle,
        DevTagEditable
    ],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
