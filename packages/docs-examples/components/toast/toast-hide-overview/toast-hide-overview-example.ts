import { Component, TemplateRef, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@koobiq/components/core';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { switchMap, timer } from 'rxjs';

/**
 * @title Toast Hide Strategies overview
 */
@Component({
    selector: 'toast-hide-overview-example',
    templateUrl: 'toast-hide-overview-example.html',
    styleUrls: ['toast-hide-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToastHideOverviewExample {
    themePalette = ThemePalette;
    progress: boolean;

    constructor(private toastService: KbqToastService) {}

    showDefaultToast(actions: TemplateRef<any>) {
        this.toastService.show({
            title: 'Доступно обновление агента',
            caption: 'Версия 2.03.15 от 15 мая 2022',
            actions
        });
    }

    showPermanentToast(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.progress = true;
        const { ref } = this.toastService.show(
            {
                title: 'Импорт файлов',
                caption: '12,1 МБ из 85 МБ — осталось 15 мин  ',
                closeButton: false,
                content,
                actions
            },
            0
        );
        timer(2000)
            .pipe(
                switchMap(() => {
                    this.progress = false;
                    return timer(550);
                })
            )
            .subscribe(() => ref.instance.close());
    }

    showWarningToast(actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Warning, caption: 'Ваш пароль истекает через 5 дней', actions });
    }
}
