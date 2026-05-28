import { booleanAttribute, ChangeDetectionStrategy, Component, Input, input, ViewEncapsulation } from '@angular/core';
import { KbqColorDirective } from '@koobiq/components/core';

let nextUniqueId = 0;

/** Hint text to be shown below the form field control. */
@Component({
    selector: 'kbq-hint',
    templateUrl: './hint.html',
    styleUrls: ['./hint.scss', './hint-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-hint',
        '[attr.id]': 'id()',
        '[class.kbq-hint_fill-text-off]': 'fillTextOff',
        '[class.kbq-hint_compact]': 'compact'
    },
    exportAs: 'kbqHint'
})
export class KbqHint extends KbqColorDirective {
    /** Unique ID for the hint. */
    readonly id = input<string>(`kbq-hint-${nextUniqueId++}`);

    /** Disables `color` for the hint text. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) fillTextOff: boolean = false;

    /** Makes the hint size smaller. */
    // TODO: Skipped for migration because:
    //  Your application code writes to the input. This prevents migration.
    @Input({ transform: booleanAttribute }) compact: boolean = false;
}
