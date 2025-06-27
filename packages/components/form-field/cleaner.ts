import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';

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
        <i [autoColor]="true" color="contrast-fade" kbq-icon-button="kbq-xmark-circle_16"></i>
    `,
    styleUrls: ['cleaner.scss'],
    host: {
        class: 'kbq-cleaner'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KbqCleaner {}
