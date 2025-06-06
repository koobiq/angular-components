import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item size
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'icon-item-size-example',
    styleUrls: ['icon-item-size-example.css'],
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="docs-icon-item-layout layout-row">
            <div class="docs-icon-item-container">
                <i [big]="true" [color]="colors.Theme" kbq-icon-item="kbq-bell_16"></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Big</div>
            </div>

            <div class="docs-icon-item-container">
                <i [color]="colors.Theme" kbq-icon-item="kbq-bell_16"></i>
                <div class="docs-icon-item-container__name kbq-text-normal">Normal</div>
            </div>
        </div>
    `
})
export class IconItemSizeExample {
    colors = KbqComponentColors;
}
