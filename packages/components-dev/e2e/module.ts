import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DevButtonStateAndStyle } from 'packages/components-dev/button/module';

@Component({
    standalone: true,
    imports: [DevButtonStateAndStyle],
    selector: 'dev-app',
    templateUrl: 'template.html',
    styleUrl: 'styles.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
