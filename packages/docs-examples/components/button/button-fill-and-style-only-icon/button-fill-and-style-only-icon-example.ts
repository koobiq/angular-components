import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { TRANSLATIONS } from './l10n';

/**
 * @title button-fill-and-style-only-icon
 */
@Component({
    selector: 'button-fill-and-style-only-icon-example',
    imports: [
        KbqButtonModule,
        KbqIconModule
    ],
    templateUrl: 'button-fill-and-style-only-icon-example.html',
    styleUrls: ['button-fill-and-style-only-icon-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonFillAndStyleOnlyIconExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}
