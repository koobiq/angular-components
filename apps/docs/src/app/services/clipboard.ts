import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Injectable } from '@angular/core';
import { KbqToastService } from '@koobiq/components/toast';
import { docsTranslate } from './i18n';
import { DocsLocaleService } from './locale';

/**
 * Single copy-to-clipboard entry point for the docs app. Previously the copy + "Copied" success
 * toast were hand-rolled in three separate places (copy button, code snippet, icon preview modal).
 */
@Injectable({ providedIn: 'root' })
export class DocsClipboardService {
    private readonly clipboard = inject(Clipboard);
    private readonly toastService = inject(KbqToastService);
    private readonly localeService = inject(DocsLocaleService);

    /** Copies text to the clipboard. Returns whether the copy succeeded. */
    copy(text: string): boolean {
        return this.clipboard.copy(text);
    }

    /** Copies text and, on success, shows the standard localized "Copied" toast. */
    copyWithToast(text: string): boolean {
        const copied = this.copy(text);

        if (copied) {
            this.toastService.show({
                style: 'success',
                title: docsTranslate('copied', this.localeService.locale)
            });
        }

        return copied;
    }
}
