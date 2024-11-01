import { Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item color
 */
@Component({
    standalone: true,
    selector: 'icon-item-color-example',
    styleUrl: 'icon-item-color-example.css',
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
                <div class="docs-icon-item-container__name kbq-text-normal">Theme</div>
            </div>

            <div class="docs-icon-item-container">
                <i
                    [color]="colors.Contrast"
                    kbq-icon-item="kbq-bell_16"
                ></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Contrast</div>
            </div>

            <div class="docs-icon-item-container">
                <i
                    [color]="colors.Success"
                    kbq-icon-item="kbq-bell_16"
                ></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Success</div>
            </div>

            <div class="docs-icon-item-container">
                <i
                    [color]="colors.Warning"
                    kbq-icon-item="kbq-bell_16"
                ></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Warning</div>
            </div>

            <div class="docs-icon-item-container">
                <i
                    [color]="colors.Error"
                    kbq-icon-item="kbq-bell_16"
                ></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Error</div>
            </div>
        </div>
    `
})
export class IconItemColorExample {
    colors = KbqComponentColors;
}
