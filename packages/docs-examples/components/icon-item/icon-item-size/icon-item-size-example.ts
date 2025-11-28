import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item size
 */
@Component({
    selector: 'icon-item-size-example',
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-layout layout-row">
            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [big]="true" [color]="colors.Theme"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Big</div>
            </div>

            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Theme"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Normal</div>
            </div>
        </div>
    `,
    styleUrls: ['icon-item-size-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconItemSizeExample {
    colors = KbqComponentColors;
}
