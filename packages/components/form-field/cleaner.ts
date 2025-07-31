import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton, KbqIconModule } from '@koobiq/components/icon';

/**
 * Element to be placed in end of the form field.
 * Resets form control by click.
 */
@Component({
    standalone: true,
    imports: [KbqIconModule],
    selector: 'kbq-cleaner',
    exportAs: 'kbqCleaner',
    template: `
        <ng-content />
    `,
    styleUrls: ['cleaner.scss', '../icon/icon-button.scss', '../icon/icon-button-tokens.scss'],
    host: {
        class: 'kbq-cleaner kbq kbq-xmark-circle_16'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCleaner extends KbqIconButton {
    constructor() {
        super();

        this.color = KbqComponentColors.ContrastFade;
        this.autoColor = true;
    }
}
