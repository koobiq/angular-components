import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, TemplateRef } from '@angular/core';
import { KbqButtonModule } from '@koobiq/components/button';
import { KbqLink } from '@koobiq/components/link';
import { KbqProgressBarModule } from '@koobiq/components/progress-bar';
import { KbqToastService, KbqToastStyle } from '@koobiq/components/toast';
import { injectTranslation } from '@koobiq/docs-examples/i18n';
import { switchMap, timer } from 'rxjs';
import { TRANSLATIONS } from './l10n';

/**
 * @title Toast hide
 */
@Component({
    selector: 'toast-hide-overview-example',
    imports: [
        KbqButtonModule,
        KbqLink,
        KbqProgressBarModule,
        NgTemplateOutlet
    ],
    templateUrl: 'toast-hide-overview-example.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastHideOverviewExample {
    protected readonly t = injectTranslation(TRANSLATIONS);

    progress: boolean;

    readonly toastService = inject(KbqToastService);

    showDefaultToast(actions: TemplateRef<any>) {
        this.toastService.show({
            title: this.t().agentUpdateAvailable,
            caption: this.t().version20315,
            actions
        });
    }

    showPermanentToast(content: TemplateRef<any>, actions: TemplateRef<any>) {
        this.progress = true;
        const { ref } = this.toastService.show(
            {
                title: this.t().importFiles,
                caption: this.t().importProgress,
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
        this.toastService.show({ style: KbqToastStyle.Warning, caption: this.t().passwordExpires, actions });
    }
}
