import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqHint } from './hint';

let nextUniqueId = 0;

/** Error text to be shown below the form field control. */
@Component({
    standalone: true,
    selector: 'kbq-error',
    exportAs: 'kbqError',
    templateUrl: './hint.html',
    host: {
        class: 'kbq-error',
        // disable selector overwrite
        '[class.kbq-error]': 'true'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqError extends KbqHint {
    @Input() id: string = `kbq-error-${nextUniqueId++}`;

    readonly color = KbqComponentColors.Error;
}
