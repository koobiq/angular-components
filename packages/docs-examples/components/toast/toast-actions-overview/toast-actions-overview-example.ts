import { ChangeDetectionStrategy, Component, inject, type TemplateRef, viewChild } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { KbqButtonModule } from '@koobiq/components/button';
import { type KbqDropdown, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';

/**
 * @title Toast actions
 */
@Component({
    selector: 'toast-actions-overview-example',
    imports: [
        KbqLink,
        KbqLinkSuffix,
        KbqDropdownModule,
        KbqButtonModule
    ],
    templateUrl: './toast-actions-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastActionsOverviewExample {
    readonly dropdown = viewChild.required<KbqDropdown>('dropdown');

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

        outputToObservable(this.dropdown().closed)
            .pipe(take(1))
            .subscribe(() => ref.instance.close());
    }
}
