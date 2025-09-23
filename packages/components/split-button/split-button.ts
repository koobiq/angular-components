import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqIconModule } from '@koobiq/components/icon';

@Component({
    standalone: true,
    selector: 'kbq-split-button',
    templateUrl: './split-button.html',
    styleUrls: ['./split-button.scss'],
    host: {
        class: 'kbq-split-button'
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        KbqButtonModule,
        KbqIconModule
    ]
})
export class KbqSplitButton {}
