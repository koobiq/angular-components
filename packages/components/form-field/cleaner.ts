import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';

/**
 * Element to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    selector: 'kbq-cleaner',
    imports: [KbqIconModule],
    template: `
        <ng-content />
    `,
    styleUrls: ['cleaner.scss', '../icon/icon-button.scss', '../icon/icon-button-tokens.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqCleaner',
    host: {
        class: 'kbq-cleaner kbq kbq-circle-xmark_16'
    }
})
export class KbqCleaner extends KbqIconButton {
    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.autoColor = true;
    }
}
