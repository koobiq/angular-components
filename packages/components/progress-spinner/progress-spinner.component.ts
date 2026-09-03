import { _IdGenerator } from '@angular/cdk/a11y';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    Directive,
    inject,
    input,
    numberAttribute,
    ViewEncapsulation
} from '@angular/core';
import { KbqColorDirective, KbqComponentColors, KbqDefaultSizes } from '@koobiq/components/core';

/** Whether the spinner reports a known progress value or spins indefinitely. */
export type ProgressSpinnerMode = 'determinate' | 'indeterminate';

/** Sizes supported by the progress spinner. */
export type ProgressSpinnerSize = Exclude<KbqDefaultSizes, 'normal'>;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;
const MAX_DASH_ARRAY = 295;

const BIG_CIRCLE_RADIUS = '47%';
const COMPACT_CIRCLE_RADIUS = '42.5%';

/** Directive that marks the text of a progress spinner. */
@Directive({
    selector: '[kbq-progress-spinner-text]',
    host: {
        class: 'kbq-progress-spinner-text'
    }
})
export class KbqProgressSpinnerText {}

/** Directive that marks the caption of a progress spinner. */
@Directive({
    selector: '[kbq-progress-spinner-caption]',
    host: {
        class: 'kbq-progress-spinner-caption'
    }
})
export class KbqProgressSpinnerCaption {}

/** Component that reports the progress of an ongoing operation. */
@Component({
    selector: 'kbq-progress-spinner',
    templateUrl: './progress-spinner.component.html',
    styleUrls: ['./progress-spinner.scss', './progress-spinner-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-progress-spinner',
        '[class.kbq-progress-spinner_big]': `size() === 'big'`,
        '[class.kbq-progress-spinner_indeterminate]': `mode() === 'indeterminate'`,
        '[attr.id]': 'id()'
    }
})
export class KbqProgressSpinner extends KbqColorDirective {
    /** Unique id of the spinner. */
    readonly id = input<string>(inject(_IdGenerator).getId('kbq-progress-spinner-'));

    /**
     * Progress of the operation, in percent. Clamped to `[0, 100]` and only rendered in `determinate` mode.
     *
     * Anything that is not a number reads as `0`: the value feeds a `stroke-dashoffset` percentage, and a
     * bare `numberAttribute` would turn a null binding into `NaN%`, which is not a length at all.
     */
    readonly value = input(0, { transform: (value: unknown) => numberAttribute(value, 0) });

    /** Whether the spinner reports `value` or spins indefinitely. */
    readonly mode = input<ProgressSpinnerMode>('determinate');

    /** Size of the spinner. */
    readonly size = input<ProgressSpinnerSize>('compact');

    /** @docs-private */
    protected readonly svgCircleRadius = computed<string>(() =>
        this.size() === 'big' ? BIG_CIRCLE_RADIUS : COMPACT_CIRCLE_RADIUS
    );

    /** @docs-private */
    protected readonly percentage = computed(
        () => Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, this.value())) / MAX_PERCENT
    );

    /** @docs-private */
    protected readonly dashOffsetPercent = computed(() => `${MAX_DASH_ARRAY - this.percentage() * MAX_DASH_ARRAY}%`);

    constructor() {
        super();

        this.color = KbqComponentColors.Theme;
        this.setDefaultColor(KbqComponentColors.Theme);
    }
}
