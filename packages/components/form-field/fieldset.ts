import { Component, computed, contentChild, Directive, ElementRef, Signal, ViewEncapsulation } from '@angular/core';

/**
 * A group of form-fields and related controls.
 * Container component emulating the native <fieldset> element.
 */
@Component({
    standalone: true,
    selector: 'kbq-fieldset',
    host: {
        class: 'kbq-fieldset',
        role: 'group',
        '[attr.aria-label]': 'ariaLabel()'
    },
    styleUrls: ['./fieldset.scss', './fieldset-tokens.scss'],
    template: `
        <ng-content select="[kbqLegend]" />

        <div class="kbq-fieldset__container">
            <ng-content />
        </div>

        <div class="kbq-form-field__hint">
            <ng-content select="kbq-error" />

            <ng-content select="kbq-hint, kbq-password-hint" />
        </div>
    `,
    encapsulation: ViewEncapsulation.None
})
export class KbqFieldset {
    private readonly legend: Signal<ElementRef<HTMLElement> | undefined> = contentChild(KbqLegend, {
        read: ElementRef
    });

    /**
     * Computes the aria-label from the inner text of the legend element.
     * Used to enhance accessibility by labeling the group.
     * @docs-private
     */
    protected readonly ariaLabel = computed(() => this.legend()?.nativeElement?.innerText);
}

/** Directive for marking an element as legend of `KbqFieldset` */
@Directive({
    standalone: true,
    selector: '[kbqLegend]',
    host: {
        class: 'kbq-legend'
    }
})
export class KbqLegend {}

/** Directive for marking elements as items inside `KbqFieldset` */
@Directive({
    standalone: true,
    selector: '[kbqFieldsetItem]',
    host: {
        class: 'kbq-fieldset-item'
    }
})
export class KbqFieldsetItem {}
