import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, ViewEncapsulation } from '@angular/core';
import { KbqIconModule } from '@koobiq/components/icon';
import { KbqLinkModule } from '@koobiq/components/link';
import { DocsLocaleState } from 'src/app/services/locale';

@Component({
    standalone: true,
    imports: [
        KbqIconModule,
        KbqLinkModule
    ],
    selector: 'docs-copy-button',
    template: `
        @if (isLabelSuccessVisible) {
            <span disabled kbq-link pseudo>
                <i class="kbq kbq-check_16"></i>
                <span class="kbq-link__text">{{ isRuLocale() ? 'Скопировано' : 'Copied' }}</span>
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
export class DocsCopyButtonComponent extends DocsLocaleState {
    @Input() contentToCopy: string;

    isLabelSuccessVisible = false;

    private readonly clipboard = inject(Clipboard);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    copyContent(): void {
        if (!this.contentToCopy || !this.clipboard.copy(this.contentToCopy)) {
            return;
        }

        this.isLabelSuccessVisible = true;

        setTimeout(() => {
            this.isLabelSuccessVisible = false;
            this.changeDetectorRef.markForCheck();
        }, 1000);
    }
}
