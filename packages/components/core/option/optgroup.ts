import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CanDisable, CanDisableCtor, mixinDisabled } from '../common-behaviors';

/** @docs-private */
export class KbqOptgroupBase {}

// tslint:disable-next-line: naming-convention
export const KbqOptgroupMixinBase: CanDisableCtor & typeof KbqOptgroupBase = mixinDisabled(KbqOptgroupBase);

let uniqueOptgroupIdCounter = 0;

/**
 * Component that is used to group instances of `kbq-option`.
 */
@Component({
    selector: 'kbq-optgroup',
    exportAs: 'kbqOptgroup',
    templateUrl: 'optgroup.html',
    styleUrls: ['./optgroup.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    inputs: ['disabled'],
    host: {
        class: 'kbq-optgroup',
        '[class.kbq-disabled]': 'disabled'
    }
})
export class KbqOptgroup extends KbqOptgroupMixinBase implements CanDisable {
    @Input() label: string;

    /** Unique id for the underlying label. */
    labelId: string = `kbq-optgroup-label-${uniqueOptgroupIdCounter++}`;
}
