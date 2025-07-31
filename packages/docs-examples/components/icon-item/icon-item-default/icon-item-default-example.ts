import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Icon-item
 */
@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    selector: 'icon-item-default-example',
    styleUrls: ['icon-item-default-example.css'],
    imports: [
        KbqIconModule
    ],
    template: `
        <div class="example-icon-item-container layout-column">
            <i kbq-icon-item="kbq-bell_16" [color]="colors.Theme"></i>
        </div>
    `
})
export class IconItemDefaultExample {
    colors = KbqComponentColors;
}
