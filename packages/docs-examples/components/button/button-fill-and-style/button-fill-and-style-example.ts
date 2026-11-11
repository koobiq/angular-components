import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { injectExampleText } from '../l10n';

/**
 * @title Button fill and style
 */
@Component({
    selector: 'button-fill-and-style-example',
    imports: [
        KbqButtonModule
    ],
    templateUrl: 'button-fill-and-style-example.html',
    styleUrls: ['button-fill-and-style-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonFillAndStyleExample {
    protected readonly text = injectExampleText();

    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}
