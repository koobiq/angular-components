import { booleanAttribute, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { KbqColorDirective } from '@koobiq/components/core';

let nextUniqueId = 0;

/** Hint text to be shown below the form field control. */
@Component({
    selector: 'kbq-hint',
    exportAs: 'kbqHint',
    templateUrl: './hint.html',
    styleUrls: ['./hint.scss', './hint-tokens.scss'],
    host: {
        class: 'kbq-hint',
        '[attr.id]': 'id',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqHint extends KbqColorDirective {
    /** Unique ID for the hint. */
    @Input() id: string = `kbq-hint-${nextUniqueId++}`;

    /** Disables `color` for the hint text. */
    @Input({ transform: booleanAttribute }) fillTextOff: boolean = false;

    /** Makes the hint size smaller. */
    @Input({ transform: booleanAttribute }) compact: boolean = false;
}
