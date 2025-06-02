import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevButtonStateAndStyle } from 'packages/components-dev/button/module';
import { DevThemeToggle } from '../theme-toggle';

@Component({
    standalone: true,
    imports: [DevButtonStateAndStyle, DevThemeToggle],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
