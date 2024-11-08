import { NgTemplateOutlet } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { ThemePalette } from '@koobiq/components/core';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Toast types
 */
@Component({
    standalone: true,
    selector: 'toast-types-overview-example',
    templateUrl: 'toast-types-overview-example.html',
    imports: [
        KbqLinkModule,
        NgTemplateOutlet,
        KbqButtonModule
    ]
})
export class ToastTypesOverviewExample {
    themePalette = ThemePalette;

    constructor(private toastService: KbqToastService) {}

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
