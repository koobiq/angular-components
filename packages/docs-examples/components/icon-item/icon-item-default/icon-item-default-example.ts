import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item
 */
@Component({
    selector: 'icon-item-default-example',
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-container layout-column">
            <i kbq-icon-item="kbq-bell_16" [color]="colors.Theme"></i>
        </div>
    `,
    styleUrls: ['icon-item-default-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconItemDefaultExample {
    colors = KbqComponentColors;
}
