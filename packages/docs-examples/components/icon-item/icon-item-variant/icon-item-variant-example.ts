import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon Item Variant
 */
@Component({
    selector: 'icon-item-variant-example',
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-layout layout-row">
            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Theme"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Solid</div>
            </div>

            <div class="example-icon-item-container">
                <i kbq-icon-item="kbq-bell_16" [color]="colors.Theme" [fade]="true"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Fade</div>
            </div>
        </div>
    `,
    styleUrls: ['icon-item-variant-example.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconItemVariantExample {
    colors = KbqComponentColors;
}
