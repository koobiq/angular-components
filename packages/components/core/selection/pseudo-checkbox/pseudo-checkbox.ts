import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewEncapsulation } from '@angular/core';
import {
    CanColor,
    CanColorCtor,
    CanDisable,
    CanDisableCtor,
    KbqComponentColors,
    mixinColor,
    mixinDisabled
} from '../../common-behaviors';

export type KbqPseudoCheckboxState = 'unchecked' | 'checked' | 'indeterminate';

// Boilerplate for applying mixins to KbqPseudoCheckbox.
/** @docs-private */
export class KbqPseudoCheckboxBase {
    constructor(public elementRef: ElementRef) {}
}

/** @docs-private */
export const KbqPseudoCheckboxMixinBase: CanColorCtor & CanDisableCtor & typeof KbqPseudoCheckboxBase = mixinColor(
    mixinDisabled(KbqPseudoCheckboxBase),
    KbqComponentColors.Theme
);

/**
 * Component that shows a simplified checkbox without including any kind of "real" checkbox.
 * Meant to be used when the checkbox is purely decorative and a large number of them will be
 * included, such as for the options in a multi-select. Uses no SVGs or complex animations.
 * Note that theming is meant to be handled by the parent element, e.g.
 * `kbq-primary .kbq-pseudo-checkbox`.
 *
 * Note that this component will be completely invisible to screen-reader users. This is *not*
 * interchangeable with `<kbq-checkbox>` and should *not* be used if the user would directly
 * interact with the checkbox. The pseudo-checkbox should only be used as an implementation detail
 * of more complex components that appropriately handle selected / checked state.
 * @docs-private
 */
@Component({
    selector: 'kbq-pseudo-checkbox',
    templateUrl: 'pseudo-checkbox.partial.html',
    styleUrls: ['pseudo-checkbox.scss', 'pseudo-checkbox-tokens.scss'],
    host: {
        class: 'kbq-pseudo-checkbox',
        '[class.kbq-checkbox_big]': 'big',
        '[class.kbq-indeterminate]': 'state === "indeterminate"',
        '[class.kbq-checked]': 'state === "checked"',
        '[class.kbq-disabled]': 'disabled'
    },
    preserveWhitespaces: false,
    inputs: ['color'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class KbqPseudoCheckbox extends KbqPseudoCheckboxMixinBase implements CanColor, CanDisable {
    @Input() big: boolean = false;

    @Input() state: KbqPseudoCheckboxState = 'unchecked';

    @Input() disabled: boolean = false;

    constructor(elementRef: ElementRef) {
        super(elementRef);
    }
}
