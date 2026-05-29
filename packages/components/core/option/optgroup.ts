import { booleanAttribute, ChangeDetectionStrategy, Component, Input, input, ViewEncapsulation } from '@angular/core';

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
        '[class.kbq-disabled]': 'disabled'
    },
    exportAs: 'kbqOptgroup'
})
export class KbqOptgroup {
    readonly label = input<string>(undefined!);

    // TODO: Skipped for migration because:
    //  Accessor inputs cannot be migrated as they are too complex.
    @Input({ transform: booleanAttribute })
    get disabled(): boolean {
        return this._disabled;
    }

    set disabled(value: boolean) {
        if (value !== this.disabled) {
            this._disabled = value;
        }
    }

    private _disabled: boolean = false;

    /** Unique id for the underlying label. */
    labelId: string = `kbq-optgroup-label-${uniqueOptgroupIdCounter++}`;
}
