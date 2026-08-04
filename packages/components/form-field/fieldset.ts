import { ChangeDetectionStrategy, Component, contentChild, Directive, input, ViewEncapsulation } from '@angular/core';

let nextLegendUniqueId = 0;

/** Directive for marking an element as legend of `KbqFieldset` */
@Directive({
    selector: '[kbqLegend]',
    host: {
        class: 'kbq-legend',
        '[attr.id]': 'id()'
    },
    exportAs: 'kbqLegend'
})
export class KbqLegend {
    /** Unique ID for the legend, referenced by the `aria-labelledby` of the fieldset. */
    readonly id = input<string>(`kbq-legend-${nextLegendUniqueId++}`);
}

/** Directive for marking elements as items inside `KbqFieldset` */
@Directive({
    selector: '[kbqFieldsetItem]',
    host: {
        class: 'kbq-fieldset-item'
    },
    exportAs: 'kbqFieldsetItem'
})
export class KbqFieldsetItem {}

/**
 * A group of form-fields and related controls.
 * Container component emulating the native `fieldset` element.
 */
@Component({
    selector: 'kbq-fieldset',
    template: `
        <ng-content select="[kbqLegend]" />

        <div class="kbq-fieldset__container">
            <ng-content />
        </div>

        <!--
            Mirrors the hint area of KbqFormField. Unlike the form field, the fieldset owns no control, so it has
            no error state to guard the projected kbq-error with — showing it is up to the consumer.
        -->
        <div class="kbq-form-field__hint">
            <ng-content select="kbq-error" />

            <ng-content select="kbq-hint, kbq-password-hint, kbq-reactive-password-hint" />
        </div>
    `,
    styleUrls: ['./fieldset.scss', './fieldset-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-fieldset',
        role: 'group',
        '[attr.aria-labelledby]': 'legend()?.id()'
    },
    exportAs: 'kbqFieldset'
})
export class KbqFieldset {
    /**
     * Labels the group with the projected legend. Referencing the element keeps the accessible name in sync
     * with the visible text, including after a locale change.
     */
    protected readonly legend = contentChild(KbqLegend);
}
