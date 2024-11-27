import { Component } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqEmptyStateModule } from '@koobiq/components/empty-state';
import { KbqIconModule } from '@koobiq/components/icon';

/**
 * @title Empty-state error
 */
@Component({
    standalone: true,
    selector: 'empty-state-error-example',
    imports: [
        KbqEmptyStateModule,
        KbqButtonModule,
        KbqIconModule
    ],
    template: `
        <kbq-empty-state [errorColor]="true" style="min-height: 216px">
            <i
                [big]="true"
                [color]="'contrast'"
                [fade]="true"
                kbq-empty-state-icon
                kbq-icon-item="kbq-exclamation-triangle_16"
            ></i>
            <div kbq-empty-state-title>Не удалось показать записи</div>
            <div kbq-empty-state-text>
                {{ emptyStateText }}
            </div>
            <div kbq-empty-state-actions>
                <button [color]="'theme'" [kbqStyle]="'transparent'" kbq-button>Обновить</button>
            </div>
        </kbq-empty-state>
    `
})
export class EmptyStateErrorExample {
    emptyStateText = 'Проблема с сетью или подключением к БД. Попробуйте еще раз или обратитесь к администратору.';
}
