import { ChangeDetectionStrategy, Component, inject, input, signal, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsClipboardService } from 'src/app/services/clipboard';
import { DocsLocaleState } from 'src/app/services/locale';

const SUCCESS_LABEL_DURATION = 1000;

@Component({
    selector: 'docs-copy-button',
    imports: [
        KbqIconModule,
        KbqLinkModule
    ],
    template: `
        <span
            kbq-link
            pseudo
            role="button"
            tabindex="0"
            [attr.aria-label]="t('copy')"
            (click)="copyContent()"
            (keydown.enter)="copyContent()"
            (keydown.space)="$event.preventDefault(); copyContent()"
        >
            @if (isLabelSuccessVisible()) {
                <i class="kbq kbq-check_16" aria-hidden="true"></i>
                <span class="kbq-link__text" role="status">{{ t('copied') }}</span>
            } @else {
                <i class="kbq kbq-square-multiple-o_16" aria-hidden="true"></i>
            }
        </span>
    `,
    styleUrls: ['./copy-button.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'docs-copy-button'
    }
})
export class DocsCopyButtonComponent extends DocsLocaleState {
    readonly contentToCopy = input<string>('');

    protected readonly isLabelSuccessVisible = signal(false);

    private readonly clipboard = inject(DocsClipboardService);

    copyContent(): void {
        if (!this.contentToCopy() || !this.clipboard.copy(this.contentToCopy())) {
            return;
        }

        this.isLabelSuccessVisible.set(true);

        setTimeout(() => this.isLabelSuccessVisible.set(false), SUCCESS_LABEL_DURATION);
    }
}
