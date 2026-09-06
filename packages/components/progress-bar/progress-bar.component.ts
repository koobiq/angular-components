import {
    ChangeDetectionStrategy,
    Component,
    Directive,
    ViewEncapsulation,
    computed,
    contentChild,
    input
} from '@angular/core';
import { KbqColorDirective, KbqComponentColors, kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';

/** Whether the bar reports a known share of the work, or an operation whose duration is unknown. */
export type ProgressBarMode = 'determinate' | 'indeterminate';

let idIterator = 0;
let textIdIterator = 0;
let captionIdIterator = 0;

const MIN_PERCENT = 0;
const MAX_PERCENT = 100;

/**
 * Label projected above the bar. Names the bar for assistive tech: `KbqProgressBar` points its
 * `aria-labelledby` at this element.
 */
@Directive({
    selector: '[kbq-progress-bar-text]',
    host: {
        class: 'kbq-progress-bar-text',
        '[attr.id]': 'id()'
    }
})
export class KbqProgressBarText {
    /** Element id. Generated when not supplied, so the bar can always reference it. */
    readonly id = input<string>(`kbq-progress-bar-text-${textIdIterator++}`);
}

/**
 * Caption projected below the bar. Describes the bar for assistive tech: `KbqProgressBar` points its
 * `aria-describedby` at this element.
 */
@Directive({
    selector: '[kbq-progress-bar-caption]',
    host: {
        class: 'kbq-progress-bar-caption',
        '[attr.id]': 'id()'
    }
})
export class KbqProgressBarCaption {
    /** Element id. Generated when not supplied, so the bar can always reference it. */
    readonly id = input<string>(`kbq-progress-bar-caption-${captionIdIterator++}`);
}

/** Horizontal indicator of the progress of an operation. */
@Component({
    selector: 'kbq-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrls: ['./progress-bar.scss', './progress-bar-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[attr.id]': 'id()',
        class: 'kbq-progress-bar',
        role: 'progressbar',
        '[class.kbq-progress-bar_determinate]': '!indeterminate()',
        '[class.kbq-progress-bar_indeterminate]': 'indeterminate()',
        // An indeterminate `progressbar` is expressed by the absence of `aria-valuenow`, so the whole
        // range stays off the element rather than being pinned to zero.
        '[attr.aria-valuemin]': 'indeterminate() ? null : 0',
        '[attr.aria-valuemax]': 'indeterminate() ? null : 100',
        '[attr.aria-valuenow]': 'indeterminate() ? null : percentage()',
        '[attr.aria-label]': 'resolvedAriaLabel()',
        '[attr.aria-labelledby]': 'resolvedAriaLabelledby()',
        '[attr.aria-describedby]': 'caption()?.id() ?? null'
    }
})
export class KbqProgressBar extends KbqColorDirective {
    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    private readonly text = contentChild(KbqProgressBarText);

    protected readonly caption = contentChild(KbqProgressBarCaption);

    /** Id of the host element. Generated when not supplied. */
    readonly id = input<string>(`kbq-progress-bar-${idIterator++}`);

    /** Share of the work that is done, in the `[0, 100]` range. Ignored in indeterminate mode. */
    readonly value = input<number>(0);

    /** Whether the bar reports `value`, or an operation whose duration is unknown. */
    readonly mode = input<ProgressBarMode>('determinate');

    /**
     * Accessible name of the bar. Takes precedence over a projected `[kbq-progress-bar-text]`; when
     * neither is given, the bar falls back to the `progressBar` name from the a11y locale.
     */
    readonly ariaLabel = input<string | null>(null, { alias: 'aria-label' });

    /** Anything other than `indeterminate` reports a value, matching the branch the template renders. */
    protected readonly indeterminate = computed(() => this.mode() === 'indeterminate');

    /** `value` clamped into `[0, 100]`. A non-finite value would be written out as an invalid width. */
    protected readonly percentage = computed(() => {
        const value = this.value();

        return Number.isFinite(value) ? Math.max(MIN_PERCENT, Math.min(MAX_PERCENT, value)) : MIN_PERCENT;
    });

    protected readonly resolvedAriaLabelledby = computed(() => (this.ariaLabel() ? null : (this.text()?.id() ?? null)));

    protected readonly resolvedAriaLabel = computed(
        () => this.ariaLabel() ?? (this.text() ? null : this.a11yLocaleConfiguration().progressBar)
    );

    constructor() {
        super();

        this.color = KbqComponentColors.Theme;
        this.setDefaultColor(KbqComponentColors.Theme);
    }
}
