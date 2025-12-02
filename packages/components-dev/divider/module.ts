import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

@Component({
    selector: 'dev-app',
    imports: [KbqDividerModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
