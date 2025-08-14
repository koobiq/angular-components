import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { KbqCleaner, KbqFormFieldModule, KbqLabel } from '@koobiq/components/form-field';
import { KbqInlineEditModule } from '@koobiq/components/inline-edit';
import { KbqInputModule } from '@koobiq/components/input';
import { KbqSelectModule } from '@koobiq/components/select';
import { KbqTagsModule } from '@koobiq/components/tags';

/**
 * @title Inline edit overview
 */
@Component({
    standalone: true,
    imports: [
        KbqInlineEditModule,
        KbqTagsModule,
        KbqFormFieldModule,
        KbqLabel,
        KbqSelectModule,
        KbqCleaner,
        FormsModule,
        KbqInputModule
    ],
    selector: 'inline-edit-overview-example',
    template: `
        <kbq-inline-edit>
            <kbq-label>Field Name</kbq-label>

            <ng-container *kbqInlineEditViewMode>
                <kbq-tag-list>
                    @for (tag of selected; track tag) {
                        <kbq-tag [value]="tag">
                            {{ tag }}
                        </kbq-tag>
                    }
                </kbq-tag-list>
            </ng-container>
            <ng-container *kbqInlineEditEditMode>
                <kbq-form-field>
                    <kbq-select multiple [(value)]="selected">
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
