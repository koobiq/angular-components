import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqDividerModule } from '@koobiq/components/divider';

@Component({
    standalone: true,
    imports: [KbqDividerModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
