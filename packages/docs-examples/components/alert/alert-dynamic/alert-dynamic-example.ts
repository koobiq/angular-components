import { FocusMonitor } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { KbqAlert, KbqAlertCloseButton } from '@koobiq/components/alert';
import { KbqButton, KbqButtonCssStyler } from '@koobiq/components/button';
import { KbqComponentColors } from '@koobiq/components/core';
import { KbqIcon, KbqIconButton } from '@koobiq/components/icon';

/**
 * @title Alert dynamic
 */
@Component({
    selector: 'alert-dynamic-example',
    imports: [
        KbqAlert,
        KbqAlertCloseButton,
        KbqButton,
        KbqButtonCssStyler,
        KbqIcon,
        KbqIconButton
    ],
    template: `
        <button #trigger kbq-button (click)="visible.set(true)">Показать оповещение</button>

        @if (visible()) {
            <!-- role="alert" makes assistive technology announce the alert when it is inserted. -->
            <kbq-alert
                class="layout-margin-top-m"
                role="alert"
                [alertColor]="'error'"
                [alertStyle]="'colored'"
                [compact]="true"
                (closed)="dismiss()"
            >
                <i aria-hidden="true" kbq-icon="kbq-triangle-exclamation_16" [color]="colors.Error"></i>
                Не удалось сохранить изменения. Попробуйте ещё раз.
                <button
                    kbq-alert-close-button
                    kbq-icon-button="kbq-xmark-s_16"
                    aria-label="Закрыть"
                    [color]="colors.ContrastFade"
                ></button>
            </kbq-alert>
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'layout-column layout-align-start-start'
    }
})
export class AlertDynamicExample {
    private readonly focusMonitor = inject(FocusMonitor);

    protected readonly colors = KbqComponentColors;
    protected readonly visible = signal(false);
    protected readonly trigger = viewChild('trigger', { read: ElementRef });

    protected dismiss(): void {
        this.visible.set(false);

        // Return focus to the trigger so a keyboard user is not dropped to <body>.
        // `focusVia` (not native `.focus()`) preserves the focus ring.
        const trigger = this.trigger()?.nativeElement;

        if (trigger) {
            this.focusMonitor.focusVia(trigger, 'keyboard');
        }
    }
}
