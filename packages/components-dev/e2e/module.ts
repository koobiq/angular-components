import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevThemeToggle } from '../theme-toggle';
import { DevActionsPanelWithOverlayContainer } from './components/actions-panel';
import { DevButtonStateAndStyle } from './components/button';

@Component({
    standalone: true,
    imports: [
        DevThemeToggle,
        DevButtonStateAndStyle,
        DevActionsPanelWithOverlayContainer
    ],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
