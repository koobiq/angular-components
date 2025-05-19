import { Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title button-fill-and-style-only-icon
 */
@Component({
    standalone: true,
    selector: 'button-fill-and-style-only-icon-example',
    templateUrl: 'button-fill-and-style-only-icon-example.html',
    styleUrls: ['button-fill-and-style-only-icon-example.css'],
    imports: [
        KbqButtonModule,
        KbqIconModule
    ]
})
export class ButtonFillAndStyleOnlyIconExample {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}
