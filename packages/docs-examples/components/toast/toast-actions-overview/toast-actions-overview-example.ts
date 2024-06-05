/* tslint:disable:no-console */
import { Component, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { KbqDropdown } from '@koobiq/components/dropdown';
import { take } from 'rxjs/operators';


/**
 * @title Basic Toast
 */
@Component({
    selector: 'toast-actions-overview-example',
    templateUrl: 'toast-actions-overview-example.html',
    styleUrls: ['toast-actions-overview-example.css'],
    encapsulation: ViewEncapsulation.None
})
export class ToastActionsOverviewExample {
    @ViewChild('dropdown') dropdown: KbqDropdown;

    constructor(private toastService: KbqToastService) {}

    showSingleActionToast(title: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, title, actions });
    }

    showTwoActionToast(actions: TemplateRef<any>) {
        this.toastService.show({ title: 'Доступно обновление компонентов', actions });
    }

    showManyActionToast(actions: TemplateRef<any>) {
        const { ref } = this.toastService.show({
            title: 'Заголовок',
            caption: 'Подзаголовок, подробности',
            actions
        }, 0);
        this.dropdown.closed.pipe(take(1)).subscribe(() => ref.instance.close());
    }
}
