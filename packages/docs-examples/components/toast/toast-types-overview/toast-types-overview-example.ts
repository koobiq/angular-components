import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Toast types
 */
@Component({
    selector: 'toast-types-overview-example',
    imports: [
        KbqLinkModule,
        NgTemplateOutlet,
        KbqButtonModule
    ],
    templateUrl: 'toast-types-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastTypesOverviewExample {
    themePalette = ThemePalette;

    readonly toastService = inject(KbqToastService);

    showContrastToast(actions: TemplateRef<any>) {
        this.toastService.show({
            title: 'Доступно обновление агента',
            caption: 'Версия 2.03.15 от 15 мая 2022',
            actions
        });
    }

    showSuccessToast() {
        this.toastService.show({ style: KbqToastStyle.Success, caption: 'Удалено 13 записей из журнала событий' });
    }

    showWarningToast(actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Warning, caption: 'Ваш пароль истекает через 5 дней', actions });
    }

    showErrorToast(actions: TemplateRef<any>) {
        this.toastService.show({
            style: KbqToastStyle.Error,
            caption: 'Не удалось авторизовать 15 агентов',
            actions
        });
    }
}
