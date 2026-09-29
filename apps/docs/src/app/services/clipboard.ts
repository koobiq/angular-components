import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Injectable } from '@angular/core';
import { KBQ_WINDOW } from '@koobiq/components/core';
import { KbqToastService } from '@koobiq/components/toast';
import { docsTranslate, DocsTranslationKey } from './i18n';
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
    private readonly window = inject(KBQ_WINDOW) as Window & typeof globalThis;

    /** Copies text to the clipboard. Returns whether the copy succeeded. */
    copy(text: string): boolean {
        return this.clipboard.copy(text);
    }

    /** Copies text and, on success, shows the standard localized "Copied" toast. */
    copyWithToast(text: string): boolean {
        const copied = this.copy(text);

        if (copied) this.showToast('success', 'copied');

        return copied;
    }

    /**
     * Copies text that is still loading and shows how it went in a toast: `failedKey` names the failure. Text already at
     * hand goes through `copy` instead.
     *
     * Not the CDK `Clipboard`: it copies synchronously, through a hidden textarea and `execCommand('copy')`, so it needs
     * the text at the moment of the click. Once the text has loaded, the click no longer counts as the user's action,
     * and Safari refuses the copy. A clipboard item written at once, with the text to come, keeps that user activation.
     */
    async copyLaterWithToast(text: Promise<string>, failedKey: DocsTranslationKey): Promise<boolean> {
        const clipboard = this.window.navigator.clipboard;

        try {
            try {
                await clipboard.write([
                    new this.window.ClipboardItem({
                        'text/plain': text.then((value) => new Blob([value], { type: 'text/plain' }))
                    })
                ]);
            } catch {
                // A browser without clipboard items, or without a promise in them, takes the text itself.
                await clipboard.writeText(await text);
            }

            this.showToast('success', 'copied');

            return true;
        } catch {
            this.showToast('error', failedKey);

            return false;
        }
    }

    private showToast(style: 'success' | 'error', key: DocsTranslationKey): void {
        this.toastService.show({ style, title: docsTranslate(key, this.localeService.locale) });
    }
}
