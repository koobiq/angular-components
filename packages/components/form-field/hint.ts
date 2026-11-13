import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    InjectionToken,
    input,
    Provider,
    Signal,
    ViewEncapsulation
} from '@angular/core';
import { KbqColorDirective } from '@koobiq/components/core';

/**
 * State that a control gives to the hints projected into it. A hint's own input can only add to it: `[compact]="false"`
 * does not cancel `compact` of the control.
 *
 * @docs-private
 */
export interface KbqHintParentConfig {
    /** Makes the hints smaller, as `KbqHint.compact` does. */
    compact?: Signal<boolean>;
    /** Disables `color` for the hint text, as `KbqHint.fillTextOff` does. */
    fillTextOff?: Signal<boolean>;

    /**
     * Whether the control is disabled. Its hints then show in the disabled color what no `color` paints: a hint
     * without `color` with its icons that have no color of their own, and the text of a hint with `fillTextOff`. A
     * color set on the hint or on its icon wins. A hint has no `disabled` of its own: it is not interactive, so only the
     * state of its control applies.
     */
    disabled?: Signal<boolean>;
}

/**
 * Lets a control set the state of the hints projected into it, so that it does not restyle them.
 *
 * @docs-private
 */
export const KBQ_HINT_PARENT = new InjectionToken<KbqHintParentConfig>('KBQ_HINT_PARENT');

/**
 * Provides `KBQ_HINT_PARENT`. The factory runs in the injection context of the control, so it can inject the control.
 *
 * @docs-private
 */
export const kbqHintParentFactoryProvider = (factory: () => KbqHintParentConfig): Provider => ({
    provide: KBQ_HINT_PARENT,
    useFactory: factory
});

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
        '[class.kbq-hint_fill-text-off]': 'isFillTextOff()',
        '[class.kbq-hint_compact]': 'isCompact()',
        '[class.kbq-hint_disabled]': 'isDisabled()'
    },
    exportAs: 'kbqHint'
})
export class KbqHint extends KbqColorDirective {
    private readonly parent = inject(KBQ_HINT_PARENT, { optional: true });

    /** Unique ID for the hint. Referenced by the `aria-describedby` of the form field control. */
    readonly id = input<string>(`kbq-hint-${nextUniqueId++}`);

    /** Disables `color` for the hint text. */
    readonly fillTextOff = input(false, { transform: booleanAttribute });

    /** Makes the hint size smaller. */
    readonly compact = input(false, { transform: booleanAttribute });

    /** @docs-private */
    protected readonly isFillTextOff = computed(() => this.fillTextOff() || !!this.parent?.fillTextOff?.());

    /** @docs-private */
    protected readonly isCompact: Signal<boolean> = computed(() => this.compact() || !!this.parent?.compact?.());

    /** @docs-private */
    protected readonly isDisabled: Signal<boolean> = computed(() => !!this.parent?.disabled?.());
}
