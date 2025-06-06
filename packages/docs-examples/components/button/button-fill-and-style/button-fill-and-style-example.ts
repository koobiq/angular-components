import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule, KbqButtonStyles } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';

/**
 * @title Button fill and style
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'button-fill-and-style-example',
    templateUrl: 'button-fill-and-style-example.html',
    styleUrls: ['button-fill-and-style-example.css'],
    imports: [
        KbqButtonModule
    ]
})
export class ButtonFillAndStyleExample {
    colors = KbqComponentColors;
    styles = KbqButtonStyles;
}
