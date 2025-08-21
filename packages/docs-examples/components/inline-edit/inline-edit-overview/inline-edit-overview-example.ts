import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqBadgeModule } from '@koobiq/components/badge';
import { KbqCleaner, KbqFormFieldModule } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTextareaModule } from '@koobiq/components/textarea';

/**
 * @title Inline edit overview
 */
@Component({
    standalone: true,
    imports: [
        FormsModule,
        KbqInlineEditModule,
        KbqFormFieldModule,
        KbqSelectModule,
        KbqCleaner,
        KbqInputModule,
        KbqTextareaModule,
        KbqBadgeModule
    ],
    selector: 'inline-edit-overview-example',
    template: `
        <kbq-inline-edit showActions>
            <ng-container *kbqInlineEditViewMode>
                <div class="layout-row layout-gap-xxs">
                    @for (badge of selected; track badge) {
                        <kbq-badge>
                            {{ badge }}
                        </kbq-badge>
                    }
                </div>
            </ng-container>
            <ng-container *kbqInlineEditEditMode>
                <kbq-form-field>
                    <kbq-select multiple [(ngModel)]="selected">
                        @for (option of options; track option) {
                            <kbq-option [value]="option">{{ option }}</kbq-option>
                        }
                        <kbq-cleaner #kbqSelectCleaner />
                    </kbq-select>
                </kbq-form-field>
            </ng-container>
        </kbq-inline-edit>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class InlineEditOverviewExample {
    readonly options = Array.from({ length: 5 }).map((_, i) => `Option #${i}`);
    selected: string[] = [];
}
