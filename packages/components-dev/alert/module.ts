import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { E2eAlertStateAndStyle } from '../../components/alert/e2e';

@Component({
    selector: 'dev-app',
    imports: [E2eAlertStateAndStyle],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
