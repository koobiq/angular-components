import { ChangeDetectionStrategy, Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state error
 */
@Component({
    selector: 'empty-state-error-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state style="min-height: 216px" [errorColor]="true">
            <i
                kbq-empty-state-icon
                kbq-icon-item="kbq-triangle-exclamation_16"
                [big]="true"
                [color]="'contrast'"
                [fade]="true"
            ></i>
            <div kbq-empty-state-title>Не удалось показать записи</div>
            <div kbq-empty-state-text>
                {{ emptyStateText }}
            </div>
            <div kbq-empty-state-actions>
                <button kbq-button [color]="'theme'" [kbqStyle]="'transparent'">Обновить</button>
            </div>
        </kbq-empty-state>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateErrorExample {
    emptyStateText = 'Проблема с сетью или подключением к БД. Попробуйте еще раз или обратитесь к администратору.';
}
