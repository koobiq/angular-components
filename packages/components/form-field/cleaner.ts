import { ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors, kbqInjectA11yLocaleConfiguration } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';

/**
 * Element to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    selector: 'kbq-cleaner',
    template: `
        <ng-content />
    `,
    styleUrls: ['cleaner.scss', '../icon/icon-button.scss', '../icon/icon-button-tokens.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'kbq-cleaner',
        // The cleaner is an icon-only control: without a role and an accessible name it is announced as an
        // unlabeled focusable graphic.
        role: 'button',
        '[attr.aria-label]': 'accessibleName()'
    },
    exportAs: 'kbqCleaner'
})
export class KbqCleaner extends KbqIconButton {
    private readonly a11yLocaleConfiguration = kbqInjectA11yLocaleConfiguration();

    /** Accessible name of the cleaner. Defaults to the localized "Clear". */
    readonly ariaLabel = input<string | undefined>(undefined, { alias: 'aria-label' });

    /** @docs-private */
    protected readonly accessibleName = computed(() => this.ariaLabel() || this.a11yLocaleConfiguration().clear);

    constructor() {
        super();

        this.setIconName('kbq-circle-xmark_16');
        this.color = KbqComponentColors.ContrastFade;
        this.autoColor = true;
    }
}
