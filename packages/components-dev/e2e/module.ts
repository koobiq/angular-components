import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevThemeToggle } from '../theme-toggle';
import { DevButtonStateAndStyle } from './components/button';
import { DevFileUploadStateAndStyle } from './components/file-upload';

@Component({
    standalone: true,
    imports: [DevButtonStateAndStyle, DevThemeToggle, DevFileUploadStateAndStyle],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
