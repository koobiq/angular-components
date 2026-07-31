import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';
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
        '[class.kbq-hint_fill-text-off]': 'fillTextOff()',
        '[class.kbq-hint_compact]': 'compact()'
    },
    exportAs: 'kbqHint'
})
export class KbqHint extends KbqColorDirective {
    /** Unique ID for the hint. Referenced by the `aria-describedby` of the form field control. */
    readonly id = input<string>(`kbq-hint-${nextUniqueId++}`);

    /** Disables `color` for the hint text. */
    readonly fillTextOff = input(false, { transform: booleanAttribute });

    /** Makes the hint size smaller. */
    readonly compact = input(false, { transform: booleanAttribute });
}
