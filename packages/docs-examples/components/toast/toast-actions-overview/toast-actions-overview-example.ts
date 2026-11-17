import { ChangeDetectionStrategy, Component, inject, TemplateRef, viewChild } from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqDropdown, KbqDropdownModule } from '@koobiq/components/dropdown';
import { KbqLink, KbqLinkSuffix } from '@koobiq/components/link';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { take } from 'rxjs/operators';
import { TRANSLATIONS } from './l10n';

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
    templateUrl: 'toast-actions-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastActionsOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    readonly dropdown = viewChild.required<KbqDropdown>('dropdown');

    readonly toastService = inject(KbqToastService);

    showSingleActionToast(title: TemplateRef<any>, actions: TemplateRef<any>) {
        this.toastService.show({ style: KbqToastStyle.Success, title, actions });
    }

    showTwoActionToast(actions: TemplateRef<any>) {
        this.toastService.show({ title: this.t().updateAvailableComponents, actions });
    }

    showManyActionToast(actions: TemplateRef<any>) {
        const { ref } = this.toastService.show(
            {
                title: this.t().title,
                caption: this.t().subtitleDetails,
                actions
            },
            0
        );

        outputToObservable(this.dropdown().closed)
            .pipe(take(1))
            .subscribe(() => ref.instance.close());
    }
}
