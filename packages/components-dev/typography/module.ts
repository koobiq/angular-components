import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqTableModule } from '@koobiq/components/table';

@Component({
    standalone: true,
    imports: [KbqTableModule],
    selector: 'dev-app',
    templateUrl: './template.html',
    styleUrls: ['./styles.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevApp {}
