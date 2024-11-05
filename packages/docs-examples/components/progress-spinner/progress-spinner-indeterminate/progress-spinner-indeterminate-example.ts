import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressSpinnerModule } from '@koobiq/components/progress-spinner';

/**
 * @title Progress spinner indeterminate
 */
@Component({
    standalone: true,
    selector: 'progress-spinner-indeterminate-example',
    imports: [
        KbqProgressSpinnerModule
    ],
    template: `
        <div class="layout-row">
            <kbq-progress-spinner
                class="layout-margin-right-s"
                [mode]="'indeterminate'"
            />
        </div>

        <div class="layout-row">
            <kbq-progress-spinner
                class="layout-margin-right-s"
                [mode]="'indeterminate'"
                [size]="'big'"
            />
        </div>
    `
})
export class ProgressSpinnerIndeterminateExample {
    themePalette = ThemePalette;
}
