import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqHint } from './hint';

/** Error text to be shown below the form field control. */
@Component({
    standalone: true,
    selector: 'kbq-error',
    exportAs: 'kbqError',
    templateUrl: './hint.html',
    styleUrls: ['./hint.scss', './hint-tokens.scss'],
    host: {
        class: 'kbq-error'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqError extends KbqHint {}
