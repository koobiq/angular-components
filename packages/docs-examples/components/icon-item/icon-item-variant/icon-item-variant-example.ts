import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon Item Variant
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'icon-item-variant-example',
    styleUrls: ['icon-item-variant-example.css'],
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-layout layout-row">
            <div class="example-icon-item-container">
                <i [color]="colors.Theme" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Solid</div>
            </div>

            <div class="example-icon-item-container">
                <i [color]="colors.Theme" [fade]="true" kbq-icon-item="kbq-bell_16"></i>
                <div class="example-icon-item-container__name kbq-text-normal">Fade</div>
            </div>
        </div>
    `
})
export class IconItemVariantExample {
    colors = KbqComponentColors;
}
