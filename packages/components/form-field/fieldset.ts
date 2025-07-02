import { Component, computed, contentChild, Directive, ElementRef, Signal, ViewEncapsulation } from '@angular/core';

@Component({
    standalone: true,
    selector: 'kbq-fieldset',
    host: {
        class: 'kbq-fieldset',
        role: 'group',
        '[attr.aria-label]': 'ariaLabel()'
    },
    styleUrls: ['./fieldset.scss'],
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
    private readonly legend: Signal<ElementRef<HTMLLegendElement> | undefined> = contentChild(KbqLegend, {
        read: ElementRef
    });

    /** @docs-private */
    protected readonly ariaLabel = computed(() => this.legend()?.nativeElement?.innerText);
}

@Directive({
    standalone: true,
    selector: '[kbqLegend]',
    host: {
        class: 'kbq-legend'
    }
})
export class KbqLegend {}

@Directive({
    standalone: true,
    selector: '[kbqFieldsetItem]',
    host: {
        class: 'kbq-fieldset-item'
    }
})
export class KbqFieldsetItem {}
