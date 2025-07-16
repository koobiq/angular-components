import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevThemeToggle } from '../theme-toggle';
import { DevButtonStateAndStyle } from './components/button';

@Component({
    standalone: true,
    imports: [DevButtonStateAndStyle, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
