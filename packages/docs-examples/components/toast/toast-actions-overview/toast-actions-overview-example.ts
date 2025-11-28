import { ChangeDetectionStrategy, Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdown, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqLinkModule } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { take } from 'rxjs/operators';

/**
 * @title Toast actions
 */
@Component({
    selector: 'toast-actions-overview-example',
    imports: [
        KbqLinkModule,
        KbqDropdownModule,
        KbqButtonModule
    ],
    templateUrl: 'toast-actions-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastActionsOverviewExample {
    @ViewChild('dropdown') dropdown: KbqDropdown;

    readonly toastService = inject(KbqToastService);

    showSingleActionToast(title: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, title, actions });
    }

    showTwoActionToast(actions: TemplateRef<any>) {
        this.toastService.show({ title: 'Доступно обновление компонентов', actions });
    }

    showManyActionToast(actions: TemplateRef<any>) {
        const { ref } = this.toastService.show(
            {
                title: 'Заголовок',
                caption: 'Подзаголовок, подробности',
                actions
            },
            0
        );

        this.dropdown.closed.pipe(take(1)).subscribe(() => ref.instance.close());
    }
}
