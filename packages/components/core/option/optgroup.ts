import { booleanAttribute, ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

let uniqueOptgroupIdCounter = 0;

/**
 * Component that is used to group instances of `kbq-option`.
 * When options aren't provided as `ng-content`, used as a Group Header with styling.
 */
@Component({
    selector: 'kbq-optgroup',
    exportAs: 'kbqOptgroup',
    templateUrl: 'optgroup.html',
    styleUrls: ['./optgroup.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-optgroup',
        '[class.kbq-disabled]': 'disabled'
    }
})
export class KbqOptgroup {
    @Input() label: string;

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
