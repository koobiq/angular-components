import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

@Component({
    selector: 'dev-app',
    imports: [KbqDividerModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DevApp {}
