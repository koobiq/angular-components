import { Component } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';

/**
 * @title Progress bar indeterminate
 */
@Component({
    standalone: true,
    selector: 'progress-bar-indeterminate-example',
    styles: `
        .example-progress-bar-group {
            display: flex;
            flex-direction: column;
        }

        .example-progress-bar {
            margin-bottom: 12px;
        }
    `,
    imports: [
        KbqProgressBarModule
    ],
    template: `
        <div class="example-progress-bar-group">
            <kbq-progress-bar
                class="example-progress-bar"
                [mode]="'indeterminate'"
            />
        </div>
    `
})
export class ProgressBarIndeterminateExample {
    themePalette = ThemePalette;
}
