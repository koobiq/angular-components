import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

let uniqueOptgroupIdCounter = 0;

/**
 * Component that is used to group instances of `kbq-option`.
 * When options aren't provided as `ng-content`, used as a Group Header with styling.
 */
@Component({
    selector: 'kbq-optgroup',
    templateUrl: 'optgroup.html',
    styleUrls: ['./optgroup.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-optgroup',
        role: 'group',
        '[attr.aria-labelledby]': 'labelId',
        '[class.kbq-disabled]': 'disabled()'
    },
    exportAs: 'kbqOptgroup'
})
export class KbqOptgroup {
    readonly label = input<string>(undefined!);

    /** Whether the group, and every option in it, is disabled. */
    readonly disabled = input<boolean, boolean | string | null | undefined>(false, { transform: booleanAttribute });

    /** Unique id for the underlying label. */
    labelId: string = `kbq-optgroup-label-${uniqueOptgroupIdCounter++}`;
}
