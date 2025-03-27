import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqButtonToggleModule } from '@koobiq/components/button-toggle';
import { KbqDefaultSizes } from '@koobiq/components/core';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state size
 */
@Component({
    standalone: true,
    selector: 'empty-state-size-example',
    imports: [
        FormsModule,
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule,
        KbqButtonToggleModule
    ],
    template: `
        <div>
            <kbq-button-toggle-group [(ngModel)]="size">
                <kbq-button-toggle value="compact">Compact</kbq-button-toggle>
                <kbq-button-toggle value="normal">Normal</kbq-button-toggle>
                <kbq-button-toggle value="big">Big</kbq-button-toggle>
            </kbq-button-toggle-group>
        </div>

        <kbq-empty-state [size]="size()" style="min-height: 216px">
            <div kbq-empty-state-title>No Groups</div>
            <div kbq-empty-state-text>{{ emptyStateText }}</div>
            <div kbq-empty-state-actions>
                <button [color]="'theme'" [kbqStyle]="'transparent'" kbq-button>
                    <i [color]="'theme'" kbq-icon="kbq-plus_16"></i>
                    {{ buttonText }}
                </button>
            </div>
        </kbq-empty-state>
    `
})
export class EmptyStateSizeExample {
    buttonText = 'Create group';
    emptyStateText = 'Agents can be grouped together and assigned the same policies.';
    size = model<KbqDefaultSizes>('compact');
}
