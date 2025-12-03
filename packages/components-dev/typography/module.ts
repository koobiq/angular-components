import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

@Component({
    selector: 'dev-app',
    imports: [KbqTableModule],
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
