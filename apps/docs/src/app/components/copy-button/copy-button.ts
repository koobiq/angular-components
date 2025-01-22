import { Clipboard } from '@angular/cdk/clipboard';
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsLocale } from 'src/app/constants/locale';
import { DocsLocaleService } from 'src/app/services/locale.service';

@Component({
    standalone: true,
    imports: [
        KbqIconModule,
        KbqLinkModule,
        AsyncPipe
    ],
    selector: 'docs-copy-button',
    template: `
        @let locale = docsLocaleService.changes | async;
        @let isRuLocale = locale === docsLocale.Ru;

        @if (isLabelSuccessVisible) {
            <span disabled kbq-link pseudo>
                <i class="kbq kbq-check_16"></i>
                <span class="kbq-link__text">{{ isRuLocale ? 'Скопировано' : 'Copied' }}</span>
            </span>
        } @else {
            <span kbq-link pseudo>
                <i class="kbq kbq-square-multiple-o_16" (click)="copyContent()"></i>
            </span>
        }
    `,
    styleUrls: ['./copy-button.scss'],
    host: {
        class: 'docs-copy-button'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocsCopyButtonComponent {
    @Input() contentToCopy: string;

    isLabelSuccessVisible = false;

    private readonly clipboard = inject(Clipboard);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    readonly docsLocaleService = inject(DocsLocaleService);

    readonly docsLocale = DocsLocale;

    copyContent(): void {
        if (!this.contentToCopy) {
            return;
        }

        if (this.clipboard.copy(this.contentToCopy)) {
            this.isLabelSuccessVisible = true;

            setTimeout(() => {
                this.isLabelSuccessVisible = false;
                this.changeDetectorRef.markForCheck();
            }, 1000);
        }
    }
}
