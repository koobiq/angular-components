import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon Item Variant
 */
@Component({
    standalone: true,
    selector: 'icon-item-variant-example',
    styleUrl: 'icon-item-variant-example.css',
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="docs-icon-item-layout layout-row">
            <div class="docs-icon-item-container">
                <i
                    [color]="colors.Theme"
                    kbq-icon-item="kbq-bell_16"
                ></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Solid</div>
            </div>

            <div class="docs-icon-item-container">
                <i
                    [color]="colors.Theme"
                    [fade]="true"
                    kbq-icon-item="kbq-bell_16"
                ></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Fade</div>
            </div>
        </div>
    `
})
export class IconItemVariantExample {
    colors = KbqComponentColors;
}
