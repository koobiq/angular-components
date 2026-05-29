import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqHint } from './hint';

/** Error text to be shown below the form field control. */
@Component({
    selector: 'kbq-error',
    templateUrl: './hint.html',
    styleUrls: [
        './hint.scss',
        './hint-tokens.scss'
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-error'
    },
    exportAs: 'kbqError'
})
export class KbqError extends KbqHint {
    constructor() {
        super();

        this.color = KbqComponentColors.Error;
    }
}
