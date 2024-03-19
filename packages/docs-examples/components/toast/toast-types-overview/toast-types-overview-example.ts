/* tslint:disable:no-console */
import { Component, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqToastService } from '@koobiq/components/toast';


/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-types-overview-example',
    templateUrl: 'toast-types-overview-example.html',
    styleUrls: ['toast-types-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToastTypesOverviewExample {
    themePalette = ThemePalette;

    constructor(private toastService: KbqToastService) {}

    showContrastToast() {
        this.toastService.show({
            title: 'Доступно обновление агента',
            caption: 'Версия 2.03.15 от 15 мая 2022'
        });
    }

    showErrorToast() {
        this.toastService.show({ style: 'error', caption: 'Не удалось авторизовать 15 агентов' });
    }
}
