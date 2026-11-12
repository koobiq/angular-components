import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item color
 */
@Component({
    selector: 'icon-item-color-example',
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-layout layout-row">
            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Theme"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Theme</div>
            </div>

            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Contrast"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Contrast</div>
            </div>

            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Success"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Success</div>
            </div>

            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Warning"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Warning</div>
            </div>

            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Error"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Error</div>
            </div>
        </div>
    `,
    styleUrls: ['icon-item-color-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconItemColorExample {
    colors = KbqComponentColors;
}
