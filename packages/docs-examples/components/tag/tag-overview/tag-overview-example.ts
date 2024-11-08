import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCheckboxModule } from '@koobiq/components/checkbox';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Tag
 */
@Component({
    standalone: true,
    selector: 'tag-overview-example',
    imports: [
        KbqTagsModule,
        KbqCheckboxModule,
        KbqIconModule,
        FormsModule
    ],
    template: `
        <div class="layout-margin-bottom-l">
            <kbq-tag
                [color]="colors.Theme"
                [disabled]="disabled"
            >
                <i kbq-icon="kbq-check-circle_16"></i>
                Tag
            </kbq-tag>
        </div>

        <kbq-checkbox
            class="example-margin"
            [(ngModel)]="disabled"
        >
            disabled
        </kbq-checkbox>
    `
})
export class TagOverviewExample {
    colors = KbqComponentColors;
    disabled = false;
}
