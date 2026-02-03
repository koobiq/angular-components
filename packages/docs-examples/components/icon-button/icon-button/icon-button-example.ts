import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckbox } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Icon-button
 */
@Component({
    selector: 'icon-button-example',
    imports: [KbqIconButton, KbqCheckbox, FormsModule],
    template: `
        <div class="layout-margin-bottom-l">
            <i
                kbq-icon-button="kbq-magnifying-glass_16"
                [color]="colors.Theme"
                [disabled]="disabled()"
                [small]="false"
            ></i>
        </div>

        <kbq-checkbox [(ngModel)]="disabled">disabled</kbq-checkbox>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconButtonExample {
    disabled = model(false);
    colors = KbqComponentColors;
}
