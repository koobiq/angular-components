import {
    ChangeDetectionStrategy,
    Component,
    computed,
    contentChild,
    Directive,
    ElementRef,
    input,
    Signal,
    ViewEncapsulation
} from '@angular/core';
import { KbqOrientation } from '@koobiq/components/core';

/** Directive for marking an element as legend of `KbqFieldset` */
@Directive({
    selector: '[kbqLegend]',
    host: {
        class: 'kbq-legend'
    }
})
export class KbqLegend {}

/** Directive for marking elements as items inside `KbqFieldset` */
@Directive({
    selector: '[kbqFieldsetItem]',
    host: {
        class: 'kbq-fieldset-item'
    }
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

        <div class="kbq-form-field__hint">
            <ng-content select="kbq-error" />

            <ng-content select="kbq-hint, kbq-password-hint, kbq-reactive-password-hint" />
        </div>
    `,
    styleUrls: ['./fieldset.scss', './fieldset-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'kbq-fieldset',
        '[class]': 'className()',
        role: 'group',
        '[attr.aria-label]': 'ariaLabel()'
    }
})
export class KbqFieldset {
    orientation = input<KbqOrientation>('horizontal');

    private readonly legend: Signal<ElementRef<HTMLElement> | undefined> = contentChild(KbqLegend, {
        read: ElementRef
    });

    /**
     * Computes the aria-label from the inner text of the legend element.
     * Used to enhance accessibility by labeling the group.
     * @docs-private
     */
    protected readonly ariaLabel = computed(() => this.legend()?.nativeElement?.innerText);

    /** @docs-private */
    protected readonly className = computed(() => `kbq-fieldset__${this.orientation()}`);
}
