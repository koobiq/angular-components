import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
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
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    exportAs: 'kbqCleaner',
    host: {
        class: 'kbq-cleaner'
    }
})
export class KbqCleaner extends KbqIconButton {
    constructor() {
        super();

        const initialIcon = 'kbq-circle-xmark_16';

        this.iconName = initialIcon;
        this.svgIconName.next(initialIcon);
        this.color = KbqComponentColors.ContrastFade;
        this.autoColor = true;
    }
}
